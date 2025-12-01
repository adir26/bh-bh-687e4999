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

export function ImportPreviewStep({
  file,
  fieldMapping,
  totalRows,
  onBack,
  onImportComplete,
}: ImportPreviewStepProps) {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    try {
      const result = await leadImportService.importFile(file, fieldMapping);
      
      if (result.success) {
        toast.success('הייבוא הושלם בהצלחה!');
      } else {
        toast.error(result.error || 'הייבוא נכשל');
      }

      onImportComplete(result);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('שגיאה בייבוא הקובץ');
      
      onImportComplete({
        success: false,
        importId: '',
        total_rows: totalRows,
        imported_rows: 0,
        duplicate_rows: 0,
        error_rows: totalRows,
        error: error instanceof Error ? error.message : 'שגיאה לא ידועה',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">אישור ייבוא</h3>
        <p className="text-sm text-muted-foreground">
          סקור את פרטי הייבוא לפני ההפעלה
        </p>
      </div>

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
              <li>כל השורות יאומתו לפי השדות החובה (שם, טלפון)</li>
              <li>לידים כפולים (לפי טלפון או מייל) יידלגו אוטומטית</li>
              <li>רק לידים תקינים ייווספו למערכת</li>
              <li>תקבל סיכום מפורט בסיום</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">מיפוי שדות:</h4>
        <div className="space-y-1 text-sm">
          {Object.entries(fieldMapping).map(([index, field]) => {
            if (field === 'ignore') return null;
            
            const fieldLabels: Record<string, string> = {
              name: 'שם מלא',
              phone: 'טלפון',
              email: 'מייל',
              source: 'מקור',
              campaign: 'קמפיין',
            };

            return (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">
                  {fieldLabels[field] || field}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזרה
        </Button>
        <Button onClick={handleImport} disabled={loading}>
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
