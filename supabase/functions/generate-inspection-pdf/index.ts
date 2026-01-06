import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb, PDFFont, PDFPage } from 'https://esm.sh/pdf-lib@1.17.1';
import fontkit from 'https://esm.sh/@pdf-lib/fontkit@1.1.1';

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
  title?: string;
  property_address?: string;
  client_name?: string;
  address?: string;
  project_name?: string;
}

interface InspectionItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  severity: string;
  status?: string;
  category?: string;
}

interface InspectionCost {
  id: string;
  item_id?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total?: number;
}

// Theme colors for different templates
const TEMPLATE_COLORS = {
  classic: { 
    primary: [0.12, 0.23, 0.54] as [number, number, number], // Deep blue
    secondary: [0.23, 0.51, 0.96] as [number, number, number], // Light blue
    accent: [0.94, 0.96, 1.0] as [number, number, number], // Light blue bg
    text: [0.12, 0.16, 0.23] as [number, number, number],
    muted: [0.4, 0.45, 0.51] as [number, number, number],
  },
  modern: { 
    primary: [0.42, 0.13, 0.55] as [number, number, number], // Purple
    secondary: [0.58, 0.27, 0.73] as [number, number, number],
    accent: [0.98, 0.95, 1.0] as [number, number, number],
    text: [0.12, 0.16, 0.23] as [number, number, number],
    muted: [0.4, 0.45, 0.51] as [number, number, number],
  },
  elegant: { 
    primary: [0.13, 0.46, 0.42] as [number, number, number], // Emerald
    secondary: [0.2, 0.6, 0.55] as [number, number, number],
    accent: [0.94, 1.0, 0.98] as [number, number, number],
    text: [0.12, 0.16, 0.23] as [number, number, number],
    muted: [0.4, 0.45, 0.51] as [number, number, number],
  },
  premium: { 
    primary: [0.88, 0.28, 0.35] as [number, number, number], // Rose
    secondary: [0.92, 0.45, 0.5] as [number, number, number],
    accent: [1.0, 0.95, 0.95] as [number, number, number],
    text: [0.12, 0.16, 0.23] as [number, number, number],
    muted: [0.4, 0.45, 0.51] as [number, number, number],
  },
};

