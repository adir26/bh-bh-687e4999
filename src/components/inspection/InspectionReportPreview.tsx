import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface InspectionReportPreviewProps {
  report: any;
  findings: any[];
  costs: any[];
  signature?: string;
  template?: string;
  logoUrl?: string;
}

export const InspectionReportPreview: React.FC<InspectionReportPreviewProps> = ({
  report,
  findings,
  costs,
  signature,
  template = 'classic',
  logoUrl,
}) => {
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  const getThemeClasses = () => {
    switch (template) {
      case 'modern':
        return {
          headerBg: 'bg-gradient-to-r from-purple-50 to-pink-50',
          headerBorder: 'border-purple-500',
          accentColor: 'text-purple-600',
          primaryColor: 'text-purple-900',
          badgeBg: 'bg-purple-600',
          sectionBg: 'bg-purple-50',
          findingBg: 'bg-purple-50/50',
          findingBorder: 'border-r-purple-500',
        };
      case 'elegant':
        return {
          headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          headerBorder: 'border-emerald-600',
          accentColor: 'text-emerald-600',
          primaryColor: 'text-emerald-900',
          badgeBg: 'bg-emerald-600',
          sectionBg: 'bg-emerald-50',
          findingBg: 'bg-emerald-50/50',
          findingBorder: 'border-r-emerald-500',
        };
      case 'premium':
        return {
          headerBg: 'bg-gradient-to-r from-rose-50 to-red-50',
          headerBorder: 'border-rose-600',
          accentColor: 'text-rose-600',
          primaryColor: 'text-rose-900',
          badgeBg: 'bg-rose-600',
          sectionBg: 'bg-rose-50',
          findingBg: 'bg-rose-50/50',
          findingBorder: 'border-r-rose-500',
        };
      default: // classic
        return {
          headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          headerBorder: 'border-blue-500',
          accentColor: 'text-blue-600',
          primaryColor: 'text-blue-900',
          badgeBg: 'bg-blue-600',
          sectionBg: 'bg-blue-50',
          findingBg: 'bg-blue-50/50',
          findingBorder: 'border-r-blue-500',
        };
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { label: 'קריטי', color: 'bg-red-600' },
      high: { label: 'גבוה', color: 'bg-orange-600' },
      medium: { label: 'בינוני', color: 'bg-yellow-500' },
      low: { label: 'נמוך', color: 'bg-green-600' },
    };
    return config[severity as keyof typeof config] || { label: severity, color: 'bg-gray-600' };
  };

  const theme = getThemeClasses();

  // Group costs by finding
  const costsByFinding = costs.reduce((acc, cost) => {
    if (!acc[cost.item_id]) {
      acc[cost.item_id] = [];
    }
    acc[cost.item_id].push(cost);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate total cost
  const totalCost = costs.reduce((sum, cost) => sum + (cost.total_price || 0), 0);

  return (
    <Card className="max-w-4xl mx-auto shadow-lg animate-fade-in" dir="rtl">
      {template === 'premium' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 -rotate-45">
          <span className="text-9xl font-bold text-gray-400">PREMIUM</span>
        </div>
      )}
      
      <CardContent className="p-8 space-y-6">
        {/* Header */}
        <div className={`${theme.headerBg} ${theme.headerBorder} border-b-4 p-6 rounded-t-lg`}>
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className={`text-4xl font-bold ${theme.primaryColor} mb-2`}>
                דוח בדיקה מקצועי
              </h1>
              <p className="text-muted-foreground text-sm mb-3">
                תאריך: {formatDate(report.created_at)}
              </p>
              <Badge className={`${theme.badgeBg} text-white`}>
                {template === 'premium' ? 'תבנית פרימיום' : 
                 template === 'modern' ? 'תבנית מודרנית' :
                 template === 'elegant' ? 'תבנית אלגנטית' : 'תבנית קלאסית'}
              </Badge>
            </div>
            
            {/* Inspector info and logo on the left */}
            <div className="flex flex-col items-start gap-3">
              {logoUrl && (
                <div className="mr-6">
                  <img 
                    src={logoUrl} 
                    alt="Company Logo" 
                    className="h-20 w-auto object-contain"
                  />
                </div>
              )}
              {report.inspector_name && (
                <div className="text-right space-y-1">
                  <p className={`font-bold text-base ${theme.accentColor}`}>
                    {report.inspector_name}
                  </p>
                  {report.inspector_company && (
                    <p className="text-sm text-muted-foreground">
                      {report.inspector_company}
                    </p>
                  )}
                  {report.inspector_license && (
                    <p className="text-xs text-muted-foreground">
                      רישיון: {report.inspector_license}
                    </p>
                  )}
                  {report.inspector_phone && (
                    <p className="text-xs text-muted-foreground">
                      ☎ {report.inspector_phone}
                    </p>
                  )}
                  {report.inspector_email && (
                    <p className="text-xs text-muted-foreground">
                      ✉ {report.inspector_email}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="space-y-4">
          <h2 className={`text-xl font-bold ${theme.accentColor} ${theme.sectionBg} p-3 rounded-lg`}>
            פרטי הדוח
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <span className="font-bold text-sm">כותרת:</span>
              <p className="mt-1">{report.title || 'ללא כותרת'}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <span className="font-bold text-sm">סטטוס:</span>
              <p className="mt-1">
                {report.status === 'draft' ? 'טיוטה' : report.status === 'final' ? 'סופי' : 'הושלם'}
              </p>
            </div>
            {report.property_address && (
              <div className="bg-muted/30 p-4 rounded-lg border">
                <span className="font-bold text-sm">כתובת נכס:</span>
                <p className="mt-1">{report.property_address}</p>
              </div>
            )}
            {report.client_name && (
              <div className="bg-muted/30 p-4 rounded-lg border">
                <span className="font-bold text-sm">שם לקוח:</span>
                <p className="mt-1">{report.client_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Findings */}
        {findings.length > 0 && (
          <div className="space-y-4">
            <h2 className={`text-xl font-bold ${theme.accentColor} ${theme.sectionBg} p-3 rounded-lg`}>
              ממצאים ({findings.length})
            </h2>
            <div className="space-y-4">
              {findings.map((finding, index) => {
                const severityBadge = getSeverityBadge(finding.severity);
                return (
                  <div 
                    key={finding.id} 
                    className={`${theme.findingBg} ${theme.findingBorder} border-r-4 p-4 rounded-lg shadow-sm`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-lg font-bold flex-1">
                        {index + 1}. {finding.title}
                      </h3>
                      <Badge className={`${severityBadge.color} text-white text-xs`}>
                        {severityBadge.label}
                      </Badge>
                    </div>
                    
                    {finding.description && (
                      <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                        {finding.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      📍 מיקום: {finding.location || 'לא צוין'}
                      {finding.room && ` | 🏠 חדר: ${finding.room}`}
                    </p>

                    {/* Costs for this finding */}
                    {costsByFinding[finding.id] && costsByFinding[finding.id].length > 0 && (
                      <div className="mt-4 overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className={`${theme.sectionBg}`}>
                            <tr>
                              <th className="text-right p-2 font-medium">תיאור</th>
                              <th className="text-center p-2 font-medium w-16">כמות</th>
                              <th className="text-center p-2 font-medium w-16">יחידה</th>
                              <th className="text-center p-2 font-medium w-24">מחיר יחידה</th>
                              <th className="text-left p-2 font-medium w-24">סה"כ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {costsByFinding[finding.id].map((cost) => (
                              <tr key={cost.id} className="border-t">
                                <td className="p-2">{cost.description}</td>
                                <td className="p-2 text-center">{cost.quantity}</td>
                                <td className="p-2 text-center">{cost.unit}</td>
                                <td className="p-2 text-center">{formatCurrency(cost.unit_price)}</td>
                                <td className="p-2 text-left font-bold">{formatCurrency(cost.total_price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cost Summary */}
        {costs.length > 0 && (
          <div className={`${theme.sectionBg} border-2 ${theme.headerBorder} p-6 rounded-lg shadow-md`}>
            <h2 className={`text-xl font-bold ${theme.accentColor} mb-4`}>
              סיכום עלויות
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={`font-bold ${theme.accentColor}`}>מספר ממצאים:</span>
                <span className={`font-bold ${theme.accentColor}`}>{findings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`font-bold ${theme.accentColor}`}>סה"כ פריטי עלות:</span>
                <span className={`font-bold ${theme.accentColor}`}>{costs.length}</span>
              </div>
              <Separator className="my-3" />
              <div className={`flex justify-between text-xl font-bold ${theme.primaryColor} pt-3 border-t-2 ${theme.headerBorder}`}>
                <span>סה"כ עלות משוערת:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signature */}
        {signature && (
          <div className={`bg-muted/30 border-2 ${theme.headerBorder} p-6 rounded-lg`}>
            <h2 className={`text-xl font-bold ${theme.accentColor} mb-4`}>
              חתימה דיגיטלית
            </h2>
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img 
                src={signature} 
                alt="Signature" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              ✓ נחתם בתאריך: {formatDate(new Date().toISOString())}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4 space-y-1">
          <p>דוח זה נוצר באופן אוטומטי על ידי מערכת הבדיקה המקצועית</p>
          <p>תאריך הפקה: {formatDate(new Date().toISOString())}</p>
        </div>
      </CardContent>
    </Card>
  );
};
