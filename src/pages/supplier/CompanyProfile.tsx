import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SupplierHeader } from '@/components/SupplierHeader';
import { CompanyMediaUpload } from '@/components/supplier/CompanyMediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/utils/toast';
import { 
  Building2, Globe, Mail, MapPin, Phone, Save, Image as ImageIcon,
  Eye, Edit, Star, CheckCircle, ExternalLink, Tag, Clock, List
} from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';

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
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [newService, setNewService] = useState('');

  // Fetch company data
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Try to find existing company
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as CompanyData;

      // If no company found, try to create from onboarding data
      console.warn('⚠️ No company found, attempting to create from profile data');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_data, email, full_name')
        .eq('id', user!.id)
        .single();

      const onboardingData = profile?.onboarding_data as any;
      if (onboardingData?.company_info) {
        const companyInfo = onboardingData.company_info;
        const branding = onboardingData.branding || {};
        
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            owner_id: user!.id,
            name: companyInfo.companyName || companyInfo.name || 'החברה שלי',
            email: companyInfo.email || profile.email,
            phone: companyInfo.phone || null,
            city: companyInfo.operatingArea || companyInfo.city || null,
            description: branding.description || null,
            logo_url: branding.logo || null,
            banner_url: branding.coverImage || null,
            services: branding.services || [],
            slug: null
          }])
          .select()
          .single();

        if (createError) {
          console.error('Failed to create company from onboarding data:', createError);
          throw createError;
        }
        
        showToast.success('פרופיל החברה נוצר בהצלחה!');
        return newCompany as CompanyData;
      }

      // No company and no onboarding data
      return null;
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
      tagline: formData.get('tagline') as string || null,
      description: formData.get('description') as string || null,
      website: formData.get('website') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      city: formData.get('city') as string || null,
      address: formData.get('address') as string || null,
    };

    updateMutation.mutate(updatedData);
  };

  const handleAddService = () => {
    if (!newService.trim() || !company) return;
    
    const updatedServices = [...(company.services || []), newService.trim()];
    updateMutation.mutate({ services: updatedServices });
    setNewService('');
  };

  const handleRemoveService = (index: number) => {
    if (!company) return;
    
    const updatedServices = company.services.filter((_, i) => i !== index);
    updateMutation.mutate({ services: updatedServices });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
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
        subtitle="ערוך ותצפה בפרופיל שלך"
        showBackButton={true}
        backUrl="/supplier/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-nav-safe">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'edit')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              תצוגה מקדימה
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Edit className="w-4 h-4" />
              עריכה
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {/* Banner */}
            {company.banner_url && (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={company.banner_url} 
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    {company.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                          {company.name}
                          {company.verified && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              מאומת
                            </Badge>
                          )}
                        </h1>
                        
                        {company.tagline && (
                          <p className="text-muted-foreground mt-1">{company.tagline}</p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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

                      <Link to={`/s/${company.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          צפה כציבורי
                        </Button>
                      </Link>
                    </div>

                    {company.description && (
                      <p className="mt-4 text-muted-foreground">{company.description}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                {(company.phone || company.email || company.website) && (
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-6 text-sm">
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{company.email}</span>
                      </div>
                    )}
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        אתר האינטרנט
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {company.services && company.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    שירותים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {company.gallery && company.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    גלריה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {company.gallery.map((imageUrl, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    מדיה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo */}
                  <div>
                    <Label className="mb-2 block">לוגו החברה</Label>
                    <div className="flex items-center gap-4">
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
                      <CompanyMediaUpload
                        companyId={company.id}
                        currentUrl={company.logo_url}
                        folder="logos"
                        onUploadComplete={(url) => updateMutation.mutate({ logo_url: url })}
                      />
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <Label className="mb-2 block">באנר (תמונת רקע)</Label>
                    <div className="space-y-3">
                      {company.banner_url && (
                        <div className="w-full h-32 rounded-lg overflow-hidden">
                          <img 
                            src={company.banner_url} 
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CompanyMediaUpload
                        companyId={company.id}
                        currentUrl={company.banner_url}
                        folder="banners"
                        onUploadComplete={(url) => updateMutation.mutate({ banner_url: url })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">סלוגן (כותרת קצרה)</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      defaultValue={company.tagline || ''}
                      placeholder="לדוגמה: עיצוב מטבחים יוקרתי בהתאמה אישית"
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
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    שירותים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {company.services?.map((service, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {service}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="הוסף שירות חדש"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    />
                    <Button type="button" onClick={handleAddService} variant="outline">
                      הוסף
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
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
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={company.email || ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">טלפון</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={company.phone || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">אתר אינטרנט</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      defaultValue={company.website || ''}
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">כתובת</Label>
                      <Input
                        id="address"
                        name="address"
                        defaultValue={company.address || ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}