const SEVERITY_COLORS: Record<string, [number, number, number]> = {
  critical: [0.86, 0.14, 0.14],
  high: [0.92, 0.38, 0.08],
  medium: [0.85, 0.65, 0.12],
  low: [0.13, 0.55, 0.13],
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

    // Fetch findings - ALWAYS normalize to array to prevent .filter() on null
    const { data: findingsData } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at');
    const findings: InspectionItem[] = Array.isArray(findingsData) ? findingsData : [];

    // Get finding IDs first for fetching related data
    const findingIds = findings.map((f: InspectionItem) => f.id);

    // Fetch costs - via item_id (costs are linked to findings, not directly to reports)
    let costs: InspectionCost[] = [];
    if (findingIds.length > 0) {
      const { data: costsData } = await supabase
        .from('inspection_costs')
        .select('*')
        .in('item_id', findingIds);
      costs = Array.isArray(costsData) ? costsData : [];
    }

    // Fetch media for findings - ALWAYS normalize to array
    let media: any[] = [];
    if (findingIds.length > 0) {
      const { data: mediaData } = await supabase
        .from('inspection_media')
        .select('*')
        .in('item_id', findingIds);
      media = Array.isArray(mediaData) ? mediaData : [];
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load Hebrew fonts from Storage URLs (environment variables)
    let font: PDFFont;
    let boldFont: PDFFont;

    try {
      const REG_URL = Deno.env.get('FONT_HEBREW_REGULAR_URL') || Deno.env.get('PDF_FONT_HE_REGULAR_URL');
      const BOLD_URL = Deno.env.get('FONT_HEBREW_BOLD_URL') || Deno.env.get('PDF_FONT_HE_BOLD_URL');

      if (!REG_URL || !BOLD_URL) {
        throw new Error('FONT_HEBREW_REGULAR_URL / FONT_HEBREW_BOLD_URL not set');
      }

      console.log('Loading Hebrew fonts from URLs...');
      const [regRes, boldRes] = await Promise.all([fetch(REG_URL), fetch(BOLD_URL)]);

      if (!regRes.ok || !boldRes.ok) {
        throw new Error(`Failed to fetch fonts: ${regRes.status}, ${boldRes.status}`);
      }

      const regBytes = new Uint8Array(await regRes.arrayBuffer());
      const boldBytes = new Uint8Array(await boldRes.arrayBuffer());
      font = await pdfDoc.embedFont(regBytes);
      boldFont = await pdfDoc.embedFont(boldBytes);
      console.log('Hebrew fonts loaded successfully');
    } catch (fontError) {
      console.error('Failed to load Hebrew fonts:', fontError);
      return new Response(JSON.stringify({
        error: 'Failed to load Hebrew fonts for PDF generation',
        hint: 'Check FONT_HEBREW_REGULAR_URL and FONT_HEBREW_BOLD_URL secrets'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const colors = TEMPLATE_COLORS[template as keyof typeof TEMPLATE_COLORS] || TEMPLATE_COLORS.classic;
    
    // A4 dimensions
    const pageWidth = 595;
    const pageHeight = 842;
    const marginLeft = 40;
    const marginRight = 40;
    const contentWidth = pageWidth - marginLeft - marginRight;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - 50;

    // Helper: Right-aligned text (for RTL Hebrew)
    const drawRightAligned = (text: string, y: number, size: number, useFont: PDFFont = font, color = rgb(...colors.text)) => {
      const safeText = String(text || '');
      const textWidth = useFont.widthOfTextAtSize(safeText, size);
      page.drawText(safeText, {
        x: pageWidth - marginRight - textWidth,
        y,
        size,
        font: useFont,
        color,
      });
    };

    // Helper: Draw a filled rectangle (for section backgrounds)
    const drawSectionBackground = (y: number, height: number, color: [number, number, number]) => {
      page.drawRectangle({
        x: marginLeft,
        y: y - height + 10,
        width: contentWidth,
        height: height,
        color: rgb(...color),
        borderColor: rgb(...colors.secondary),
        borderWidth: 0.5,
      });
    };

    // Helper: Draw section title with background
    const drawSectionTitle = (title: string, y: number): number => {
      const titleHeight = 30;
      drawSectionBackground(y, titleHeight, colors.accent);
      const textWidth = boldFont.widthOfTextAtSize(title, 14);
      page.drawText(title, {
        x: pageWidth - marginRight - textWidth - 10,
        y: y - 18,
        size: 14,
        font: boldFont,
        color: rgb(...colors.primary),
      });
      return y - titleHeight - 10;
    };

    // Helper: Add new page if needed
    const checkPageBreak = (neededSpace: number): void => {
      if (yPosition < neededSpace + 60) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - 50;
      }
    };

    // Helper: Format currency
    const formatCurrency = (amount: number): string => {
      return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper: Format date
    const formatDate = (dateStr: string): string => {
      try {
        return new Date(dateStr).toLocaleDateString('he-IL');
      } catch {
        return dateStr;
      }
    };

    // ==================== HEADER SECTION ====================
    // Draw header background with gradient effect
    const headerHeight = 100;
    page.drawRectangle({
      x: marginLeft,
      y: yPosition - headerHeight + 20,
      width: contentWidth,
      height: headerHeight,
      color: rgb(...colors.accent),
      borderColor: rgb(...colors.primary),
      borderWidth: 2,
    });

    // Draw bottom border accent
    page.drawRectangle({
      x: marginLeft,
      y: yPosition - headerHeight + 16,
      width: contentWidth,
      height: 4,
      color: rgb(...colors.primary),
    });

    // Premium watermark
    if (template === 'premium') {
      page.drawText('PREMIUM', {
        x: 180,
        y: 420,
        size: 72,
        font: boldFont,
        color: rgb(0.95, 0.95, 0.95),
        rotate: { angle: -45, type: 'degrees' },
        opacity: 0.15,
      });
    }

    // Title on the right (RTL)
    const mainTitle = 'דוח בדיקה מקצועי';
    const titleWidth = boldFont.widthOfTextAtSize(mainTitle, 26);
    page.drawText(mainTitle, {
      x: pageWidth - marginRight - titleWidth - 15,
      y: yPosition - 25,
      size: 26,
      font: boldFont,
      color: rgb(...colors.primary),
    });

    // Date under title
    const dateText = `תאריך: ${formatDate(report.created_at)}`;
    const dateWidth = font.widthOfTextAtSize(dateText, 10);
    page.drawText(dateText, {
      x: pageWidth - marginRight - dateWidth - 15,
      y: yPosition - 45,
      size: 10,
      font,
      color: rgb(...colors.muted),
    });

    // Template badge
    const templateLabels: Record<string, string> = {
      premium: 'תבנית פרימיום',
      modern: 'תבנית מודרנית',
      elegant: 'תבנית אלגנטית',
      classic: 'תבנית קלאסית',
    };
    const badgeText = templateLabels[template] || templateLabels.classic;
    const badgeWidth = font.widthOfTextAtSize(badgeText, 9);
    
    page.drawRectangle({
      x: pageWidth - marginRight - badgeWidth - 30,
      y: yPosition - 68,
      width: badgeWidth + 16,
      height: 18,
      color: rgb(...colors.primary),
      borderRadius: 4,
    });
    page.drawText(badgeText, {
      x: pageWidth - marginRight - badgeWidth - 22,
      y: yPosition - 64,
      size: 9,
      font,
      color: rgb(1, 1, 1),
    });

    // Inspector info on the left
    let inspectorY = yPosition - 20;
    
    // Logo
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
          const maxLogoWidth = 70;
          const maxLogoHeight = 50;
          const scale = Math.min(maxLogoWidth / logoImage.width, maxLogoHeight / logoImage.height);
          page.drawImage(logoImage, {
            x: marginLeft + 15,
            y: inspectorY - 40,
            width: logoImage.width * scale,
            height: logoImage.height * scale,
          });
          inspectorY -= 55;
        }
      } catch (error) {
        console.error('Failed to embed logo:', error);
      }
    }

    // Inspector details
    if (report.inspector_name) {
      page.drawText(String(report.inspector_name), {
        x: marginLeft + 15,
        y: inspectorY,
        size: 11,
        font: boldFont,
        color: rgb(...colors.primary),
      });
      inspectorY -= 14;
    }
    if (report.inspector_company) {
      page.drawText(String(report.inspector_company), {
        x: marginLeft + 15,
        y: inspectorY,
        size: 9,
        font,
        color: rgb(...colors.muted),
      });
      inspectorY -= 12;
    }
    if (report.inspector_license) {
      page.drawText(`רישיון: ${String(report.inspector_license)}`, {
        x: marginLeft + 15,
        y: inspectorY,
        size: 8,
        font,
        color: rgb(...colors.muted),
      });
      inspectorY -= 11;
    }
    if (report.inspector_phone) {
      page.drawText(`☎ ${String(report.inspector_phone)}`, {
        x: marginLeft + 15,
        y: inspectorY,
        size: 8,
        font,
        color: rgb(...colors.muted),
      });
      inspectorY -= 11;
    }
    if (report.inspector_email) {
      page.drawText(`✉ ${String(report.inspector_email)}`, {
        x: marginLeft + 15,
        y: inspectorY,
        size: 8,
        font,
        color: rgb(...colors.muted),
      });
    }

    yPosition -= headerHeight + 20;

    // ==================== REPORT DETAILS SECTION ====================
    yPosition = drawSectionTitle('פרטי הדוח', yPosition);

    // Detail boxes in grid
    const drawDetailBox = (label: string, value: string, x: number, y: number, boxWidth: number): void => {
      const boxHeight = 40;
      page.drawRectangle({
        x,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(0.88, 0.88, 0.88),
        borderWidth: 0.5,
      });
      
      // Label
      const labelWidth = boldFont.widthOfTextAtSize(label, 9);
      page.drawText(label, {
        x: x + boxWidth - labelWidth - 8,
        y: y - 14,
        size: 9,
        font: boldFont,
        color: rgb(...colors.text),
      });
      
      // Value
      const safeValue = String(value || 'לא צוין');
      const valueWidth = font.widthOfTextAtSize(safeValue, 10);
      page.drawText(safeValue, {
        x: x + boxWidth - valueWidth - 8,
        y: y - 30,
        size: 10,
        font,
        color: rgb(...colors.muted),
      });
    };

    const boxWidth = (contentWidth - 15) / 2;
    const reportTitle = report.title || report.project_name || 'ללא כותרת';
    const statusLabel = report.status === 'draft' ? 'טיוטה' : report.status === 'final' ? 'סופי' : 'הושלם';
    
    drawDetailBox('כותרת:', reportTitle, pageWidth - marginRight - boxWidth, yPosition, boxWidth);
    drawDetailBox('סטטוס:', statusLabel, marginLeft, yPosition, boxWidth);
    yPosition -= 50;

    if (report.address || report.property_address) {
      drawDetailBox('כתובת נכס:', report.address || report.property_address || '', pageWidth - marginRight - boxWidth, yPosition, boxWidth);
    }
    if (report.client_name) {
      drawDetailBox('שם לקוח:', report.client_name, marginLeft, yPosition, boxWidth);
    }
    if (report.address || report.property_address || report.client_name) {
      yPosition -= 50;
    }

    yPosition -= 15;

    // ==================== FINDINGS SECTION ====================
    if (findings.length > 0) {
      yPosition = drawSectionTitle(`ממצאים (${findings.length})`, yPosition);

      for (let i = 0; i < findings.length; i++) {
        const finding = findings[i];
        checkPageBreak(120);

        // Finding card background with colored left border
        const findingHeight = 80;
        const severityColor = SEVERITY_COLORS[finding.severity] || [0.5, 0.5, 0.5];
        
        // Card background
        page.drawRectangle({
          x: marginLeft,
          y: yPosition - findingHeight,
          width: contentWidth,
          height: findingHeight,
          color: rgb(...colors.accent),
          opacity: 0.3,
        });

        // Left border (RTL: appears on right)
        page.drawRectangle({
          x: pageWidth - marginRight - 4,
          y: yPosition - findingHeight,
          width: 4,
          height: findingHeight,
          color: rgb(...severityColor),
        });

        // Finding number and title
        const findingTitle = `${i + 1}. ${finding.title || 'ללא כותרת'}`;
        const titleFontWidth = boldFont.widthOfTextAtSize(findingTitle, 12);
        page.drawText(findingTitle, {
          x: pageWidth - marginRight - titleFontWidth - 12,
          y: yPosition - 18,
          size: 12,
          font: boldFont,
          color: rgb(...colors.text),
        });

        // Severity badge
        const severityLabel = SEVERITY_LABELS[finding.severity] || finding.severity || 'לא ידוע';
        const badgeLabelWidth = font.widthOfTextAtSize(severityLabel, 8);
        page.drawRectangle({
          x: marginLeft + 10,
          y: yPosition - 22,
          width: badgeLabelWidth + 12,
          height: 16,
          color: rgb(...severityColor),
        });
        page.drawText(severityLabel, {
          x: marginLeft + 16,
          y: yPosition - 18,
          size: 8,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        // Description
        if (finding.description) {
          const desc = String(finding.description);
          const truncatedDesc = desc.length > 80 ? desc.substring(0, 80) + '...' : desc;
          const descWidth = font.widthOfTextAtSize(truncatedDesc, 9);
          page.drawText(truncatedDesc, {
            x: pageWidth - marginRight - descWidth - 12,
            y: yPosition - 38,
            size: 9,
            font,
            color: rgb(...colors.muted),
          });
        }

        // Location
        const locationText = `📍 מיקום: ${finding.location || 'לא צוין'}`;
        const locationWidth = font.widthOfTextAtSize(locationText, 8);
        page.drawText(locationText, {
          x: pageWidth - marginRight - locationWidth - 12,
          y: yPosition - 55,
          size: 8,
          font,
          color: rgb(...colors.muted),
        });

        yPosition -= findingHeight + 10;

        // Finding media/images
        const findingMedia = media.filter((m: any) => m.item_id === finding.id && m.type === 'photo');
        if (findingMedia.length > 0) {
          checkPageBreak(90);
          let mediaX = pageWidth - marginRight - 10;
          
          for (const mediaItem of findingMedia.slice(0, 3)) {
            try {
              const imgResponse = await fetch(mediaItem.url);
              if (imgResponse.ok) {
                const imgBytes = await imgResponse.arrayBuffer();
                const contentType = imgResponse.headers.get('content-type') || '';
                
                let embeddedImg;
                if (contentType.includes('png')) {
                  embeddedImg = await pdfDoc.embedPng(imgBytes);
                } else if (contentType.includes('jpg') || contentType.includes('jpeg')) {
                  embeddedImg = await pdfDoc.embedJpg(imgBytes);
                }
                
                if (embeddedImg) {
                  const maxWidth = 100;
                  const maxHeight = 70;
                  const scale = Math.min(maxWidth / embeddedImg.width, maxHeight / embeddedImg.height);
                  const imgWidth = embeddedImg.width * scale;
                  const imgHeight = embeddedImg.height * scale;
                  
                  mediaX -= imgWidth + 10;
                  page.drawImage(embeddedImg, {
                    x: mediaX,
                    y: yPosition - imgHeight,
                    width: imgWidth,
                    height: imgHeight,
                  });
                  
                  // Image border
                  page.drawRectangle({
                    x: mediaX - 1,
                    y: yPosition - imgHeight - 1,
                    width: imgWidth + 2,
                    height: imgHeight + 2,
                    borderColor: rgb(0.85, 0.85, 0.85),
                    borderWidth: 1,
                  });
                }
              }
            } catch (imgError) {
              console.warn('Failed to embed media image:', imgError);
            }
          }
          
          if (findingMedia.length > 0) {
            yPosition -= 80;
          }
        }

        // Costs for this finding
        const findingCosts = costs.filter((c) => c.item_id === finding.id);
        if (findingCosts.length > 0) {
          checkPageBreak(60 + findingCosts.length * 18);

          // Cost table header
          const tableY = yPosition;
          const colWidths = [180, 50, 60, 80, 80]; // description, qty, unit, unit_price, total
          const tableWidth = colWidths.reduce((a, b) => a + b, 0);
          const tableX = pageWidth - marginRight - tableWidth - 10;

          page.drawRectangle({
            x: tableX,
            y: tableY - 20,
            width: tableWidth,
            height: 20,
            color: rgb(...colors.accent),
          });

          const headers = ['תיאור', 'כמות', 'יחידה', 'מחיר יחידה', 'סה"כ'];
          let headerX = tableX + tableWidth;
          for (let h = 0; h < headers.length; h++) {
            headerX -= colWidths[h];
            const headerWidth = boldFont.widthOfTextAtSize(headers[h], 8);
            page.drawText(headers[h], {
              x: headerX + colWidths[h] - headerWidth - 5,
              y: tableY - 14,
              size: 8,
              font: boldFont,
              color: rgb(...colors.text),
            });
          }

          yPosition -= 22;

          // Cost rows
          for (const cost of findingCosts) {
            const total = cost.total ?? (Number(cost.quantity || 0) * Number(cost.unit_price || 0));
            const rowData = [
              String(cost.description || ''),
              String(cost.quantity || 1),
              String(cost.unit || 'יח\''),
              formatCurrency(Number(cost.unit_price || 0)),
              formatCurrency(total),
            ];

            page.drawRectangle({
              x: tableX,
              y: yPosition - 16,
              width: tableWidth,
              height: 16,
              borderColor: rgb(0.9, 0.9, 0.9),
              borderWidth: 0.5,
            });

            let cellX = tableX + tableWidth;
            for (let c = 0; c < rowData.length; c++) {
              cellX -= colWidths[c];
              const cellText = rowData[c].length > 25 ? rowData[c].substring(0, 22) + '...' : rowData[c];
              const cellFont = c === 4 ? boldFont : font;
              const cellWidth = cellFont.widthOfTextAtSize(cellText, 8);
              page.drawText(cellText, {
                x: cellX + colWidths[c] - cellWidth - 5,
                y: yPosition - 12,
                size: 8,
                font: cellFont,
                color: rgb(...colors.text),
              });
            }
            yPosition -= 18;
          }
          yPosition -= 10;
        }

        yPosition -= 10;
      }
    } else {
      // No findings message
      yPosition = drawSectionTitle('ממצאים', yPosition);
      const noFindingsText = 'לא נמצאו ממצאים בדוח זה';
      const noFindingsWidth = font.widthOfTextAtSize(noFindingsText, 11);
      page.drawText(noFindingsText, {
        x: pageWidth - marginRight - noFindingsWidth - 10,
        y: yPosition - 20,
        size: 11,
        font,
        color: rgb(...colors.muted),
      });
      yPosition -= 40;
    }

    // ==================== COST SUMMARY SECTION ====================
    if (costs.length > 0) {
      checkPageBreak(120);
      
      // Summary box
      const summaryHeight = 100;
      page.drawRectangle({
        x: marginLeft,
        y: yPosition - summaryHeight,
        width: contentWidth,
        height: summaryHeight,
        color: rgb(...colors.accent),
        borderColor: rgb(...colors.primary),
        borderWidth: 2,
      });

      // Title
      const summaryTitle = 'סיכום עלויות';
      const summaryTitleWidth = boldFont.widthOfTextAtSize(summaryTitle, 16);
      page.drawText(summaryTitle, {
        x: pageWidth - marginRight - summaryTitleWidth - 15,
        y: yPosition - 25,
        size: 16,
        font: boldFont,
        color: rgb(...colors.primary),
      });

      // Stats
      const findingsCountText = `מספר ממצאים: ${findings.length}`;
      const findingsCountWidth = font.widthOfTextAtSize(findingsCountText, 10);
      page.drawText(findingsCountText, {
        x: pageWidth - marginRight - findingsCountWidth - 15,
        y: yPosition - 45,
        size: 10,
        font,
        color: rgb(...colors.primary),
      });

      const costsCountText = `סה"כ פריטי עלות: ${costs.length}`;
      const costsCountWidth = font.widthOfTextAtSize(costsCountText, 10);
      page.drawText(costsCountText, {
        x: pageWidth - marginRight - costsCountWidth - 15,
        y: yPosition - 60,
        size: 10,
        font,
        color: rgb(...colors.primary),
      });

      // Total line
      page.drawRectangle({
        x: marginLeft + 15,
        y: yPosition - 75,
        width: contentWidth - 30,
        height: 2,
        color: rgb(...colors.primary),
      });

      // Total amount
      const totalCost = costs.reduce((sum: number, c) => {
        const lineTotal = c.total ?? (Number(c.quantity || 0) * Number(c.unit_price || 0));
        return sum + lineTotal;
      }, 0);
      const totalText = `סה"כ עלות משוערת: ${formatCurrency(totalCost)}`;
      const totalWidth = boldFont.widthOfTextAtSize(totalText, 14);
      page.drawText(totalText, {
        x: pageWidth - marginRight - totalWidth - 15,
        y: yPosition - 95,
        size: 14,
        font: boldFont,
        color: rgb(...colors.primary),
      });

      yPosition -= summaryHeight + 20;
    }

    // ==================== SIGNATURE SECTION ====================
    if (includeSignature && (report as InspectionReport).signature_data) {
      checkPageBreak(100);

      const sigHeight = 80;
      page.drawRectangle({
        x: marginLeft,
        y: yPosition - sigHeight,
        width: contentWidth,
        height: sigHeight,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(...colors.primary),
        borderWidth: 2,
      });

      const sigTitle = 'חתימה דיגיטלית';
      const sigTitleWidth = boldFont.widthOfTextAtSize(sigTitle, 14);
      page.drawText(sigTitle, {
        x: pageWidth - marginRight - sigTitleWidth - 15,
        y: yPosition - 20,
        size: 14,
        font: boldFont,
        color: rgb(...colors.primary),
      });

      // Try to embed signature image
      try {
        const sigData = (report as InspectionReport).signature_data!;
        if (sigData.startsWith('data:image')) {
          const base64Data = sigData.split(',')[1];
          const sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const sigImage = await pdfDoc.embedPng(sigBytes);
          const sigScale = Math.min(80 / sigImage.width, 40 / sigImage.height);
          page.drawImage(sigImage, {
            x: pageWidth - marginRight - sigImage.width * sigScale - 15,
            y: yPosition - 70,
            width: sigImage.width * sigScale,
            height: sigImage.height * sigScale,
          });
        }
      } catch (sigError) {
        console.warn('Failed to embed signature:', sigError);
        page.drawText('✓ [חתימה]', {
          x: pageWidth - marginRight - 60,
          y: yPosition - 50,
          size: 10,
          font,
          color: rgb(...colors.muted),
        });
      }

      const sigDateText = `✓ נחתם בתאריך: ${formatDate(new Date().toISOString())}`;
      const sigDateWidth = font.widthOfTextAtSize(sigDateText, 9);
      page.drawText(sigDateText, {
        x: pageWidth - marginRight - sigDateWidth - 15,
        y: yPosition - sigHeight + 10,
        size: 9,
        font,
        color: rgb(...colors.muted),
      });

      yPosition -= sigHeight + 20;
    }

    // ==================== FOOTER ====================
    const footerY = 35;
    page.drawRectangle({
      x: marginLeft,
      y: footerY - 5,
      width: contentWidth,
      height: 1,
      color: rgb(0.85, 0.85, 0.85),
    });

    const footerLine1 = 'דוח זה נוצר באופן אוטומטי על ידי מערכת הבדיקה המקצועית';
    const footerLine2 = `תאריך הפקה: ${formatDate(new Date().toISOString())}`;
    
    page.drawText(footerLine1, {
      x: (pageWidth - font.widthOfTextAtSize(footerLine1, 8)) / 2,
      y: footerY - 20,
      size: 8,
      font,
      color: rgb(...colors.muted),
    });
    page.drawText(footerLine2, {
      x: (pageWidth - font.widthOfTextAtSize(footerLine2, 8)) / 2,
      y: footerY - 32,
      size: 8,
      font,
      color: rgb(...colors.muted),
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

        await supabase
          .from('inspection_reports')
          .update({ final_pdf_path: fileName })
          .eq('id', reportId);

        const { error: evErr } = await supabase.from('pdf_events').insert({
          report_id: reportId,
          context: 'inspection',
          event_type: 'generate',
          meta: { upload: true, path: fileName }
        });
        if (evErr) console.warn('pdf_events insert failed:', evErr);

        return new Response(JSON.stringify({ ok: true, url: urlData.publicUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { error: evErr } = await supabase.from('pdf_events').insert({
      report_id: reportId,
      context: 'inspection',
      event_type: 'generate',
      meta: { upload: false }
    });
    if (evErr) console.warn('pdf_events insert failed:', evErr);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-report-${reportId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating inspection PDF:', error);
    
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: logErr } = await supabase.from('pdf_events').insert({
        context: 'inspection',
        event_type: 'error',
        meta: { message: String((error as Error).message || error) }
      });
      if (logErr) console.warn('failed to log pdf_events error:', logErr);
    } catch (_) {
      // Don't block client response if logging fails
    }
    
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler);
