import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  phonePrefix: z.string().min(1, 'יש לבחור קידומת'),
  phoneNumber: z.string().min(7, 'מספר טלפון לא תקין'),
  role: z.enum(['client', 'supplier'], { required_error: 'יש לבחור תפקיד' }),
  agreeToTerms: z.boolean().refine((val) => val === true, 'יש להסכים לתנאי השירות')
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const phonePrefixes = [
  { value: '+972', label: '+972 (ישראל)' },
  { value: '+1', label: '+1 (ארה"ב)' },
  { value: '+44', label: '+44 (בריטניה)' },
  { value: '+33', label: '+33 (צרפת)' },
  { value: '+49', label: '+49 (גרמניה)' }
];

export default function Registration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phonePrefix: '+972',
      phoneNumber: '',
      role: 'client',
      agreeToTerms: false
    }
  });

  const onSubmit = (data: RegistrationForm) => {
    console.log('Registration data:', data);
    // Store registration data and navigate to onboarding
    localStorage.setItem('registrationData', JSON.stringify(data));
    navigate('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Header Image */}
      <div className="relative h-48 md:h-64">
        <img 
          src="/lovable-uploads/fff68834-a175-4947-9155-edee5597a68d.png"
          alt="Building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 right-4 text-white">
          <h1 className="text-xl font-bold">Building here</h1>
          <p className="text-sm opacity-90">נתחיל לבנות את החלום שלכם</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">הרשמה</h2>
              <p className="text-gray-600 mt-2">צרו חשבון חדש כדי להתחיל</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם מלא</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכניסו את השם המלא" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>כתובת אימייל</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="example@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>סיסמה</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="לפחות 6 תווים"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label>מספר טלפון</Label>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="phonePrefix"
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {phonePrefixes.map((prefix) => (
                                  <SelectItem key={prefix.value} value={prefix.value}>
                                    {prefix.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="50-123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>תפקיד</FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="client" id="client" />
                            <Label htmlFor="client">לקוח</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="supplier" id="supplier" />
                            <Label htmlFor="supplier">ספק</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms Agreement */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          אני מסכים/ה <a href="#" className="text-blue-600 underline">לתנאי השירות</a> ו<a href="#" className="text-blue-600 underline">למדיניות הפרטיות</a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  הרשמה
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                כבר יש לכם חשבון?{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  התחברו כאן
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}