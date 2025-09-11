import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, ArrowRight, MessageCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { PageBoundary } from '@/components/system/PageBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { supaSelect } from '@/lib/supaFetch';

interface Lead {
  id: string;
  supplier_id: string;
  notes: string;
  status: string;
  created_at: string;
}

export default function MyMessages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invalidateLeads } = useQueryInvalidation();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      try {
        return await supaSelect<Lead[]>(
          supabase
            .from('leads')
            .select('*')
            .or(`client_id.eq.${user?.id},supplier_id.eq.${user?.id}`)
            .order('created_at', { ascending: false }),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת ההודעות',
            timeoutMs: 10_000
          }
        );
      } catch (error: any) {
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      
      invalidateLeads(user?.id);
      showToast.success('ההודעה נמחקה');
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast.error('שגיאה במחיקת ההודעה');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { text: 'חדש', variant: 'default' as const },
      responded: { text: 'נענה', variant: 'secondary' as const },
      archived: { text: 'בארכיון', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  return (
    <PageBoundary>
      {isLoading ? (
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">ההודעות שלי</h1>
            </header>

            {!leads || leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">אין הודעות עדיין</h2>
                  <p className="text-muted-foreground mb-4">
                    כאשר תשלח הודעות לספקים או תקבל הודעות, הן יופיעו כאן.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="רשימת הודעות">
                {leads.map((lead) => (
                  <Card key={lead.id} role="listitem">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              ספק: {lead.supplier_id}
                            </span>
                            {getStatusBadge(lead.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2" dir="rtl">
                            {lead.notes}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            נשלח: {new Date(lead.created_at).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                        <div className="flex gap-2 mr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/supplier/${lead.supplier_id}`, '_blank')}
                            aria-label={`צפה בפרטי הספק ${lead.supplier_id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLead(lead.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                            aria-label={`מחק הודעה לספק ${lead.supplier_id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageBoundary>
  );
}