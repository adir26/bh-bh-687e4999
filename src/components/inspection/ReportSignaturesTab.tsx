import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Send, Signature, X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { InspectionReportPDF } from './InspectionReportPDF';
import { useInspectionItems } from '@/hooks/useInspectionItems';
import { useInspectionCosts } from '@/hooks/useInspectionCosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportSignaturesTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

export default function ReportSignaturesTab({ report, onUpdate }: ReportSignaturesTabProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState(report.client_name || '');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: findings = [] } = useInspectionItems(report.id);
  const { data: costs = [] } = useInspectionCosts(report.id);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error('אנא חתום לפני השמירה');
      return;
    }
    const dataUrl = sigCanvas.current?.toDataURL('image/png');
    setSignatureData(dataUrl || null);
    toast.success('חתימה נשמרה בהצלחה');
  };

  const generatePdfBlob = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfDoc = pdf(
        <InspectionReportPDF
          report={report}
          findings={findings}
          costs={costs}
          signature={signatureData || undefined}
          template={report.template || 'classic'}
          logoUrl={report.logo_url || undefined}
        />
      );
      const blob = await pdfDoc.toBlob();
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('שגיאה ביצירת PDF');
      throw error;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const uploadPdfToStorage = async (blob: Blob) => {
    const fileName = `inspection-report-${report.id}-${Date.now()}.pdf`;
    const filePath = `${report.supplier_id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('inspection-reports')
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('inspection-reports')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const sendReportByEmail = async () => {
    if (!recipientEmail) {
      toast.error('נא להזין כתובת אימייל');
      return;
    }

    if (!recipientName) {
      toast.error('נא להזין שם נמען');
      return;
    }

    setIsSending(true);
    try {
      // Generate PDF
      const pdfBlob = await generatePdfBlob();
      
      // Upload to storage
      const pdfUrl = await uploadPdfToStorage(pdfBlob);

      // Update report with PDF URL
      const { error: updateError } = await supabase
        .from('inspection_reports')
        .update({ 
          pdf_url: pdfUrl,
          signature_data: signatureData,
          status: 'completed'
        })
        .eq('id', report.id);

      if (updateError) throw updateError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-inspection-report', {
        body: {
          reportId: report.id,
          recipientEmail,
          recipientName,
          pdfUrl,
        },
      });

      if (emailError) throw emailError;

      toast.success('הדוח נשלח בהצלחה באימייל!');
      onUpdate({ pdf_url: pdfUrl, status: 'completed' });
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast.error(error.message || 'שגיאה בשליחת הדוח');
    } finally {
      setIsSending(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const pdfBlob = await generatePdfBlob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-report-${report.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF הורד בהצלחה');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('שגיאה בהורדת PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            יצירת PDF
          </CardTitle>
          <CardDescription>הפק דוח PDF מקצועי עם כל הממצאים והעלויות</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={downloadPdf} disabled={isGeneratingPdf} className="flex-1">
              <Download className="h-4 w-4 ml-2" />
              {isGeneratingPdf ? 'מייצר PDF...' : 'הורד PDF'}
            </Button>
            {report.pdf_url && (
              <Button variant="outline" asChild>
                <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 ml-2" />
                  צפה ב-PDF קיים
                </a>
              </Button>
            )}
          </div>

          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              הדוח כולל: {findings.length} ממצאים, {costs.length} פריטי עלות
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5" />
            חתימה דיגיטלית
          </CardTitle>
          <CardDescription>חתום על הדוח באופן דיגיטלי</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!signatureData ? (
            <>
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: 'w-full h-40 bg-background cursor-crosshair',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSignature} className="flex-1">
                  <Signature className="h-4 w-4 ml-2" />
                  שמור חתימה
                </Button>
                <Button onClick={clearSignature} variant="outline">
                  <X className="h-4 w-4 ml-2" />
                  נקה
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="border rounded-lg p-4 bg-muted">
                <img src={signatureData} alt="חתימה" className="max-h-32 mx-auto" />
              </div>
              <Button onClick={() => setSignatureData(null)} variant="outline" className="w-full">
                <X className="h-4 w-4 ml-2" />
                מחק חתימה
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Send by Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שליחה ללקוח
          </CardTitle>
          <CardDescription>שלח את הדוח באימייל ללקוח</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">שם הנמען</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="הזן שם נמען"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">אימייל</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="example@domain.com"
            />
          </div>
          <Button
            onClick={sendReportByEmail}
            disabled={isSending || !recipientEmail || !recipientName}
            className="w-full"
          >
            <Send className="h-4 w-4 ml-2" />
            {isSending ? 'שולח...' : 'שלח דוח באימייל'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
