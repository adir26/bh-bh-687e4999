import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quotesService, QuoteAppearanceTheme, QuoteShareViewData } from '@/services/quotesService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { showToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { createPdfBlob } from '@/utils/pdf';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const DEFAULT_APPEARANCE: QuoteAppearanceTheme = {
  theme: 'classic',
  primaryColor: '#2563EB',
  accentColor: '#F97316',
  backgroundColor: '#F8FAFC',
  textColor: '#0F172A',
  fontFamily: "'Heebo', 'Assistant', sans-serif",
  bannerImage: null,
  showBanner: true,
};

const parseHexColor = (hex: string): [number, number, number] | null => {
  if (!hex || typeof hex !== 'string') return null;
  const sanitized = hex.replace('#', '');
  if (!([3, 6] as number[]).includes(sanitized.length)) {
    return null;
  }

  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;

  const value = parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return null;
  }

  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ];
};

const hexToRgba = (hex: string, alpha = 1, fallback = `rgba(0, 0, 0, ${alpha})`): string => {
  const rgb = parseHexColor(hex);
  if (!rgb) return fallback;
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const normalizeColor = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim())) {
    return value.trim();
  }
  return fallback;
};

const lightenColor = (hex: string, amount = 0.15): string => {
  const rgb = parseHexColor(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  const lighten = (channel: number) => Math.min(255, Math.round(channel + (255 - channel) * amount));
  const [lr, lg, lb] = [lighten(r), lighten(g), lighten(b)];
  return `#${[lr, lg, lb].map((val) => val.toString(16).padStart(2, '0')).join('')}`;
};

const parseAppearanceSource = (value: unknown): Record<string, any> | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, any>;
      }
    } catch (error) {
      console.warn('[PublicQuoteView] Failed to parse appearance JSON', error);
      return null;
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, any>;
  }

  return null;
};

const buildAppearance = (data?: QuoteShareViewData | null): QuoteAppearanceTheme => {
  if (!data) return DEFAULT_APPEARANCE;

  const rawAppearance =
    data.appearance ||
    parseAppearanceSource((data.quote as any)?.appearance) ||
    parseAppearanceSource((data.quote as any)?.design_settings) ||
    parseAppearanceSource((data.quote as any)?.design) ||
    parseAppearanceSource((data.quote as any)?.branding?.quote) ||
    parseAppearanceSource((data.quote as any)?.public_settings?.quote_appearance) ||
    null;

  const theme =
    rawAppearance?.theme ||
    rawAppearance?.selectedTheme ||
    data.quote.theme ||
    'classic';

  const colors = rawAppearance?.colors || {};

  const primaryColor = normalizeColor(
    rawAppearance?.primaryColor || colors.primary || (data.quote as any)?.primary_color,
    DEFAULT_APPEARANCE.primaryColor,
  );

  const accentColor = normalizeColor(
    rawAppearance?.accentColor || colors.accent || rawAppearance?.secondaryColor,
    DEFAULT_APPEARANCE.accentColor,
  );

  const backgroundColor = normalizeColor(
    rawAppearance?.backgroundColor || colors.background,
    DEFAULT_APPEARANCE.backgroundColor,
  );

  const textColor = normalizeColor(
    rawAppearance?.textColor || colors.text,
    DEFAULT_APPEARANCE.textColor,
  );

  const fontFamily = rawAppearance?.fontFamily || rawAppearance?.font || DEFAULT_APPEARANCE.fontFamily;

  const bannerImage =
    rawAppearance?.bannerImage ||
    rawAppearance?.banner ||
    data.company?.banner_url ||
    DEFAULT_APPEARANCE.bannerImage ||
    null;

  const showBanner = typeof rawAppearance?.showBanner === 'boolean'
    ? rawAppearance.showBanner
    : DEFAULT_APPEARANCE.showBanner ?? true;

  return {
    theme,
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    fontFamily,
    bannerImage,
    showBanner,
  };
};

const getStatusConfig = (status: string, appearance: QuoteAppearanceTheme) => {
  const config: Record<string, { label: string; background: string; color: string }> = {
    draft: {
      label: 'טיוטה',
      background: hexToRgba(appearance.textColor, 0.08, 'rgba(15, 23, 42, 0.08)'),
      color: appearance.textColor,
    },
    sent: {
      label: 'נשלחה',
      background: hexToRgba(appearance.primaryColor, 0.15, 'rgba(37, 99, 235, 0.15)'),
      color: appearance.primaryColor,
    },
    accepted: {
      label: 'אושרה',
      background: hexToRgba('#16A34A', 0.15, 'rgba(22, 163, 74, 0.15)'),
      color: '#15803D',
    },
    rejected: {
      label: 'נדחתה',
      background: hexToRgba('#EF4444', 0.15, 'rgba(239, 68, 68, 0.15)'),
      color: '#B91C1C',
    },
  };

  return config[status] ?? config.draft;
};

