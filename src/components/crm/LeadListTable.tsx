import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/services/leadsService';
import { statusLabel, getStatusBadgeClass } from '@/utils/leadHelpers';
import { SLABadge } from '@/components/crm/SLABadge';
import { LeadAssignmentDropdown } from '@/components/crm/LeadAssignmentDropdown';
import { QuickActionsMenu } from '@/components/crm/QuickActionsMenu';
import { format } from 'date-fns';

interface LeadListTableProps {
  leads: Lead[];
  onLeadClick: (leadId: string) => void;
  onAddNote: (leadId: string, note: string) => void;
  onCreateQuote: (leadId: string) => void;
  onSnooze: (leadId: string, hours: number) => void;
  onAssign: (leadId: string, assigneeId: string) => void;
}

export function LeadListTable({ leads, onLeadClick, onAddNote, onCreateQuote, onSnooze, onAssign }: LeadListTableProps) {
  return (
    <Card>
      <CardContent className="p-0 sm:p-4">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 sm:p-3 text-right font-medium">שם</th>
                <th className="p-2 sm:p-3 text-right font-medium">טלפון</th>
                <th className="p-2 sm:p-3 text-right font-medium hidden md:table-cell">אימייל</th>
                <th className="p-2 sm:p-3 text-right font-medium">סטטוס</th>
                <th className="p-2 sm:p-3 text-right font-medium hidden lg:table-cell">SLA</th>
                <th className="p-2 sm:p-3 text-right font-medium hidden lg:table-cell">הקצאה</th>
                <th className="p-2 sm:p-3 text-right font-medium hidden md:table-cell">פנייה אחרונה</th>
                <th className="p-2 sm:p-3 text-right font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onLeadClick(l.id)}
                >
                  <td className="p-2 sm:p-3 font-medium">{l.name || '—'}</td>
                  <td className="p-2 sm:p-3">
                    {l.contact_phone ? (
                      <a href={`tel:${l.contact_phone}`} className="underline text-primary">{l.contact_phone}</a>
                    ) : '—'}
                  </td>
                  <td className="p-2 sm:p-3 hidden md:table-cell">
                    {l.contact_email ? (
                      <a href={`mailto:${l.contact_email}`} className="underline text-primary truncate max-w-[150px] block">{l.contact_email}</a>
                    ) : '—'}
                  </td>
                  <td className="p-2 sm:p-3">
                    <Badge className={getStatusBadgeClass(l.status)}>{statusLabel(l.status)}</Badge>
                  </td>
                  <td className="p-2 sm:p-3 hidden lg:table-cell">
                    <SLABadge lead={l} />
                  </td>
                  <td className="p-2 sm:p-3 hidden lg:table-cell">
                    <LeadAssignmentDropdown
                      leadId={l.id}
                      currentAssignee={l.assigned_to}
                      onAssign={onAssign}
                    />
                  </td>
                  <td className="p-2 sm:p-3 hidden md:table-cell text-muted-foreground text-xs">
                    {l.last_contact_date ? format(new Date(l.last_contact_date), 'dd/MM/yy HH:mm') : '—'}
                  </td>
                  <td className="p-2 sm:p-3">
                    <QuickActionsMenu
                      leadId={l.id}
                      onAddNote={onAddNote}
                      onCreateQuote={onCreateQuote}
                      onSnooze={onSnooze}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
