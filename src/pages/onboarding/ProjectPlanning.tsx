import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ChevronRight, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const projectPlanningSchema = z.object({
  projectTypes: z.array(z.string()).min(1, 'יש לבחור לפחות סוג פרויקט אחד'),
  otherProject: z.string().optional(),
  startDate: z.date().optional()
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
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const form = useForm<ProjectPlanningForm>({
    resolver: zodResolver(projectPlanningSchema),
    defaultValues: {
      projectTypes: [],
      otherProject: '',
      startDate: undefined
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

  const onSubmit = (data: ProjectPlanningForm) => {
    console.log('Project planning:', data);
    localStorage.setItem('projectPlanning', JSON.stringify(data));
    navigate('/onboarding/documents');
  };

  const handleBack = () => {
    navigate('/onboarding/home-details');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500">שלב 3</div>
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
              מה אתם מתכננים לעשות?
            </h1>
            <p className="text-gray-600">
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
                    <FormLabel className="text-base font-medium">סוגי פרויקטים</FormLabel>
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
                      <FormLabel>תאר את הפרויקט</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכניסו תיאור של הפרויקט" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>תאריך התחלה מתוכנן</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
