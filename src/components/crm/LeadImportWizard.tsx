import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ImportUploadStep } from "./import/ImportUploadStep";
import { ImportMappingStep } from "./import/ImportMappingStep";
import { ImportPreviewStep } from "./import/ImportPreviewStep";
import { ImportResultStep } from "./import/ImportResultStep";
import { ImportResult } from "@/services/leadImportService";

interface LeadImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function LeadImportWizard({ open, onOpenChange, onComplete }: LeadImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelected = (
    selectedFile: File,
    parsedHeaders: string[],
    parsedPreview: string[][],
    rows: number
  ) => {
    setFile(selectedFile);
    setHeaders(parsedHeaders);
    setPreview(parsedPreview);
    setTotalRows(rows);
    setStep(2);
  };

  const handleMappingComplete = (mapping: Record<string, string>) => {
    setFieldMapping(mapping);
    setStep(3);
  };

  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result);
    setStep(4);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setPreview([]);
    setTotalRows(0);
    setFieldMapping({});
    setImportResult(null);
    onOpenChange(false);
    if (importResult?.success) {
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">ייבוא לידים מקובץ</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    i === step
                      ? 'bg-primary text-primary-foreground'
                      : i < step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i}
                </div>
                {i < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      i < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && <ImportUploadStep onFileSelected={handleFileSelected} />}
          {step === 2 && file && (
            <ImportMappingStep
              headers={headers}
              preview={preview}
              onBack={() => setStep(1)}
              onNext={handleMappingComplete}
            />
          )}
          {step === 3 && file && (
            <ImportPreviewStep
              file={file}
              fieldMapping={fieldMapping}
              totalRows={totalRows}
              onBack={() => setStep(2)}
              onImportComplete={handleImportComplete}
            />
          )}
          {step === 4 && importResult && (
            <ImportResultStep result={importResult} onClose={handleClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
