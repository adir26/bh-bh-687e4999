import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Send, Signature, X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useInspectionItems } from '@/hooks/useInspectionItems';
import { useInspectionCosts } from '@/hooks/useInspectionCosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createPdfBlob } from '@/utils/pdf';

interface ReportSignaturesTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

export default function ReportSignaturesTab({ report, onUpdate }: ReportSignaturesTabProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string | null>(report.signature_data || null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState(report.client_name || '');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  const { data: findings = [] } = useInspectionItems(report.id);
  const { data: costs = [] } = useInspectionCosts(report.id);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData(null);
  };

  const saveSignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error('אנא חתום לפני השמירה');
      return;
    }
    
    setIsSavingSignature(true);
    const dataUrl = sigCanvas.current?.toDataURL('image/png');
    
    try {
      // Save signature to database
      const { error } = await supabase
        .from('inspection_reports')
        .update({ 
          signature_data: dataUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) throw error;
      
      setSignatureData(dataUrl);
      toast.success('חתימה נשמרה בהצלחה במערכת');
      onUpdate({ signature_data: dataUrl });
    } catch (error: any) {
      console.error('Error saving signature:', error);
      toast.error('שגיאה בשמירת החתימה: ' + error.message);
    } finally {
      setIsSavingSignature(false);
    }
  };

  const generatePdfBlob = async (includeSignature = false, upload = false) => {
    setIsGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-inspection-pdf', {
        body: {
          reportId: report.id,
          template: report.template || 'classic',
          includeSignature,
          upload,
        },
      });

      if (error) throw error;

      // If upload was requested, data will contain both URL and bytes
      if (upload && data.url) {
        return { blob: createPdfBlob(data.bytes), url: data.url };
      }

      return { blob: createPdfBlob(data), url: null };
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('שגיאה ביצירת PDF');
      throw error;
    } finally {
      setIsGeneratingPdf(false);
    }
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
      // Generate PDF with signature and upload directly
      const { url: pdfUrl } = await generatePdfBlob(!!signatureData, true);

      if (!pdfUrl) {
        throw new Error('Failed to generate PDF URL');
      }

      // Update report with PDF URL
      const { error: updateError } = await supabase
        .from('inspection_reports')
        .update({ 
          pdf_url: pdfUrl,
          signature_data: signatureData,
          status: 'sent'
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
      onUpdate({ pdf_url: pdfUrl, status: 'sent' });
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast.error(error.message || 'שגיאה בשליחת הדוח');
    } finally {
      setIsSending(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const { blob } = await generatePdfBlob(!!signatureData, false);
      const url = URL.createObjectURL(blob);
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
                <Button onClick={saveSignature} disabled={isSavingSignature} className="flex-1">
                  <Signature className="h-4 w-4 ml-2" />
                  {isSavingSignature ? 'שומר...' : 'שמור חתימה'}
                </Button>
                <Button onClick={clearSignature} variant="outline" disabled={isSavingSignature}>
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
