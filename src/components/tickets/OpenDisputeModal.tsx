import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ticketService } from '@/services/ticketService';
import { AlertTriangle, Upload, X } from 'lucide-react';

interface OpenDisputeModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DISPUTE_REASONS = [
  'Product Quality Issues',
  'Delivery Problems',
  'Payment Disputes',
  'Service Not as Described',
  'Communication Issues',
  'Warranty Claims',
  'Other'
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'General inquiry' },
  { value: 'medium', label: 'Medium', description: 'Standard issue' },
  { value: 'high', label: 'High', description: 'Urgent attention needed' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issue' }
];

export function OpenDisputeModal({ orderId, isOpen, onClose }: OpenDisputeModalProps) {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const finalReason = reason === 'Other' ? customReason : reason;
      return await ticketService.createTicket(orderId, finalReason, description, priority);
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['order-tickets', orderId] });
      toast({
        title: 'Dispute opened successfully',
        description: `Ticket #${ticket.ticket_number} has been created and assigned.`
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to open dispute',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    setDescription('');
    setPriority('medium');
    setEvidenceFiles([]);
    onClose();
  };

  const canSubmit = reason && (reason !== 'Other' || customReason) && description;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Open Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Dispute Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason for your dispute" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {reason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify *</Label>
              <Input
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the specific issue"
              />
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of the issue, including what happened, when it occurred, and what resolution you're seeking..."
              rows={4}
            />
          </div>

          {/* Evidence Files */}
          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload photos, documents, or other evidence
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="evidence-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('evidence-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {/* Selected Files */}
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Selected Files:</Label>
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SLA Information */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Response Time</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-red-600">Urgent:</span> 2 hours
              </div>
              <div>
                <span className="font-medium text-orange-600">High:</span> 8 hours
              </div>
              <div>
                <span className="font-medium text-blue-600">Medium:</span> 24 hours
              </div>
              <div>
                <span className="font-medium text-green-600">Low:</span> 72 hours
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTicketMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createTicketMutation.mutate()}
              disabled={!canSubmit || createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? 'Opening Dispute...' : 'Open Dispute'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}