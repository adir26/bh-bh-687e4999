import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateInspectionPDFRequest {
  reportId: string;
  template?: 'classic' | 'modern' | 'elegant' | 'premium';
  includeSignature?: boolean;
  upload?: boolean;
}

interface InspectionReport {
  id: string;
  report_type: string;
  status: string;
  notes?: string;
  created_at: string;
  inspector_name?: string;
  inspector_company?: string;
  inspector_license?: string;
  inspector_phone?: string;
  inspector_email?: string;
  logo_url?: string;
  template?: string;
  signature_data?: string;
}

interface InspectionItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  severity: string;
  status: string;
}

interface InspectionCost {
  id: string;
  item_id?: string;
  description: string;
  amount: number;
}

const TEMPLATE_COLORS = {
  classic: { primary: [0.2, 0.4, 0.8] as [number, number, number], secondary: [0.5, 0.5, 0.5] as [number, number, number] },
  modern: { primary: [0.1, 0.6, 0.9] as [number, number, number], secondary: [0.3, 0.3, 0.3] as [number, number, number] },
  elegant: { primary: [0.4, 0.2, 0.6] as [number, number, number], secondary: [0.6, 0.6, 0.6] as [number, number, number] },
  premium: { primary: [0.8, 0.6, 0.2] as [number, number, number], secondary: [0.4, 0.4, 0.4] as [number, number, number] },
};

