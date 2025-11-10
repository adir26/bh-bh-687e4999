import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

interface ReportDetailsTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

export default function ReportDetailsTab({ report, onUpdate }: ReportDetailsTabProps) {
  const [formData, setFormData] = useState({
    project_name: report.project_name || '',
    address: report.address || '',
    inspection_date: report.inspection_date || new Date().toISOString().split('T')[0],
    inspector_name: report.inspector_name || '',
    inspector_company: report.inspector_company || '',
    inspector_license: report.inspector_license || '',
    inspector_phone: report.inspector_phone || '',
    inspector_email: report.inspector_email || '',
    notes: report.notes || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = Object.keys(formData).some(
      (key) => formData[key as keyof typeof formData] !== (report[key] || '')
    );
    setHasChanges(changed);
  }, [formData, report]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-xl md:text-2xl">פרטי דוח</CardTitle>
          <CardDescription className="text-base">הזינו את הפרטים הבסיסיים של הדוח</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="project_name" className="text-base font-medium">שם פרויקט</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleChange('project_name', e.target.value)}
                placeholder="הזינו שם פרויקט"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="הזינו כתובת"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspection_date" className="text-base font-medium">תאריך בדיקה</Label>
              <Input
                id="inspection_date"
                type="date"
                value={formData.inspection_date}
                onChange={(e) => handleChange('inspection_date', e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">פרטי הבודק</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="inspector_name" className="text-base font-medium">שם הבודק</Label>
                <Input
                  id="inspector_name"
                  value={formData.inspector_name}
                  onChange={(e) => handleChange('inspector_name', e.target.value)}
                  placeholder="הזינו שם הבודק"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_company" className="text-base font-medium">שם החברה</Label>
                <Input
                  id="inspector_company"
                  value={formData.inspector_company}
                  onChange={(e) => handleChange('inspector_company', e.target.value)}
                  placeholder="הזינו שם חברה"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_license" className="text-base font-medium">מספר רישיון</Label>
                <Input
                  id="inspector_license"
                  value={formData.inspector_license}
                  onChange={(e) => handleChange('inspector_license', e.target.value)}
                  placeholder="הזינו מספר רישיון"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_phone" className="text-base font-medium">טלפון</Label>
                <Input
                  id="inspector_phone"
                  type="tel"
                  value={formData.inspector_phone}
                  onChange={(e) => handleChange('inspector_phone', e.target.value)}
                  placeholder="הזינו מספר טלפון"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="inspector_email" className="text-base font-medium">אימייל</Label>
                <Input
                  id="inspector_email"
                  type="email"
                  value={formData.inspector_email}
                  onChange={(e) => handleChange('inspector_email', e.target.value)}
                  placeholder="הזינו כתובת אימייל"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="הערות כלליות על הדוח"
              rows={5}
              className="text-base resize-none"
            />
          </div>

          {hasChanges && (
            <div className="pt-4 border-t border-border/50">
              <Button onClick={handleSave} size="lg" className="w-full md:w-auto shadow-lg">
                <Save className="ml-2 h-5 w-5" />
                שמור שינויים
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
