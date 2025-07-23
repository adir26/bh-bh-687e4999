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
import { Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import registrationImage from '@/assets/registration-building.jpg';

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
    // Store registration data and navigate to appropriate onboarding
    localStorage.setItem('registrationData', JSON.stringify(data));
    
    if (data.role === 'supplier') {
      navigate('/onboarding/supplier-welcome');
    } else {
      navigate('/onboarding/welcome');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-end items-center border-b border-border">
        <button 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 mx-6 mb-6 rounded-2xl overflow-hidden">
        <img 
          src={registrationImage}
          alt="בניין מודרני"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-6 right-6 text-white">
          <h1 className="text-2xl font-bold mb-1">Building Here</h1>
          <p className="text-white/90">נתחיל לבנות את החלום שלכם</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">הרשמה</h2>
            <p className="text-muted-foreground">צרו חשבון חדש כדי להתחיל</p>
          </div>

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
                      <Input {...field} placeholder="הכניסו את השם המלא" className="rounded-xl h-12 bg-muted/50 border-muted" />
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
                    <FormLabel className="text-foreground font-medium">כתובת אימייל</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="example@email.com" className="rounded-xl h-12 bg-muted/50 border-muted" />
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
                    <FormLabel className="text-foreground font-medium">סיסמה</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="לפחות 6 תווים"
                          className="rounded-xl h-12 bg-muted/50 border-muted pl-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                <Label className="text-foreground font-medium">מספר טלפון</Label>
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="phonePrefix"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-muted">
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
                          <Input {...field} placeholder="50-123-4567" className="rounded-xl h-12 bg-muted/50 border-muted" />
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
                    <FormLabel className="text-foreground font-medium">תפקיד</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="client" id="client" />
                          <Label htmlFor="client" className="text-sm font-normal cursor-pointer">לקוח</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="supplier" id="supplier" />
                          <Label htmlFor="supplier" className="text-sm font-normal cursor-pointer">ספק</Label>
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
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-foreground">
                        אני מסכים/ה <a href="#" className="text-primary underline">לתנאי השירות</a> ו<a href="#" className="text-primary underline">למדיניות הפרטיות</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              כבר יש לכם חשבון?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                התחברו כאן
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 z-50">
        <div className="max-w-md mx-auto">
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg rounded-xl h-14 font-medium"
          >
            הרשמה
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}