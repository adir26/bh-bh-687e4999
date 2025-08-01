import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Trash2, Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

interface Favorite {
  id: string;
  supplier_id: string;
  created_at: string;
}

const SavedSuppliers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        // If table doesn't exist, show empty state instead of error
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          setFavorites([]);
        } else {
          showToast.error('שגיאה בטעינת הספקים השמורים');
        }
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      showToast.success('הספק הוסר מהרשימה');
    } catch (error) {
      console.error('Error removing favorite:', error);
      showToast.error('שגיאה בהסרת הספק');
    }
  };

  if (loading) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">טוען ספקים שמורים...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">ספקים שמורים</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">אין ספקים שמורים</h3>
            <p className="text-gray-500 mb-4">עדיין לא שמרת ספקים ברשימת המועדפים</p>
            <Button onClick={() => navigate('/')}>
              חזרה לדף הבית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        ספק ID: {favorite.supplier_id}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        נשמר: {new Date(favorite.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/supplier/${favorite.supplier_id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      צפה בספק
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/supplier/${favorite.supplier_id}?contact=true`)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 ml-2" />
                      צור קשר
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id)}
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
  );
};

export default SavedSuppliers;