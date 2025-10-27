import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import OnboardingProgress from '@/components/OnboardingProgress';
import { ChevronRight, Upload, Clock } from 'lucide-react';
import supplierBrandingImage from '@/assets/supplier-branding.jpg';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

export default function SupplierBranding() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: null as string | null,
    bannerUrl: null as string | null,
    logoFileName: null as string | null,
    bannerFileName: null as string | null,
    description: '',
    showBusinessHours: false,
    businessHours: {
      sunday: { open: '08:00', close: '17:00', closed: false },
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '14:00', closed: false },
      saturday: { open: '09:00', close: '13:00', closed: true }
    }
  });

  const days = [
    { key: 'sunday', label: 'ראשון' },
    { key: 'monday', label: 'שני' },
    { key: 'tuesday', label: 'שלישי' },
    { key: 'wednesday', label: 'רביעי' },
    { key: 'thursday', label: 'חמישי' },
    { key: 'friday', label: 'שישי' },
    { key: 'saturday', label: 'שבת' }
  ];

  const handleFileUpload = async (type: 'logo' | 'banner', file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('נא להעלות קובץ תמונה בלבד');
      return;
    }

    // Validate file size (5MB for logo, 10MB for banner)
    const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast.error(`גודל הקובץ חייב להיות עד ${type === 'logo' ? '5' : '10'}MB`);
      return;
    }

    setUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-media')
        .getPublicUrl(filePath);

      // Update form state with URL
      if (type === 'logo') {
        setFormData({
          ...formData,
          logoUrl: publicUrl,
          logoFileName: file.name
        });
      } else {
        setFormData({
          ...formData,
          bannerUrl: publicUrl,
          bannerFileName: file.name
        });
      }

      showToast.success('התמונה הועלתה בהצלחה');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showToast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    // Save progress to localStorage
    const currentData = JSON.parse(localStorage.getItem('supplierOnboarding') || '{}');
    localStorage.setItem('supplierOnboarding', JSON.stringify({
      ...currentData,
      branding: {
        logo: formData.logoUrl,
        coverImage: formData.bannerUrl,
        description: formData.description,
        businessHours: formData.showBusinessHours ? formData.businessHours : null
      },
      currentStep: 3
    }));
    navigate('/onboarding/supplier-products');
  };

  const handleBack = () => {
    navigate('/onboarding/supplier-company-info');
  };

  const isFormValid = formData.description.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <button 
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground p-2"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button 
          onClick={() => navigate('/registration')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={3} totalSteps={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {/* Hero Image */}
        <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
          <img 
            src={supplierBrandingImage}
            alt="עיצוב המותג"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הוסיפו את המיתוג שלכם
              </h1>
            </div>

            <div className="space-y-6">
              <div>
                <Label>לוגו החברה</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {uploading && !formData.logoUrl ? 'מעלה...' : formData.logoFileName ? formData.logoFileName : 'העלו לוגו (מומלץ 500x500px)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG עד 5MB
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label>תמונת רקע לעמוד</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('banner', e.target.files[0])}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {uploading && !formData.bannerUrl ? 'מעלה...' : formData.bannerFileName ? formData.bannerFileName : 'העלו תמונת רקע (מומלץ 1200x600px)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG עד 10MB
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">תיאור שמופיע ללקוחות *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ספרו על החברה שלכם, השירותים שאתם מציעים והניסיון שלכם..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    שעות פעילות
                  </Label>
                  <Switch
                    checked={formData.showBusinessHours}
                    onCheckedChange={(checked) => setFormData({...formData, showBusinessHours: checked})}
                  />
                </div>

                {formData.showBusinessHours && (
                  <div className="space-y-3 p-4 border border-border rounded-xl">
                    {days.map((day) => (
                      <div key={day.key} className="flex items-center gap-3">
                        <div className="w-16 text-sm">{day.label}</div>
                        <Switch
                          checked={!formData.businessHours[day.key as keyof typeof formData.businessHours].closed}
                          onCheckedChange={(checked) => 
                            setFormData({
                              ...formData,
                              businessHours: {
                                ...formData.businessHours,
                                [day.key]: {
                                  ...formData.businessHours[day.key as keyof typeof formData.businessHours],
                                  closed: !checked
                                }
                              }
                            })
                          }
                        />
                        {!formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                              onChange={(e) => 
                                setFormData({
                                  ...formData,
                                  businessHours: {
                                    ...formData.businessHours,
                                    [day.key]: {
                                      ...formData.businessHours[day.key as keyof typeof formData.businessHours],
                                      open: e.target.value
                                    }
                                  }
                                })
                              }
                              className="text-sm"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                              onChange={(e) => 
                                setFormData({
                                  ...formData,
                                  businessHours: {
                                    ...formData.businessHours,
                                    [day.key]: {
                                      ...formData.businessHours[day.key as keyof typeof formData.businessHours],
                                      close: e.target.value
                                    }
                                  }
                                })
                              }
                              className="text-sm"
                            />
                          </div>
                        )}
                        {formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                          <div className="flex-1 text-sm text-muted-foreground">
                            סגור
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 z-50" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleNext}
            disabled={!isFormValid || uploading}
            variant="blue"
            className="w-full py-4 text-lg rounded-xl h-14 font-medium"
          >
            {uploading ? 'מעלה תמונה...' : 'הבא'}
          </Button>
        </div>
      </div>
    </div>
  );
}
