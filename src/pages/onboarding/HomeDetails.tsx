import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500">שלב 2</div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ספרו לנו על הבית שלכם
            </h1>
            <p className="text-gray-600">
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
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="הכניסו את השם המלא שלכם" />
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
                    <FormLabel>גודל הדירה (במ"ר)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: 90" type="number" />
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
                    <FormLabel>קומה</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: 3" />
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
                    <FormLabel>מספר חדרים</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: 4" />
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
                    <FormLabel>רחוב ומספר בית</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: רחוב הרצל 25" />
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
                    <FormLabel>מספר דירה (אופציונלי)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="למשל: 12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                המשך
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center pb-6">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}