import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SupplierHeader } from '@/components/SupplierHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showToast } from '@/utils/toast';
import { Building2, Globe, Mail, MapPin, Phone, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';

interface CompanyData {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch company data
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as CompanyData | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<CompanyData>) => {
      if (!company?.id) throw new Error('No company found');

      const { data, error } = await supabase
        .from('companies')
        .update(updatedData)
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', user?.id] });
      showToast.success('פרטי החברה עודכנו בהצלחה');
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      showToast.error('שגיאה בעדכון פרטי החברה');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedData: Partial<CompanyData> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      website: formData.get('website') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      city: formData.get('city') as string || null,
      address: formData.get('address') as string || null,
    };

    updateMutation.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">טוען פרטי חברה...</p>
          </div>
        </div>
      </PageBoundary>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">לא נמצאה חברה</h2>
            <p className="text-muted-foreground mb-4">
              נראה שעדיין לא השלמת את תהליך ההרשמה כספק
            </p>
            <Button onClick={() => navigate('/onboarding/supplier-welcome')}>
              השלם הרשמה
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SupplierHeader 
        title="פרופיל החברה"
        subtitle="ערוך את פרטי החברה שלך"
        showBackButton={true}
        backUrl="/supplier/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-nav-safe">
        <form onSubmit={handleSubmit}>
          {/* Company Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                לוגו החברה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {company.logo_url ? 'שנה לוגו' : 'העלה לוגו'}
                  </p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => showToast.comingSoon('העלאת לוגו')}
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    בחר קובץ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                מידע בסיסי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם החברה *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={company.name}
                  required
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">תיאור החברה</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={company.description || ''}
                  placeholder="ספר על החברה שלך, השירותים שאתה מציע..."
                  rows={4}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                פרטי התקשרות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    אימייל
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={company.email || ''}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    טלפון
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={company.phone || ''}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  אתר אינטרנט
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={company.website || ''}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                מיקום
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">עיר</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={company.city || ''}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">כתובת</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={company.address || ''}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {!isEditing ? (
              <Button 
                type="button"
                onClick={() => setIsEditing(true)}
              >
                ערוך פרטים
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isPending}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  <Save className="w-4 h-4 ml-2" />
                  {updateMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
