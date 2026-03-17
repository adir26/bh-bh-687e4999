import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { withTimeout } from '@/lib/withTimeout';

interface CompletionStep {
  label: string;
  done: boolean;
  path: string;
}

export function ProfileCompletionCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['profile-completion', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: company } = await withTimeout(
        supabase
          .from('companies')
          .select('name, description, logo_url, banner_url, gallery, business_hours, phone, email, services, tagline, slug')
          .eq('owner_id', user!.id)
          .maybeSingle(),
        10_000
      );

      if (!company) return { steps: [], percentage: 0, slug: null };

      const gallery = Array.isArray(company.gallery) ? company.gallery : [];
      const services = Array.isArray(company.services) ? company.services : [];
      const hours = company.business_hours && typeof company.business_hours === 'object' ? Object.keys(company.business_hours) : [];

      const steps: CompletionStep[] = [
        { label: 'שם חברה', done: !!company.name, path: '/supplier/profile/edit' },
        { label: 'לוגו', done: !!company.logo_url, path: '/supplier/profile/edit' },
        { label: 'תיאור (50+ תווים)', done: !!company.description && company.description.length >= 50, path: '/supplier/profile/edit' },
        { label: 'סלוגן', done: !!company.tagline, path: '/supplier/profile/edit' },
        { label: 'באנר', done: !!company.banner_url, path: '/supplier/profile/edit' },
        { label: 'טלפון', done: !!company.phone, path: '/supplier/profile/edit' },
        { label: 'אימייל', done: !!company.email, path: '/supplier/profile/edit' },
        { label: 'שירותים (1+)', done: services.length > 0, path: '/supplier/profile/edit' },
        { label: 'שעות פעילות', done: hours.length > 0, path: '/supplier/profile/edit' },
        { label: 'גלריה (3+ תמונות)', done: gallery.length >= 3, path: '/supplier/profile/edit' },
      ];

      const doneCount = steps.filter(s => s.done).length;
      const percentage = Math.round((doneCount / steps.length) * 100);

      return { steps, percentage, slug: company.slug };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.percentage === 100) return null;

  const incompleteSteps = data.steps.filter(s => !s.done).slice(0, 3);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">השלמת פרופיל</CardTitle>
          <span className="text-sm font-bold text-primary">{data.percentage}%</span>
        </div>
        <Progress value={data.percentage} className="mt-2" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-2">
        <p className="text-xs text-muted-foreground mb-2">
          פרופיל מלא מקבל עד 3x יותר פניות מלקוחות
        </p>
        {incompleteSteps.map((step, i) => (
          <button
            key={i}
            className="flex items-center gap-2 w-full text-right p-2 rounded-lg hover:bg-background/60 transition-colors group"
            onClick={() => navigate(step.path)}
          >
            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs sm:text-sm flex-1">{step.label}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
        {data.steps.filter(s => !s.done).length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{data.steps.filter(s => !s.done).length - 3} שלבים נוספים
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 min-h-[40px]" onClick={() => navigate('/supplier/profile/edit')}>
            השלם פרופיל
          </Button>
          {data.slug && (
            <Button size="sm" variant="outline" className="min-h-[40px]" onClick={() => window.open(`/s/${data.slug}`, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
