import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SupplierHeader } from '@/components/SupplierHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { showToast } from '@/utils/toast';
import { Loader2, Save, X, Upload, Trash2, Plus } from 'lucide-react';
import { BusinessHoursEditor } from '@/components/supplier/BusinessHoursEditor';
import { MeetingAvailabilityEditor } from '@/components/supplier/MeetingAvailabilityEditor';
import { PriceRangeEditor } from '@/components/supplier/PriceRangeEditor';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'שם החברה חייב להכיל לפחות 2 תווים'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  about_text: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditCompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newService, setNewService] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState<any>({});
  const [meetingAvailability, setMeetingAvailability] = useState<any>({
    available_days: [],
    hours: { start: '09:00', end: '17:00' },
    notes: '',
  });
  const [priceRange, setPriceRange] = useState<any>({
    min: 0,
    max: 0,
    currency: 'ILS',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: company ? {
      name: company.name || '',
      tagline: company.tagline || '',
      description: company.description || '',
      about_text: company.about_text || '',
      email: company.email || '',
      phone: company.phone || '',
      website: company.website || '',
      address: company.address || '',
      city: company.city || '',
      area: company.area || '',
    } : undefined,
  });

  // Initialize state when company data loads
  React.useEffect(() => {
    if (company) {
      // Safely handle services as array of strings
      const servicesArray = Array.isArray(company.services) 
        ? company.services.filter((s): s is string => typeof s === 'string')
        : [];
      setServices(servicesArray);
      
      setBusinessHours(company.business_hours || {});
      setMeetingAvailability(company.meeting_availability || {
        available_days: [],
        hours: { start: '09:00', end: '17:00' },
        notes: '',
      });
      setPriceRange(company.price_range || {
        min: 0,
        max: 0,
        currency: 'ILS',
      });
      setLogoPreview(company.logo_url);
      setBannerPreview(company.banner_url);
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!company?.id) throw new Error('No company found');

      // Upload logo if changed
      let logoUrl = company.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${company.id}/logo-${Date.now()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('company_media')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('company_media')
          .getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      // Upload banner if changed
      let bannerUrl = company.banner_url;
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${company.id}/banner-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('company_media')
          .upload(fileName, bannerFile, { upsert: true });

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('company_media')
          .getPublicUrl(fileName);
        bannerUrl = publicUrl;
      }

      const { data: updatedData, error } = await supabase
        .from('companies')
        .update({
          ...data,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          services,
          business_hours: businessHours,
          meeting_availability: meetingAvailability,
          price_range: priceRange,
        })
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', user?.id] });
      showToast.success('הפרופיל עודכן בהצלחה');
      navigate('/supplier/profile');
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      showToast.error(error.message || 'שגיאה בעדכון הפרופיל');
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">לא נמצא פרופיל חברה</p>
            <Button onClick={() => navigate('/supplier/dashboard')} className="mt-4">
              חזרה לדשבורד
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SupplierHeader 
        title="עריכת פרופיל"
        subtitle="ערוך את פרטי החברה שלך"
        showBackButton={true}
        backUrl="/supplier/profile"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">תמונות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm sm:text-base">לוגו</Label>
                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border"
                    />
                  )}
                  <div className="w-full sm:w-auto">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">באנר</Label>
                <div className="mt-2 space-y-2">
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">פרטים בסיסיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם החברה *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סלוגן</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="סלוגן קצר ומושך" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תיאור קצר</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="תיאור קצר של החברה" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אודות מפורט</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={6} 
                        placeholder="ספר בפירוט על החברה - ניסיון, פרויקטים, מה מייחד אותך..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">פרטי קשר</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אימייל</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אתר אינטרנט</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" dir="ltr" placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>עיר</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אזור</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: מרכז, צפון, דרום" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>כתובת</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">שירותים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="הוסף שירות חדש..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddService} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <Badge key={service} variant="secondary" className="gap-1">
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <PriceRangeEditor value={priceRange} onChange={setPriceRange} />

          {/* Business Hours */}
          <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />

          {/* Meeting Availability */}
          <MeetingAvailabilityEditor value={meetingAvailability} onChange={setMeetingAvailability} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sticky bottom-2 sm:bottom-4 bg-background/95 backdrop-blur p-3 sm:p-4 border rounded-lg shadow-lg">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 gap-2 h-11 sm:h-10"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  שמור שינויים
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/supplier/profile')}
              disabled={updateMutation.isPending}
              className="h-11 sm:h-10 sm:w-auto"
            >
              ביטול
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
