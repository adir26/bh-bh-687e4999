import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Upload, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportTemplateTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

const templates = [
  {
    id: 'classic',
    name: 'קלאסי',
    description: 'עיצוב מסורתי ומקצועי',
    colors: { primary: '#2563eb', secondary: '#64748b', accent: '#1e40af' },
    preview: 'bg-gradient-to-br from-blue-50 to-blue-100'
  },
  {
    id: 'modern',
    name: 'מודרני',
    description: 'עיצוב עכשווי ונקי',
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#6d28d9' },
    preview: 'bg-gradient-to-br from-purple-50 to-purple-100'
  },
  {
    id: 'elegant',
    name: 'אלגנטי',
    description: 'עיצוב מעודן ומשודרג',
    colors: { primary: '#059669', secondary: '#34d399', accent: '#047857' },
    preview: 'bg-gradient-to-br from-emerald-50 to-emerald-100'
  },
  {
    id: 'premium',
    name: 'פרמיום',
    description: 'עיצוב יוקרתי עם אפקטים מיוחדים',
    colors: { primary: '#dc2626', secondary: '#f87171', accent: '#991b1b' },
    preview: 'bg-gradient-to-br from-red-50 to-red-100'
  }
];

export default function ReportTemplateTab({ report, onUpdate }: ReportTemplateTabProps) {
  const [uploading, setUploading] = useState(false);
  const currentTemplate = report.template || 'classic';

  const handleTemplateSelect = (templateId: string) => {
    onUpdate({ template: templateId });
    toast.success('התבנית עודכנה בהצלחה');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('יש להעלות קובץ תמונה בלבד');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות עד 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${report.id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `inspection-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inspection_reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inspection_reports')
        .getPublicUrl(filePath);

      onUpdate({ logo_url: publicUrl });
      toast.success('הלוגו הועלה בהצלחה');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onUpdate({ logo_url: null });
    toast.success('הלוגו הוסר');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            בחירת תבנית עיצוב
          </CardTitle>
          <CardDescription>בחר את סגנון העיצוב של הדוח שיישלח ללקוח</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`relative p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                  currentTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {currentTemplate === template.id && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className={`h-24 rounded-md mb-4 ${template.preview}`} />
                <h3 className="font-bold text-lg mb-1 text-right">{template.name}</h3>
                <p className="text-sm text-muted-foreground text-right">{template.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            לוגו החברה
          </CardTitle>
          <CardDescription>הוסף את הלוגו של החברה שלך לדוח (אופציונלי)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.logo_url ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg">
                <img 
                  src={report.logo_url} 
                  alt="Company Logo" 
                  className="max-h-24 object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Label htmlFor="logo-upload" className="flex-1">
                  <Button variant="outline" className="w-full" disabled={uploading} asChild>
                    <span>
                      <Upload className="ml-2 h-4 w-4" />
                      החלף לוגו
                    </span>
                  </Button>
                </Label>
                <Button 
                  variant="destructive" 
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                >
                  הסר לוגו
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="logo-upload">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">העלה לוגו</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG עד 2MB</p>
                </div>
              </Label>
            </div>
          )}
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={uploading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
