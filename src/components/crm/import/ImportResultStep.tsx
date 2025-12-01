import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImportResult } from "@/services/leadImportService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ImportResultStepProps {
  result: ImportResult;
  onClose: () => void;
}

export function ImportResultStep({ result, onClose }: ImportResultStepProps) {
  const copyErrorsToClipboard = () => {
    if (!result.errors) return;

    const text = result.errors
      .map(
        (e) =>
          `שורה ${e.row}: ${e.field} - ${e.message} (${JSON.stringify(e.data)})`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    toast.success('השגיאות הועתקו ללוח');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {result.success ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4">
            <XCircle className="w-8 h-8" />
          </div>
        )}

        <h3 className="text-xl font-medium mb-2">
          {result.success ? 'הייבוא הושלם!' : 'הייבוא נכשל'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {result.success
            ? 'הלידים יובאו בהצלחה למערכת'
            : result.error || 'אירעה שגיאה בתהליך הייבוא'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {result.total_rows}
          </div>
          <div className="text-xs text-muted-foreground mt-1">סה"כ שורות</div>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {result.imported_rows}
          </div>
          <div className="text-xs text-muted-foreground mt-1">יובאו</div>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {result.duplicate_rows}
          </div>
          <div className="text-xs text-muted-foreground mt-1">כפולים</div>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-destructive">
            {result.error_rows}
          </div>
          <div className="text-xs text-muted-foreground mt-1">שגיאות</div>
        </div>
      </div>

      {result.errors && result.errors.length > 0 && (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  נמצאו {result.errors.length} שורות עם שגיאות (מוצגות עד 20 ראשונות)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyErrorsToClipboard}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שורה</TableHead>
                  <TableHead>שדה</TableHead>
                  <TableHead>שגיאה</TableHead>
                  <TableHead>נתונים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.slice(0, 20).map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.field}</TableCell>
                    <TableCell className="text-destructive">
                      {error.message}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {JSON.stringify(error.data).slice(0, 50)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {result.success && result.imported_rows > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {result.imported_rows} לידים חדשים נוספו למערכת ומוכנים לטיפול.
            {result.duplicate_rows > 0 &&
              ` ${result.duplicate_rows} לידים כפולים נדלגו.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button onClick={onClose} size="lg">
          סגור
        </Button>
      </div>
    </div>
  );
}
