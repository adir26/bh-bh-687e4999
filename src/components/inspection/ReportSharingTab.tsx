import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReportSharingTabProps {
  report: {
    id: string;
    project_name?: string;
    status: string;
  };
}

export default function ReportSharingTab({ report }: ReportSharingTabProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Generate public share URL using custom domain
  const shareUrl = `https://bh-bonimpo.com/public/inspection/${report.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('הקישור הועתק ללוח');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('הקישור הועתק ללוח');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('שגיאה בהעתקת הקישור');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const projectName = report.project_name || 'דוח בדיקה';
    const shareData = {
      title: projectName,
      text: `צפה בדוח: ${projectName}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success('הדוח שותף בהצלחה');
      } else {
        // Fallback - copy to clipboard
        await handleCopyLink();
      }
    } catch (error: any) {
      // User cancelled share - don't show error
      if (error?.name !== 'AbortError') {
        await handleCopyLink();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Share Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            קישור לשיתוף
          </CardTitle>
          <CardDescription>
            שתפו את הדוח עם הלקוח באמצעות קישור ציבורי
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>קישור הדוח</Label>
            <div className="flex gap-2" dir="ltr">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {report.status === 'draft' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>שימו לב:</strong> הדוח עדיין בטיוטה. מומלץ לעדכן את הסטטוס ל"סופי" לפני שיתוף עם הלקוח.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Action */}
      <Card>
        <CardHeader>
          <CardTitle>שיתוף הדוח</CardTitle>
          <CardDescription>
            שתפו את הדוח דרך כל אפליקציה במכשיר
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleShare}
            className="w-full gap-2"
            size="lg"
            disabled={isSharing}
          >
            <Share2 className="h-5 w-5" />
            {isSharing ? 'משתף...' : 'שתף דוח'}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>הוראות שיתוף</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <div className="font-bold text-foreground">1.</div>
            <div>לחצו על "שתף דוח" לשיתוף דרך WhatsApp, מייל או כל אפליקציה אחרת</div>
          </div>
          <div className="flex gap-2">
            <div className="font-bold text-foreground">2.</div>
            <div>הלקוח יוכל לצפות בדוח בדפדפן ללא צורך בהתחברות</div>
          </div>
          <div className="flex gap-2">
            <div className="font-bold text-foreground">3.</div>
            <div>ניתן להוריד את הדוח כ-PDF מהעמוד הציבורי</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
