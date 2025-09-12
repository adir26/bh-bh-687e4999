import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface LeadAssignmentDropdownProps {
  leadId: string;
  currentAssignee?: string | null;
  onAssign: (leadId: string, assigneeId: string) => void;
}

export function LeadAssignmentDropdown({ 
  leadId, 
  currentAssignee, 
  onAssign 
}: LeadAssignmentDropdownProps) {
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'supplier')
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Select
      value={currentAssignee || 'unassigned'}
      onValueChange={(value) => {
        if (value !== 'unassigned') {
          onAssign(leadId, value);
        }
      }}
    >
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Assign">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">
              {currentAssignee 
                ? teamMembers.find(m => m.id === currentAssignee)?.full_name?.split(' ')[0] || 'Assigned'
                : 'Unassigned'
              }
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.full_name || member.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}