import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
      <Card>
        <CardHeader>
          <CardTitle>פרטי דוח</CardTitle>
          <CardDescription>הזינו את הפרטים הבסיסיים של הדוח</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_name">שם פרויקט</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleChange('project_name', e.target.value)}
                placeholder="הזינו שם פרויקט"
              />
            </div>

            <div>
              <Label htmlFor="inspector_name">שם הבודק</Label>
              <Input
                id="inspector_name"
                value={formData.inspector_name}
                onChange={(e) => handleChange('inspector_name', e.target.value)}
                placeholder="הזינו שם הבודק"
              />
            </div>

            <div>
              <Label htmlFor="address">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="הזינו כתובת"
              />
            </div>

            <div>
              <Label htmlFor="inspection_date">תאריך בדיקה</Label>
              <Input
                id="inspection_date"
                type="date"
                value={formData.inspection_date}
                onChange={(e) => handleChange('inspection_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="הערות כלליות על הדוח"
              rows={4}
            />
          </div>

          {hasChanges && (
            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="ml-2 h-4 w-4" />
              שמור שינויים
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
