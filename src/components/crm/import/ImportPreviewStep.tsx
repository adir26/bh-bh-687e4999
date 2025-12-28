import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { leadImportService, ImportResult } from "@/services/leadImportService";
import { toast } from "sonner";

interface ImportPreviewStepProps {
  file: File;
  fieldMapping: Record<string, string>;
  totalRows: number;
  onBack: () => void;
  onImportComplete: (result: ImportResult) => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'שם מלא',
  phone: 'טלפון',
  email: 'דוא"ל',
  source: 'מקור',
  form_name: 'קמפיין/טופס',
  secondary_phone: 'טלפון משני',
  whatsapp_phone: 'WhatsApp',
  channel: 'ערוץ',
  stage: 'שלב',
};

export function ImportPreviewStep({
  file,
  fieldMapping,
  totalRows,
  onBack,
  onImportComplete,
}: ImportPreviewStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting import with mapping:', fieldMapping);
      const result = await leadImportService.importFile(file, fieldMapping);
      
      console.log('Import result:', result);
      
      if (result.success) {
        if (result.imported_rows > 0) {
          toast.success(`${result.imported_rows} לידים יובאו בהצלחה!`);
        } else if (result.total_rows === 0) {
          toast.warning('לא נמצאו לידים תקינים בקובץ');
          setError('לא נמצאו לידים תקינים בקובץ. ודא שהמיפוי נכון ושיש נתונים בעמודות המתאימות.');
        } else if (result.duplicate_rows === result.total_rows) {
          toast.info('כל הלידים כבר קיימים במערכת');
        } else {
          toast.warning('הייבוא הושלם אך ללא לידים חדשים');
        }
      } else {
        const errorMsg = result.error || 'הייבוא נכשל';
        toast.error(errorMsg);
        setError(errorMsg);
      }

      onImportComplete(result);
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      toast.error('שגיאה בייבוא הקובץ: ' + errorMessage);
      setError(errorMessage);
      
      onImportComplete({
        success: false,
        importId: '',
        total_rows: totalRows,
        imported_rows: 0,
        duplicate_rows: 0,
        error_rows: totalRows,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get mapped fields for display
  const mappedFields = Object.entries(fieldMapping)
    .filter(([_, field]) => field !== 'ignore')
    .map(([_, field]) => field);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">אישור ייבוא</h3>
        <p className="text-sm text-muted-foreground">
          סקור את פרטי הייבוא לפני ההפעלה
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">שם הקובץ:</span>
          <span className="font-medium">{file.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">גודל:</span>
          <span className="font-medium">
            {(file.size / 1024).toFixed(2)} KB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">סוג:</span>
          <span className="font-medium">
            {file.name.endsWith('.xml') ? 'XML' : 'CSV'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">סה"כ שורות:</span>
          <span className="font-medium">{totalRows}</span>
        </div>
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">מה יקרה בתהליך הייבוא:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>כל השורות יאומתו - נדרש לפחות שם, טלפון או מייל</li>
              <li>לידים כפולים (לפי טלפון או מייל) יידלגו אוטומטית</li>
              <li>מספרי טלפון ינורמלו לפורמט ישראלי</li>
              <li>תקבל סיכום מפורט בסיום</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">שדות שימופו:</h4>
        <div className="flex flex-wrap gap-2">
          {mappedFields.map((field) => (
            <div 
              key={field}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              {FIELD_LABELS[field] || field}
            </div>
          ))}
        </div>
        {mappedFields.length === 0 && (
          <p className="text-sm text-destructive">
            אזהרה: לא נבחרו שדות למיפוי
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזרה
        </Button>
        <Button onClick={handleImport} disabled={loading || mappedFields.length === 0}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
              מייבא...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 ml-2" />
              ייבא לידים
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
