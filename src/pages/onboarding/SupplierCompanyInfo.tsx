import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OnboardingProgress from '@/components/OnboardingProgress';
import { ChevronRight } from 'lucide-react';
import supplierCompanyImage from '@/assets/supplier-company-info.jpg';

export default function SupplierCompanyInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    category: '',
    operatingArea: '',
    contactName: '',
    phone: '',
    email: '',
    website: ''
  });

  const categories = [
    'קבלני שיפוצים',
    'חשמלאים',
    'אינסטלטורים',
    'מתקיני מיזוג אוויר',
    'נגרים',
    'מעצבי פנים',
    'אדריכלים',
    'מתכנני מטבחים',
    'חברות ניקיון',
    'חברות הובלה',
    'יועצי משכנתאות',
    'אחר'
  ];

  const handleNext = () => {
    // Save progress to localStorage
    localStorage.setItem('supplierOnboarding', JSON.stringify({
      ...JSON.parse(localStorage.getItem('supplierOnboarding') || '{}'),
      companyInfo: formData,
      currentStep: 2
    }));
    navigate('/onboarding/supplier-branding');
  };

  const handleBack = () => {
    navigate('/onboarding/supplier-welcome');
  };

  const isFormValid = formData.companyName && formData.category && formData.operatingArea && 
                     formData.contactName && formData.phone && formData.email;

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
      <OnboardingProgress currentStep={2} totalSteps={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {/* Hero Image */}
        <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
          <img 
            src={supplierCompanyImage}
            alt="פרטי החברה"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                פרטי החברה
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">שם החברה *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  placeholder="הזינו את שם החברה"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">תחום פעילות *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="בחרו תחום פעילות" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="operatingArea">אזור פעילות *</Label>
                <Input
                  id="operatingArea"
                  value={formData.operatingArea}
                  onChange={(e) => setFormData({...formData, operatingArea: e.target.value})}
                  placeholder="למשל: תל אביב והמרכז"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactName">שם איש קשר *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  placeholder="שם מלא"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">מספר טלפון *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="050-1234567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">כתובת מייל *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@company.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website">אתר אינטרנט או רשתות חברתיות (אופציונלי)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="www.company.com או קישור לפייסבוק"
                  className="mt-1"
                />
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
