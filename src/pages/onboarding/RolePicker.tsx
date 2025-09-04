import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Home, User, ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RolePicker: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'supplier' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;

    setIsUpdating(true);
    try {
      console.log('[ROLE PICKER] Updating role to:', selectedRole);
      
      // Update the user's role in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          onboarding_status: 'in_progress',
          onboarding_step: 1, // Start at step 1 after role selection
          onboarding_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      console.log('[ROLE PICKER] Role updated successfully, navigating...');
      toast.success(`תפקיד ${selectedRole === 'client' ? 'לקוח' : 'ספק'} נבחר בהצלחה!`);

      // Add a small delay to ensure profile is updated before navigation
      setTimeout(() => {
        const route = selectedRole === 'supplier' 
          ? '/onboarding/supplier-welcome' 
          : '/onboarding/welcome';
        
        navigate(route, { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('שגיאה בעדכון התפקיד');
    } finally {
      setIsUpdating(false);
    }
  };

  const roles = [
    {
      id: 'client' as const,
      title: 'לקוח',
      subtitle: 'אני מחפש שירותים לבית',
      description: 'מעצבים, קבלנים, ספקים ועוד לפרויקט הבא שלך',
      icon: Home,
      benefits: [
        'גישה לספקים מובילים',
        'השוואת מחירים',
        'ניהול פרויקטים',
        'ייעוץ מקצועי'
      ],
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'supplier' as const,
      title: 'ספק / קבלן',
      subtitle: 'אני מספק שירותים לבית',
      description: 'הצג את השירותים שלך ומצא לקוחות חדשים',
      icon: Building2,
      benefits: [
        'חשיפה ללקוחות',
        'ניהול הזמנות',
        'כלי שיווק מתקדמים',
        'מערכת CRM'
      ],
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              איך תרצה להשתמש בפלטפורמה?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              בחר את התפקיד המתאים לך כדי לקבל חוויה מותאמת אישית
            </p>
          </div>

          {/* Role Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <Card
                  key={role.id}
                  className={`p-6 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/5 border-primary'
                      : 'hover:shadow-lg border-border'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${role.color} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${role.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {role.title}
                        </h3>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            נבחר
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {role.subtitle}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        {role.description}
                      </p>
                      
                      {/* Benefits */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">יתרונות:</h4>
                        <div className="space-y-1">
                          {role.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isUpdating}
              size="lg"
              className="min-w-48"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  מעדכן...
                </>
              ) : (
                <>
                  המשך
                  <ArrowRight className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              תוכל לשנות את התפקיד שלך בהגדרות הפרופיל בכל עת
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePicker;