import { useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { leadImportService } from "@/services/leadImportService";
import { toast } from "sonner";

interface ImportUploadStepProps {
  onFileSelected: (
    file: File,
    headers: string[],
    preview: string[][],
    totalRows: number
  ) => void;
}

export function ImportUploadStep({ onFileSelected }: ImportUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['.csv', '.xml'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(fileExtension)) {
      setError('פורמט קובץ לא נתמך. נא להעלות קובץ CSV או XML בלבד.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('הקובץ גדול מדי. גודל מקסימלי: 10MB');
      return;
    }

    setLoading(true);

    try {
      const { headers, preview, totalRows } = await leadImportService.parseFilePreview(file);

      if (totalRows === 0) {
        setError('הקובץ ריק או לא תקין');
        setLoading(false);
        return;
      }

      if (totalRows > 10000) {
        setError('הקובץ מכיל יותר מ-10,000 שורות. נא לפצל לקבצים קטנים יותר.');
        setLoading(false);
        return;
      }

      toast.success(`נמצאו ${totalRows} שורות בקובץ`);
      onFileSelected(file, headers, preview, totalRows);
    } catch (err) {
      console.error('File processing error:', err);
      setError('שגיאה בעיבוד הקובץ. ודא שהפורמט תקין.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,.xml"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div>
            <p className="text-lg font-medium mb-1">
              גרור ושחרר קובץ כאן
            </p>
            <p className="text-sm text-muted-foreground">
              או לחץ לבחירת קובץ
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CSV / XML
            </div>
            <span>•</span>
            <span>מקסימום 10MB</span>
            <span>•</span>
            <span>עד 10,000 שורות</span>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="text-center text-sm text-muted-foreground">
          מעבד את הקובץ...
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-sm">דרישות לקובץ:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>עבור CSV: השורה הראשונה חייבת להכיל כותרות עמודות</li>
          <li>עבור XML: מבנה בסיסי עם תגיות {`<lead>`}</li>
          <li>שדות חובה: שם מלא, טלפון</li>
          <li>שדות אופציונליים: מייל, מקור, קמפיין</li>
          <li>קידוד: UTF-8 (תמיכה בעברית)</li>
        </ul>
      </div>
    </div>
  );
}
