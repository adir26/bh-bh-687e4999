import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OnboardingProgress from '@/components/OnboardingProgress';
import { ChevronRight, Building2, MapPin, Phone, Mail, Clock, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import supplierSuccessImage from '@/assets/supplier-success.jpg';

interface OnboardingData {
  companyInfo: {
    companyName: string;
    category: string;
    operatingArea: string;
    contactName: string;
    phone: string;
    email: string;
    website?: string;
  };
  branding?: {
    description?: string;
    showBusinessHours?: boolean;
    businessHours?: any;
  };
  products?: Array<{
    name: string;
    category: string;
    price: number;
    description: string;
  }>;
}

export default function SupplierSummary() {
  const navigate = useNavigate();
  const { user, getRoute } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('supplierOnboarding');
    if (savedData) {
      const data = JSON.parse(savedData);
      // Ensure companyInfo exists
      if (data.companyInfo) {
        setOnboardingData(data);
      } else {
        toast.error('נתונים חסרים. אנא השלם את תהליך ההרשמה.');
        navigate('/onboarding/supplier-welcome');
      }
    } else {
      toast.error('נתונים חסרים. אנא השלם את תהליך ההרשמה.');
      navigate('/onboarding/supplier-welcome');
    }
  }, [navigate]);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // Import services
      const { onboardingService } = await import('@/services/onboardingService');
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!onboardingData) {
        throw new Error('No onboarding data found');
      }
      
      const result = await onboardingService.saveSupplierOnboarding(user.id, onboardingData);
      
      if (result.success) {
        // Clear onboarding data
        localStorage.removeItem('supplierOnboarding');
        toast.success('הפרופיל פורסם בהצלחה!');
        
        // Navigate to appropriate dashboard using getRoute
        const dashboardRoute = getRoute(false);
        navigate(dashboardRoute);
      } else {
        throw new Error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Error publishing supplier profile:', error);
      toast.error('שגיאה בפרסום הפרופיל');
    }
    
    setIsPublishing(false);
  };

  const handleBack = () => {
    navigate('/onboarding/supplier-products');
  };

  const companyInfo = onboardingData?.companyInfo;
  const branding = onboardingData?.branding;
  const products = onboardingData?.products;

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען נתונים...</p>
        </div>
      </div>
    );
  }

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
      <OnboardingProgress currentStep={5} totalSteps={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col pb-24">
        {/* Hero Image */}
        <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
          <img 
            src={supplierSuccessImage}
            alt="הפרופיל מוכן לפרסום"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Summary Content */}
        <div className="flex-1 px-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הפרופיל שלכם מוכן!
              </h1>
              <p className="text-muted-foreground">
                סקירה של הפרטים שהזנתם
              </p>
            </div>

            <div className="space-y-4">
              {companyInfo && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Building2 className="w-5 h-5" />
                      פרטי החברה
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>שם החברה:</strong> {companyInfo.companyName}</div>
                      <div><strong>תחום פעילות:</strong> {companyInfo.category}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {companyInfo.operatingArea}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {companyInfo.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {companyInfo.email}
                      </div>
                      {companyInfo.website && (
                        <div><strong>אתר:</strong> {companyInfo.website}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {branding?.description && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Package className="w-5 h-5" />
                      תיאור החברה
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {branding.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {branding?.showBusinessHours && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Clock className="w-5 h-5" />
                      שעות פעילות
                    </div>
                    <div className="text-sm text-muted-foreground">
                      שעות פעילות הוגדרו ויוצגו ללקוחות
                    </div>
                  </CardContent>
                </Card>
              )}

              {products && products.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Package className="w-5 h-5" />
                      מוצרים ושירותים ({products.length})
                    </div>
                    <div className="grid gap-3">
                      {products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(!products || products.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      תוכלו להוסיף מוצרים ושירותים מהפאנל ניהול אחר כך
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-8 z-50">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            variant="blue"
            className="w-full py-4 text-lg rounded-xl h-14 font-medium"
          >
            {isPublishing ? 'מפרסמים את הדף שלכם...' : 'פרסמו את דף החברה שלכם'}
          </Button>
          
          <Button 
            onClick={() => navigate(getRoute(false))}
            variant="blue-secondary"
            className="w-full py-3 text-base rounded-xl h-12 font-medium"
          >
            עבור לדשבורד הספק
          </Button>
        </div>
      </div>
    </div>
  );
}
