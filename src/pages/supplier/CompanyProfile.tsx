import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SupplierHeader } from '@/components/SupplierHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/utils/toast';
import { 
  Star, MapPin, Phone, Mail, Globe, Share2, MessageCircle,
  CheckCircle, Edit, Save, Building2, ExternalLink
} from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EditableField } from '@/components/supplier/EditableField';
import { EditableImage } from '@/components/supplier/EditableImage';
import { EditableList } from '@/components/supplier/EditableList';
import { EditableGallery } from '@/components/supplier/EditableGallery';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  area: string | null;
  services: string[];
  business_hours: Record<string, any>;
  gallery: string[];
  rating: number;
  review_count: number;
  verified: boolean;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  // Check user role
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.rpc('get_user_role', { user_id: user.id });
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  const isSupplier = userRole === 'supplier' || (user as any)?.user_metadata?.role === 'supplier';

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
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      showToast.error(error.message || 'שגיאה בעדכון פרטי החברה');
    },
  });

  const handleShare = async () => {
    if (!company) return;
    const url = `${window.location.origin}/s/${company.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: company.name,
          text: company.description || '',
          url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast.success('הקישור הועתק ללוח');
      } catch (error) {
        showToast.error('לא ניתן להעתיק את הקישור');
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isSupplier && !isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <SupplierHeader 
          title="פרופיל החברה"
          subtitle="ערוך ותצפה בפרופיל שלך"
          showBackButton={true}
          backUrl="/supplier/dashboard"
        />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-semibold">חסרה הרשאת ספק</h2>
              <p className="text-muted-foreground">
                החשבון שלך עדיין לא מוגדר כחשבון ספק במערכת.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/support')}
              >
                פנה לתמיכה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <CardContent className="pt-6 text-center space-y-4">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">פרופיל חברה לא נמצא</h2>
            <p className="text-muted-foreground">לא נמצא פרופיל חברה במערכת</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              רענן דף
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sticky Edit Toggle Button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2"
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4" />
                  סיים עריכה
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  ערוך פרופיל
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              {isEditMode ? 'לחץ על אלמנט כדי לערוך' : 'כך הפרופיל נראה ללקוחות'}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <EditableImage
        currentUrl={company.banner_url}
        isEditMode={isEditMode}
        onUpload={async (url) => {
          await updateMutation.mutateAsync({ banner_url: url });
        }}
        companyId={company.id}
        type="banner"
        alt={company.name}
      />

      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Logo */}
              <EditableImage
                currentUrl={company.logo_url}
                isEditMode={isEditMode}
                onUpload={async (url) => {
                  await updateMutation.mutateAsync({ logo_url: url });
                }}
                companyId={company.id}
                type="logo"
                alt={company.name}
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Name */}
                    <EditableField
                      value={company.name}
                      isEditMode={isEditMode}
                      onSave={async (name) => {
                        await updateMutation.mutateAsync({ name });
                      }}
                      type="text"
                      required
                    >
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        {company.name}
                        {company.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            מאומת
                          </Badge>
                        )}
                      </h1>
                    </EditableField>
                    
                    {/* Tagline */}
                    <EditableField
                      value={company.tagline || ''}
                      isEditMode={isEditMode}
                      onSave={async (tagline) => {
                        await updateMutation.mutateAsync({ tagline });
                      }}
                      type="text"
                      placeholder="הוסף סלוגן..."
                    >
                      {company.tagline ? (
                        <p className="text-lg text-muted-foreground mt-1">
                          {company.tagline}
                        </p>
                      ) : (
                        <p className="text-lg text-muted-foreground/50 italic mt-1">
                          הוסף סלוגן...
                        </p>
                      )}
                    </EditableField>

                    {/* Description */}
                    <EditableField
                      value={company.description || ''}
                      isEditMode={isEditMode}
                      onSave={async (description) => {
                        await updateMutation.mutateAsync({ description });
                      }}
                      type="textarea"
                      placeholder="הוסף תיאור..."
                    >
                      {company.description ? (
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                          {company.description}
                        </p>
                      ) : (
                        <p className="text-muted-foreground/50 italic mt-2 max-w-2xl">
                          הוסף תיאור...
                        </p>
                      )}
                    </EditableField>

                    {/* Rating & Location */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {company.area && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {company.area}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(Math.round(company.rating))}</div>
                        <span className="font-medium text-foreground">{company.rating.toFixed(1)}</span>
                        <span>({company.review_count} ביקורות)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditMode && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 flex-1 md:flex-none">
                  <Share2 className="w-4 h-4" />
                  שתף
                </Button>
                
                <Button 
                  className="gap-2 flex-1 md:flex-none"
                  onClick={() => navigate(`/s/${company.slug}`)}
                >
                  <ExternalLink className="w-4 h-4" />
                  צפה כלקוח
                </Button>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-wrap gap-6 text-sm">
              <EditableField
                value={company.phone || ''}
                isEditMode={isEditMode}
                onSave={async (phone) => {
                  await updateMutation.mutateAsync({ phone });
                }}
                type="tel"
                placeholder="הוסף טלפון..."
              >
                {company.phone ? (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground/50">
                    <Phone className="w-4 h-4" />
                    הוסף טלפון...
                  </span>
                )}
              </EditableField>

              <EditableField
                value={company.email || ''}
                isEditMode={isEditMode}
                onSave={async (email) => {
                  await updateMutation.mutateAsync({ email });
                }}
                type="email"
                placeholder="הוסף אימייל..."
              >
                {company.email ? (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    {company.email}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground/50">
                    <Mail className="w-4 h-4" />
                    הוסף אימייל...
                  </span>
                )}
              </EditableField>

              <EditableField
                value={company.website || ''}
                isEditMode={isEditMode}
                onSave={async (website) => {
                  await updateMutation.mutateAsync({ website });
                }}
                type="url"
                placeholder="הוסף אתר..."
              >
                {company.website ? (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    אתר האינטרנט
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground/50">
                    <Globe className="w-4 h-4" />
                    הוסף אתר...
                  </span>
                )}
              </EditableField>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <EditableList
        items={company.services || []}
        isEditMode={isEditMode}
        onUpdate={async (services) => {
          await updateMutation.mutateAsync({ services });
        }}
        title="שירותים"
        placeholder="הוסף שירות..."
      />

      {/* Gallery Section */}
      <EditableGallery
        images={company.gallery || []}
        isEditMode={isEditMode}
        onUpdate={async (gallery) => {
          await updateMutation.mutateAsync({ gallery });
        }}
        companyId={company.id}
      />

      {/* Products Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">קטלוג מוצרים</h2>
          <Button onClick={() => navigate('/supplier/products')} className="gap-2">
            נהל מוצרים
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          המוצרים שלך מנוהלים בנפרד בקטלוג המוצרים
        </p>
      </div>
    </div>
  );
}
