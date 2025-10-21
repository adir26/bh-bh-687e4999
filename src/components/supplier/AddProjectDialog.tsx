import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProjectWithParticipants, PROJECT_STATUS_LABELS, type ProjectDetailedStatus } from '@/services/projectService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  supplierId: string;
  onProjectCreated: (projectId: string) => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
  clientId,
  supplierId,
  onProjectCreated,
}: AddProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedStatus, setDetailedStatus] = useState<ProjectDetailedStatus>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('נא למלא שם פרויקט');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectId = await createProjectWithParticipants({
        title: title.trim(),
        description: description.trim() || undefined,
        client_id: clientId,
        supplier_id: supplierId,
        detailed_status: detailedStatus,
      });

      toast.success('הפרויקט נוצר בהצלחה');
      onProjectCreated(projectId);
      onOpenChange(false);
      
      // Reset
      setTitle('');
      setDescription('');
      setDetailedStatus('new');
    } catch (error: any) {
      toast.error(error.message || 'שגיאה ביצירת פרויקט');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>הוספת פרויקט חדש</DialogTitle>
          <DialogDescription>
            צור פרויקט חדש עבור הלקוח הנבחר
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">שם הפרויקט *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שיפוץ דירה בתל אביב"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטי הפרויקט..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">סטטוס התחלתי</Label>
            <Select
              value={detailedStatus}
              onValueChange={(v) => setDetailedStatus(v as ProjectDetailedStatus)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  יוצר...
                </>
              ) : (
                'צור פרויקט'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
