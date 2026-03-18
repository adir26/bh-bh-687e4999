import React from 'react';
import { DndContext, DragEndEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lead, LeadStatus } from '@/services/leadsService';
import { STATUSES, statusLabel, getStatusBadgeClass } from '@/utils/leadHelpers';

interface KanbanBoardProps {
  leads: Lead[];
  leadsByStatus: Record<LeadStatus, Lead[]>;
  onDragEnd: (event: DragEndEvent) => void;
  onLeadClick: (leadId: string) => void;
  isLoading?: boolean;
}

function DroppableColumn({ 
  status, 
  leads, 
  onLeadClick 
}: { 
  status: LeadStatus; 
  leads: Lead[]; 
  onLeadClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef}>
      <Card className={isOver ? 'ring-2 ring-primary' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{statusLabel(status)}</span>
            <Badge className={getStatusBadgeClass(status)}>{leads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 min-h-[60px]">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onLeadClick(lead.id)}
                className="cursor-pointer p-3 bg-card rounded-lg border hover:border-primary transition-colors"
              >
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground">{lead.contact_phone}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function KanbanBoard({ leads, leadsByStatus, onDragEnd, onLeadClick, isLoading }: KanbanBoardProps) {
  if (isLoading) return <KanbanSkeleton />;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            leads={leadsByStatus[status] || []}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