const SEVERITY_COLORS: Record<string, [number, number, number]> = {
  critical: [0.9, 0.1, 0.1],
  high: [0.9, 0.5, 0.1],
  medium: [0.9, 0.8, 0.1],
  low: [0.3, 0.7, 0.3],
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'קריטי',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reportId, template = 'classic', includeSignature = false, upload = false }: GenerateInspectionPDFRequest = await req.json();

    if (!reportId) {
      return new Response(JSON.stringify({ error: 'reportId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('inspection_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch findings
    const { data: findings = [] } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at');

    // Fetch costs
    const { data: costs = [] } = await supabase
      .from('inspection_costs')
      .select('*')
      .eq('report_id', reportId);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Embed Hebrew-supporting fonts from local files
    const regularFontBytes = await Deno.readFile(new URL('./NotoSansHebrew-Regular.ttf', import.meta.url));
    const boldFontBytes = await Deno.readFile(new URL('./NotoSansHebrew-Bold.ttf', import.meta.url));
    const font = await pdfDoc.embedFont(regularFontBytes, { subset: true });
    const boldFont = await pdfDoc.embedFont(boldFontBytes, { subset: true });

    const colors = TEMPLATE_COLORS[template as keyof typeof TEMPLATE_COLORS] || TEMPLATE_COLORS.classic;
    let yPosition = 800;

    // Add watermark for premium template
    if (template === 'premium') {
      page.drawText('PREMIUM', {
        x: 200,
        y: 420,
        size: 80,
        font: boldFont,
        color: rgb(0.95, 0.95, 0.95),
        rotate: { angle: -45, type: 'degrees' },
      });
    }

    // Header section with logo on left
    if (report.logo_url) {
      try {
        const logoResponse = await fetch(report.logo_url);
        const logoBytes = await logoResponse.arrayBuffer();
        const contentType = logoResponse.headers.get('content-type') || '';
        
        let logoImage;
        if (contentType.includes('png')) {
          logoImage = await pdfDoc.embedPng(logoBytes);
        } else if (contentType.includes('jpg') || contentType.includes('jpeg')) {
          logoImage = await pdfDoc.embedJpg(logoBytes as ArrayBuffer);
        }

        if (logoImage) {
          const logoDims = logoImage.scale(0.15);
          page.drawImage(logoImage, {
            x: 50,
            y: yPosition - 60,
            width: Math.min(logoDims.width, 80),
            height: Math.min(logoDims.height, 80),
          });
        }
      } catch (error) {
        console.error('Failed to embed logo:', error);
      }
    }

    // Inspector details on the left
    if (report.inspector_name || report.inspector_company) {
      let inspectorY = yPosition - 80;
      page.drawText('פרטי הבודק', {
        x: 50,
        y: inspectorY,
        size: 10,
        font: boldFont,
        color: rgb(...colors.primary),
      });
      inspectorY -= 15;

      if (report.inspector_name) {
        page.drawText(String(report.inspector_name), { x: 50, y: inspectorY, size: 9, font });
        inspectorY -= 12;
      }
      if (report.inspector_company) {
        page.drawText(String(report.inspector_company), { x: 50, y: inspectorY, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
        inspectorY -= 12;
      }
      if (report.inspector_license) {
        page.drawText(`רישיון: ${String(report.inspector_license)}`, { x: 50, y: inspectorY, size: 8, font });
        inspectorY -= 12;
      }
      if (report.inspector_phone) {
        page.drawText(`טלפון: ${String(report.inspector_phone)}`, { x: 50, y: inspectorY, size: 8, font });
        inspectorY -= 12;
      }
      if (report.inspector_email) {
        page.drawText(String(report.inspector_email), { x: 50, y: inspectorY, size: 8, font });
      }
    }

    // Title on the right (Hebrew)
    page.drawText('דוח בדק בית', {
      x: 450,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(...colors.primary),
    });
    yPosition -= 30;

    page.drawText(`תבנית: ${template}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font,
      color: rgb(...colors.secondary),
    });
    yPosition -= 15;

    const reportDate = new Date(report.created_at).toLocaleDateString('he-IL');
    page.drawText(`תאריך: ${reportDate}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font,
    });
    yPosition -= 40;

    // Report details section
    page.drawText('פרטי הדוח', {
      x: 450,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(...colors.primary),
    });
    yPosition -= 20;

    page.drawText(`סוג: ${String(report.report_type)}`, { x: 450, y: yPosition, size: 10, font });
    yPosition -= 15;
    page.drawText(`סטטוס: ${String(report.status)}`, { x: 450, y: yPosition, size: 10, font });
    yPosition -= 30;

    // Findings section
    if (findings.length > 0) {
      page.drawText('ממצאים', {
        x: 450,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(...colors.primary),
      });
      yPosition -= 20;

      for (const finding of findings as InspectionItem[]) {
        if (yPosition < 100) break; // Prevent overflow (add pagination if needed)

        const severityColor = SEVERITY_COLORS[(finding as any).severity] || [0.5, 0.5, 0.5];
        const severityLabel = SEVERITY_LABELS[(finding as any).severity] || (finding as any).severity;

        // Draw severity badge
        page.drawRectangle({
          x: 500,
          y: yPosition - 2,
          width: 40,
          height: 12,
          color: rgb(...severityColor),
        });
        page.drawText(String(severityLabel), {
          x: 505,
          y: yPosition,
          size: 8,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        // Finding title
        page.drawText(String((finding as any).title), {
          x: 450,
          y: yPosition,
          size: 10,
          font: boldFont,
        });
        yPosition -= 12;

        if ((finding as any).description) {
          const descSrc = String((finding as any).description);
          const desc = descSrc.substring(0, 60) + (descSrc.length > 60 ? '...' : '');
          page.drawText(desc, { x: 450, y: yPosition, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
          yPosition -= 12;
        }

        if ((finding as any).location) {
          page.drawText(`מיקום: ${String((finding as any).location)}`, { x: 450, y: yPosition, size: 8, font });
          yPosition -= 15;
        }

        // Associated costs
        const findingCosts = (costs as InspectionCost[]).filter((c) => c.item_id === (finding as any).id);
        if (findingCosts.length > 0) {
          for (const cost of findingCosts) {
            page.drawText(`${String(cost.description)}: ₪${Number(cost.amount).toLocaleString()}`, {
              x: 460,
              y: yPosition,
              size: 8,
              font,
              color: rgb(0.5, 0.5, 0.5),
            });
            yPosition -= 12;
          }
        }

        yPosition -= 5;
      }
    }

    // Cost summary
    yPosition -= 20;
    const totalCost = (costs as InspectionCost[]).reduce((sum: number, c) => sum + Number(c.amount || 0), 0);
    page.drawText('סיכום עלויות', {
      x: 450,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(...colors.primary),
    });
    yPosition -= 20;
    page.drawText(`סה"כ משוער: ₪${totalCost.toLocaleString()}`, {
      x: 450,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    // Signature
    if (includeSignature && (report as InspectionReport).signature_data) {
      yPosition -= 40;
      page.drawText('חתימה דיגיטלית', {
        x: 450,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 15;
      page.drawText('[חתימה]', { x: 450, y: yPosition, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
    }

    // Footer
    page.drawText(`נוצר באמצעות המערכת - ${new Date().toLocaleDateString('he-IL')}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // Upload to storage if requested
    if (upload) {
      const fileName = `report-${reportId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('inspection-reports')
        .upload(fileName, pdfBytes, { contentType: 'application/pdf' });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('inspection-reports')
          .getPublicUrl(fileName);

        return new Response(JSON.stringify({ url: urlData.publicUrl, bytes: Array.from(pdfBytes) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-report-${reportId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating inspection PDF:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
