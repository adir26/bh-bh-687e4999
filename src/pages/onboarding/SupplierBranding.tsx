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

export default function SupplierBranding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    logo: null as File | null,
    banner: null as File | null,
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

  const handleFileUpload = (type: 'logo' | 'banner', file: File) => {
    setFormData({...formData, [type]: file});
  };

  const handleNext = () => {
    // Save progress to localStorage
    const currentData = JSON.parse(localStorage.getItem('supplierOnboarding') || '{}');
    localStorage.setItem('supplierOnboarding', JSON.stringify({
      ...currentData,
      branding: {
        ...formData,
        logo: formData.logo?.name || null,
        banner: formData.banner?.name || null
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
      <div className="flex-1 flex flex-col pb-32">
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
              {/* Logo Upload */}
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
                      {formData.logo ? formData.logo.name : 'העלו לוגו (מומלץ 500x500px)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG עד 5MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Banner Upload */}
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
                      {formData.banner ? formData.banner.name : 'העלו תמונת רקע (מומלץ 1200x600px)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG עד 10MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Description */}
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

              {/* Business Hours */}
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
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleNext}
            disabled={!isFormValid}
            variant="blue"
            className="w-full py-4 text-lg rounded-xl h-14 font-medium"
          >
            הבא
          </Button>
        </div>
      </div>
    </div>
  );
}