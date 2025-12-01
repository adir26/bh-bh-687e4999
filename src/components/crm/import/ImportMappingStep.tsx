import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportMappingStepProps {
  headers: string[];
  preview: string[][];
  onBack: () => void;
  onNext: (mapping: Record<string, string>) => void;
}

const SYSTEM_FIELDS = [
  { value: 'name', label: 'שם מלא', required: true },
  { value: 'phone', label: 'טלפון ראשי', required: true },
  { value: 'secondary_phone', label: 'טלפון משני', required: false },
  { value: 'whatsapp_phone', label: 'טלפון WhatsApp', required: false },
  { value: 'email', label: 'דוא"ל', required: false },
  { value: 'source', label: 'מקור', required: false },
  { value: 'form_name', label: 'שם טופס / קמפיין', required: false },
  { value: 'channel', label: 'ערוץ', required: false },
  { value: 'stage', label: 'שלב', required: false },
  { value: 'ignore', label: 'התעלם', required: false },
];

export function ImportMappingStep({
  headers,
  preview,
  onBack,
  onNext,
}: ImportMappingStepProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-detect mapping on mount (Facebook Hebrew fields)
  useEffect(() => {
    const autoMapping: Record<string, string> = {};

    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().trim();

      // Facebook Hebrew exact matches
      if (normalized === 'שם' || normalized === 'שם מלא' || normalized.includes('name')) {
        autoMapping[index.toString()] = 'name';
      } else if (
        normalized === 'טלפון' ||
        normalized === 'מספר הטלפון' ||
        normalized === 'phone' ||
        normalized.includes('נייד')
      ) {
        autoMapping[index.toString()] = 'phone';
      } else if (
        normalized === 'מספר הטלפון המשני' ||
        normalized === 'טלפון משני' ||
        normalized === 'secondary phone'
      ) {
        autoMapping[index.toString()] = 'secondary_phone';
      } else if (
        normalized === 'מספר הטלפון ב-whatsapp' ||
        normalized === 'whatsapp phone' ||
        normalized === 'whatsapp'
      ) {
        autoMapping[index.toString()] = 'whatsapp_phone';
      } else if (
        normalized === 'דוא"ל' ||
        normalized === 'אימייל' ||
        normalized.includes('email') ||
        normalized.includes('mail')
      ) {
        autoMapping[index.toString()] = 'email';
      } else if (normalized === 'מקור' || normalized === 'source') {
        autoMapping[index.toString()] = 'source';
      } else if (
        normalized === 'טופס' ||
        normalized === 'form' ||
        normalized === 'campaign' ||
        normalized === 'קמפיין'
      ) {
        autoMapping[index.toString()] = 'form_name';
      } else if (normalized === 'ערוץ' || normalized === 'channel') {
        autoMapping[index.toString()] = 'channel';
      } else if (normalized === 'שלב' || normalized === 'stage') {
        autoMapping[index.toString()] = 'stage';
      } else if (
        normalized === 'נוצר' ||
        normalized === 'בעלים' ||
        normalized === 'תוויות' ||
        normalized === 'created' ||
        normalized === 'owner' ||
        normalized === 'tags'
      ) {
        autoMapping[index.toString()] = 'ignore';
      }
    });

    setMapping(autoMapping);
  }, [headers]);

  const handleMappingChange = (headerIndex: string, systemField: string) => {
    setMapping((prev) => ({
      ...prev,
      [headerIndex]: systemField,
    }));
  };

  const validateMapping = (): boolean => {
    const newErrors: string[] = [];
    const reversedMapping = Object.entries(mapping).reduce(
      (acc, [header, field]) => {
        if (field !== 'ignore') {
          acc[field] = header;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Check required fields
    const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
    for (const field of requiredFields) {
      if (!reversedMapping[field.value]) {
        newErrors.push(`שדה חובה "${field.label}" לא מופה`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateMapping()) {
      onNext(mapping);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">מיפוי שדות</h3>
        <p className="text-sm text-muted-foreground">
          מפה כל עמודה בקובץ לשדה במערכת. זיהוי אוטומטי בוצע, אך ניתן לשנות ידנית.
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>עמודה בקובץ</TableHead>
              <TableHead>דוגמה</TableHead>
              <TableHead>שדה במערכת</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{header}</TableCell>
                <TableCell className="text-muted-foreground">
                  {preview[0]?.[index] || '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping[index.toString()] || 'ignore'}
                    onValueChange={(value) =>
                      handleMappingChange(index.toString(), value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                          {field.required && (
                            <span className="text-destructive mr-1">*</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">תצוגה מקדימה (5 שורות ראשונות):</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className="text-xs">
                    {SYSTEM_FIELDS.find(
                      (f) => f.value === mapping[index.toString()]
                    )?.label || 'התעלם'}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.slice(0, 5).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-xs">
                      {cell || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזרה
        </Button>
        <Button onClick={handleNext}>
          המשך
          <ArrowRight className="w-4 h-4 mr-2" />
        </Button>
      </div>
    </div>
  );
}
