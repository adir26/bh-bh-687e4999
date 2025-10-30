import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: number | null;
  breakdown?: {
    budget: number;
    urgency: number;
    category: number;
    completeness: number;
    intent: number;
  };
  hasConsent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LeadScoreBadge({ 
  score, 
  breakdown, 
  hasConsent = true,
  size = 'md' 
}: LeadScoreBadgeProps) {
  if (!hasConsent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              ללא הסכמה
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">הלקוח לא אישר שיתוף פרטים</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        לא חושב
      </Badge>
    );
  }

  const getScoreConfig = (s: number) => {
    if (s >= 80) {
      return {
        label: 'Hot',
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: TrendingUp,
        emoji: '🔥'
      };
    }
    if (s >= 55) {
      return {
        label: 'Warm',
        variant: 'secondary' as const,
        className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
        icon: Minus,
        emoji: '🟠'
      };
    }
    return {
      label: 'Cold',
      variant: 'outline' as const,
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      icon: TrendingDown,
      emoji: '🔵'
    };
  };

  const config = getScoreConfig(score);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`gap-1.5 ${config.className} ${sizeClasses[size]} cursor-help`}
          >
            <span className="text-base leading-none">{config.emoji}</span>
            <span>{Math.round(score)}/100</span>
            <span className="opacity-70">·</span>
            <span className="font-semibold">{config.label}</span>
            <Icon className="h-3.5 w-3.5" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p className="font-semibold mb-2">פירוט הציון:</p>
            {breakdown && (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span>תקציב:</span>
                  <span className="font-mono">+{breakdown.budget}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>דחיפות:</span>
                  <span className="font-mono">+{breakdown.urgency}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>קטגוריה:</span>
                  <span className="font-mono">+{breakdown.category}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>שלמות מידע:</span>
                  <span className="font-mono">+{breakdown.completeness}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>כוונה:</span>
                  <span className="font-mono">+{breakdown.intent}</span>
                </div>
                <div className="border-t border-border pt-1 mt-2 flex justify-between gap-4 font-semibold">
                  <span>סה״כ:</span>
                  <span className="font-mono">{Math.round(score)}/100</span>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
