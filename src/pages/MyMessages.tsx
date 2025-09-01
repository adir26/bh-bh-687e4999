import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { supaSelect } from '@/lib/supaFetch';
import { PageBoundary } from '@/components/system/PageBoundary';

interface Lead {
  id: string;
  supplier_id: string;
  notes: string;
  status: string;
  created_at: string;
  // We'll need to join with suppliers data manually since we don't have foreign keys
}

const MyMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        // If table doesn't exist, return empty array instead of throwing
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
      
      // Invalidate query to refetch leads
      // TODO: Add queryClient.invalidateQueries(['leads', user?.id]);
      showToast.success('ההודעה נמחקה');
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast.error('שגיאה במחיקת ההודעה');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { text: 'חדש', color: 'bg-blue-100 text-blue-800' },
      responded: { text: 'נענה', color: 'bg-green-100 text-green-800' },
      archived: { text: 'בארכיון', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <PageBoundary 
      timeout={10000}
      fallback={
        <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען הודעות...</p>
            </div>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
          <div className="flex items-center justify-center flex-1">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען הודעות...</p>
            </div>
          </div>
        </div>
      ) : (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">ההודעות שלי</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">אין הודעות</h3>
            <p className="text-gray-500 mb-4">עדיין לא שלחת הודעות לספקים</p>
            <Button onClick={() => navigate('/')}>
              חזרה לדף הבית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">ספק ID: {lead.supplier_id}</h4>
                        {getStatusBadge(lead.status)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {lead.notes}
                      </p>
                      <p className="text-xs text-gray-500">
                        נשלח: {new Date(lead.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/supplier/${lead.supplier_id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      צפה בספק
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLead(lead.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
};

export default MyMessages;