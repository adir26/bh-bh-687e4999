import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ChevronRight, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingSkip } from '@/hooks/useOnboardingSkip';
import projectPlanningImage from '@/assets/project-planning.jpg';

const projectPlanningSchema = z.object({
  projectTypes: z.array(z.string()).min(1, 'יש לבחור לפחות סוג פרויקט אחד'),
  otherProject: z.string().optional(),
  budgetRange: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

type ProjectPlanningForm = z.infer<typeof projectPlanningSchema>;

const projectOptions = [
  { id: 'kitchen', label: 'שדרוג מטבח' },
  { id: 'living', label: 'עיצוב סלון' },
  { id: 'bathroom', label: 'שיפוץ חדר רחצה' },
  { id: 'electrical', label: 'חשמל או בית חכם' },
  { id: 'other', label: 'אחר' }
];

export default function OnboardingProjectPlanning() {
  const navigate = useNavigate();
  const { updateOnboardingStep } = useAuth();
  const { skipOnboarding } = useOnboardingSkip();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const form = useForm<ProjectPlanningForm>({
    resolver: zodResolver(projectPlanningSchema),
    defaultValues: {
      projectTypes: [],
      otherProject: '',
      budgetRange: undefined,
      startDate: undefined,
      endDate: undefined
    }
  });

  const handleProjectToggle = (projectId: string) => {
    const updatedProjects = selectedProjects.includes(projectId)
      ? selectedProjects.filter(id => id !== projectId)
      : [...selectedProjects, projectId];
    
    setSelectedProjects(updatedProjects);
    setShowOtherInput(updatedProjects.includes('other'));
    form.setValue('projectTypes', updatedProjects);
  };

  const onSubmit = async (data: ProjectPlanningForm) => {
    console.log('Project planning:', data);
    localStorage.setItem('projectPlanning', JSON.stringify(data));
    
    // Update onboarding step to 4 when moving to documents
    if (updateOnboardingStep) {
      await updateOnboardingStep(4);
    }
    
    navigate('/onboarding/documents');
  };

  const handleBack = () => {
    navigate('/onboarding/home-details');
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
      <OnboardingProgress currentStep={3} totalSteps={5} />

      {/* Planning Image */}
      <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
        <img 
          src={projectPlanningImage}
          alt="תכנון פרויקט"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              מה אתם מתכננים לעשות?
            </h1>
            <p className="text-muted-foreground">
              מה אתם מתכננים לעשות בדירה?
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Types */}
              <FormField
                control={form.control}
                name="projectTypes"
                render={() => (
                   <FormItem>
                     <FormLabel className="text-base font-medium text-foreground">סוגי פרויקטים</FormLabel>
                     <div className="space-y-3">
                      {projectOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={option.id}
                            checked={selectedProjects.includes(option.id)}
                            onCheckedChange={() => handleProjectToggle(option.id)}
                          />
                          <Label 
                            htmlFor={option.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Project Input */}
              {showOtherInput && (
                <FormField
                  control={form.control}
                  name="otherProject"
                  render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground font-medium">תאר את הפרויקט</FormLabel>
                     <FormControl>
                       <Input {...field} placeholder="הכניסו תיאור של הפרויקט" className="rounded-xl h-12 bg-muted/50 border-muted" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                  )}
                />
              )}

              {/* Budget Range */}
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium text-foreground">
                      מה התקציב המשוער לפרויקט?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <RadioGroupItem value="0-50000" id="budget-1" />
                          <Label 
                            htmlFor="budget-1"
                            className="text-sm font-normal cursor-pointer"
                          >
                            עד 50,000 ₪
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <RadioGroupItem value="50000-150000" id="budget-2" />
                          <Label 
                            htmlFor="budget-2"
                            className="text-sm font-normal cursor-pointer"
                          >
                            50,000–150,000 ₪
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <RadioGroupItem value="150000-350000" id="budget-3" />
                          <Label 
                            htmlFor="budget-3"
                            className="text-sm font-normal cursor-pointer"
                          >
                            150,000–350,000 ₪
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <RadioGroupItem value="350000+" id="budget-4" />
                          <Label 
                            htmlFor="budget-4"
                            className="text-sm font-normal cursor-pointer"
                          >
                            מעל 350,000 ₪
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel className="text-foreground font-medium">תאריך התחלה מתוכנן</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant="outline"
                             className={cn(
                               "w-full pl-3 text-left font-normal rounded-xl h-12 bg-muted/50 border-muted",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                            {field.value ? (
                              format(field.value, "PPP", { locale: he })
                            ) : (
                              <span>בחרו תאריך</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground font-medium">תאריך סיום מתוכנן</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-xl h-12 bg-muted/50 border-muted",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: he })
                            ) : (
                              <span>בחרו תאריך</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 z-50" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
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