const getInitials = (name: string): string => {
  if (!name) return 'BP';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatCurrency = (value: number) => `₪${value.toLocaleString('he-IL')}`;

const formatDate = (value: string) => new Date(value).toLocaleDateString('he-IL');

export default function PublicQuoteView() {
  const { token } = useParams<{ token: string }>();

  const { data: quoteData, isLoading, error } = useQuery({
    queryKey: ['public-quote', token],
    queryFn: async () => {
      if (!token) throw new Error('Token missing');
      return await quotesService.getQuoteByToken(token);
    },
    retry: false,
  });

  const appearance = useMemo(() => buildAppearance(quoteData), [quoteData]);
  const statusConfig = useMemo(
    () => getStatusConfig(quoteData?.quote.status ?? 'draft', appearance),
    [quoteData?.quote.status, appearance]
  );

  const supplierName = quoteData?.company?.name || quoteData?.supplier?.name || 'הספק שלכם';
  const logoUrl = quoteData?.company?.logo_url || quoteData?.supplier?.avatar_url || null;
  const heroBanner = appearance.showBanner ? appearance.bannerImage : null;
  const borderColor = hexToRgba(appearance.primaryColor, 0.12, 'rgba(37, 99, 235, 0.12)');
  const mutedBackground = hexToRgba(appearance.primaryColor, 0.06, 'rgba(37, 99, 235, 0.06)');

  const handleDownloadPDF = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: { token },
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
      } as any);

      if (error) throw error;
      const blob = createPdfBlob(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteData?.quote.id?.slice(0, 8) || token}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success('PDF הורד בהצלחה');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      const message = error?.message || 'שגיאה ביצירת PDF';
      showToast.error(message);
    }
  };

  const handleAccept = async () => {
    if (!quoteData) return;
    try {
      await quotesService.acceptQuote(quoteData.quote.id);
      showToast.success('הצעת המחיר אושרה בהצלחה!');
    } catch (error) {
      console.error('Failed to accept quote:', error);
      showToast.error('שגיאה באישור הצעת המחיר');
    }
  };

  const handleReject = async () => {
    if (!quoteData) return;
    try {
      await quotesService.rejectQuote(quoteData.quote.id);
      showToast.info('הצעת המחיר נדחתה');
    } catch (error) {
      console.error('Failed to reject quote:', error);
      showToast.error('שגיאה בדחיית הצעת המחיר');
    }
  };

  const content = !quoteData ? null : (
    <div
      className="min-h-screen p-4 md:p-6"
      dir="rtl"
      style={{
        backgroundColor: appearance.backgroundColor,
        fontFamily: appearance.fontFamily,
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-xl border backdrop-blur"
        style={{ borderColor: borderColor, backgroundColor: '#FFFFFFF7' }}
      >
          <div className="relative">
            {heroBanner ? (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={heroBanner}
                  alt="מיתוג הספק"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
              </div>
            ) : (
              <div
                className="h-32 w-full"
                style={{
                  background: `linear-gradient(135deg, ${appearance.primaryColor}, ${lightenColor(appearance.primaryColor, 0.3)})`,
                }}
              />
            )}

            <div className="relative px-6 sm:px-10 -mt-16 pb-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 rounded-2xl border-4 border-white shadow-lg">
                    <Avatar className="h-20 w-20">
                      {logoUrl ? (
                        <AvatarImage src={logoUrl} alt={supplierName} />
                      ) : (
                        <AvatarFallback>{getInitials(supplierName)}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="text-white drop-shadow-lg">
                    <p className="text-sm opacity-80">הצעת מחיר מאת</p>
                    <h1 className="text-2xl font-bold">{supplierName}</h1>
                    {quoteData?.company?.tagline && (
                      <p className="text-sm opacity-90">{quoteData.company.tagline}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span
                    className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: statusConfig.background,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                  <div className="text-white/90 text-sm text-shadow-sm">
                    <p>מספר הצעה: {quoteData.quote.id.slice(0, 8).toUpperCase()}</p>
                    <p>תאריך: {formatDate(quoteData.quote.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-10 space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold" style={{ color: appearance.textColor }}>
                {quoteData.quote.title}
              </h2>
              {quoteData.company?.description && (
                <p className="text-sm leading-relaxed" style={{ color: hexToRgba(appearance.textColor, 0.75) }}>
                  {quoteData.company.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: appearance.textColor }}>
                פירוט השירותים/מוצרים
              </h3>
              <div className="rounded-2xl border" style={{ borderColor: borderColor }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: hexToRgba(appearance.primaryColor, 0.08, 'rgba(37, 99, 235, 0.08)') }}>
                      <TableHead className="text-right" style={{ color: appearance.textColor }}>תיאור</TableHead>
                      <TableHead className="text-right w-24" style={{ color: appearance.textColor }}>כמות</TableHead>
                      <TableHead className="text-right w-32" style={{ color: appearance.textColor }}>מחיר ליחידה</TableHead>
                      <TableHead className="text-right w-32" style={{ color: appearance.textColor }}>סכום חלקי</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteData.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-transparent">
                        <TableCell>
                          <div style={{ color: appearance.textColor }}>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm" style={{ color: hexToRgba(appearance.textColor, 0.75) }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell style={{ color: appearance.textColor }}>{item.quantity}</TableCell>
                        <TableCell style={{ color: appearance.textColor }}>
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="font-medium" style={{ color: appearance.textColor }}>
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
              <div
                className="w-full max-w-md rounded-2xl p-5"
                style={{
                  backgroundColor: hexToRgba(appearance.primaryColor, 0.07, 'rgba(37, 99, 235, 0.07)'),
                  border: `1px solid ${hexToRgba(appearance.primaryColor, 0.12, 'rgba(37, 99, 235, 0.12)')}`,
                }}
              >
                <div className="flex justify-between text-sm" style={{ color: hexToRgba(appearance.textColor, 0.85) }}>
                  <span>סכום ביניים</span>
                  <span>{formatCurrency(quoteData.quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: hexToRgba(appearance.textColor, 0.85) }}>
                  <span>
                    מע"מ (
                    {quoteData.quote.subtotal > 0
                      ? ((quoteData.quote.tax_amount / quoteData.quote.subtotal) * 100).toFixed(0)
                      : '17'}%
                    )
                  </span>
                  <span>{formatCurrency(quoteData.quote.tax_amount)}</span>
                </div>
                <div className="flex justify-between items-center border-t mt-3 pt-4" style={{ borderColor: hexToRgba(appearance.primaryColor, 0.2, 'rgba(37, 99, 235, 0.2)') }}>
                  <span className="text-lg font-semibold" style={{ color: appearance.textColor }}>
                    סה"כ לתשלום
                  </span>
                  <span className="text-2xl font-bold" style={{ color: appearance.primaryColor }}>
                    {formatCurrency(quoteData.quote.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {quoteData.quote.notes && (
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: mutedBackground, color: appearance.textColor }}
              >
                <h3 className="font-semibold mb-2">הערות ותנאים</h3>
                <p className="text-sm whitespace-pre-wrap" style={{ color: hexToRgba(appearance.textColor, 0.85) }}>
                  {quoteData.quote.notes}
                </p>
              </div>
            )}

            {Array.isArray(quoteData.company?.services) && quoteData.company?.services?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: appearance.textColor }}>
                  שירותים נוספים
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(quoteData.company?.services as string[]).map((service) => (
                    <span
                      key={service}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: hexToRgba(appearance.accentColor, 0.12, 'rgba(249, 115, 22, 0.12)'),
                        color: appearance.accentColor,
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: hexToRgba(appearance.primaryColor, 0.12, 'rgba(37, 99, 235, 0.12)') }}>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex-1 font-semibold"
                style={{
                  borderColor: appearance.primaryColor,
                  color: appearance.primaryColor,
                }}
              >
                <Download className="w-4 h-4 ml-1" />
                הורד PDF
              </Button>
              {quoteData.quote.status === 'sent' && (
                <>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 font-semibold shadow-sm"
                    style={{
                      backgroundColor: appearance.primaryColor,
                      borderColor: appearance.primaryColor,
                      color: '#FFFFFF',
                    }}
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    אשר הצעה
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="flex-1 font-semibold shadow-sm"
                    style={{
                      backgroundColor: appearance.accentColor,
                      borderColor: appearance.accentColor,
                      color: '#FFFFFF',
                    }}
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    דחה הצעה
                  </Button>
                </>
              )}
              {quoteData.quote.status === 'accepted' && (
                <div
                  className="flex items-center gap-2 flex-1 justify-center rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: hexToRgba(appearance.primaryColor, 0.12, 'rgba(37, 99, 235, 0.12)'),
                    color: appearance.primaryColor,
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">הצעה זו אושרה</span>
                </div>
              )}
              {quoteData.quote.status === 'rejected' && (
                <div
                  className="flex items-center gap-2 flex-1 justify-center rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: hexToRgba('#EF4444', 0.12, 'rgba(239, 68, 68, 0.12)'),
                    color: '#B91C1C',
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">הצעה זו נדחתה</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageBoundary isLoading={isLoading} isError={!!error || !quoteData} error={error}>
      {content}
    </PageBoundary>
  );
}
