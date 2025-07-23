
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ChevronRight } from 'lucide-react';
import OnboardingProgress from '@/components/OnboardingProgress';
import luxuryBuilding from '@/assets/luxury-building.jpg';

const homeDetailsSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  apartmentSize: z.string().min(1, 'גודל דירה נדרש'),
  floorNumber: z.string().min(1, 'מספר קומה נדרש'),
  numberOfRooms: z.string().min(1, 'מספר חדרים נדרש'),
  streetAndBuilding: z.string().min(2, 'רחוב ומספר בית נדרשים'),
  apartmentNumber: z.string().optional()
});

type HomeDetailsForm = z.infer<typeof homeDetailsSchema>;

export default function OnboardingHomeDetails() {
  const navigate = useNavigate();

  const form = useForm<HomeDetailsForm>({
    resolver: zodResolver(homeDetailsSchema),
    defaultValues: {
      fullName: '',
      apartmentSize: '',
      floorNumber: '',
      numberOfRooms: '',
      streetAndBuilding: '',
      apartmentNumber: ''
    }
  });

  const onSubmit = (data: HomeDetailsForm) => {
    console.log('Home details:', data);
    localStorage.setItem('homeDetails', JSON.stringify(data));
    navigate('/onboarding/project-planning');
  };

  const handleBack = () => {
    navigate('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={2} totalSteps={5} />

      {/* Building Image */}
      <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
        <img 
          src={luxuryBuilding}
          alt="בניין יוקרתי"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ספרו לנו על הבית שלכם
            </h1>
            <p className="text-muted-foreground">
              נצטרך כמה פרטים בסיסיים על הנכס
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">שם מלא</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="הכניסו את השם המלא שלכם" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {/* Apartment Size */}
              <FormField
                control={form.control}
                name="apartmentSize"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">גודל הדירה (במ"ר)</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="למשל: 90" type="number" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {/* Floor Number */}
              <FormField
                control={form.control}
                name="floorNumber"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">קומה</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="למשל: 3" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {/* Number of Rooms */}
              <FormField
                control={form.control}
                name="numberOfRooms"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">מספר חדרים</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="למשל: 4" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {/* Street and Building */}
              <FormField
                control={form.control}
                name="streetAndBuilding"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">רחוב ומספר בית</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="למשל: רחוב הרצל 25" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {/* Apartment Number (Optional) */}
              <FormField
                control={form.control}
                name="apartmentNumber"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">מספר דירה (אופציונלי)</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="למשל: 12" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-safe z-50">
        <div className="max-w-md mx-auto">
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg rounded-xl h-14 font-medium"
          >
            המשך
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
