import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, StickyNote, FileText, Clock, MessageCircle } from 'lucide-react';

interface QuickActionsMenuProps {
  leadId: string;
  onAddNote: (leadId: string, note: string) => void;
  onCreateQuote: (leadId: string) => void;
  onSnooze: (leadId: string, hours: number) => void;
}

export function QuickActionsMenu({
  leadId,
  onAddNote,
  onCreateQuote,
  onSnooze
}: QuickActionsMenuProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(leadId, note.trim());
      setNote('');
      setIsNoteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsNoteDialogOpen(true)}>
            <StickyNote className="h-4 w-4 mr-2" />
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateQuote(leadId)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSnooze(leadId, 24)}>
            <Clock className="h-4 w-4 mr-2" />
            Snooze 24h
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert('Chat not available yet')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}