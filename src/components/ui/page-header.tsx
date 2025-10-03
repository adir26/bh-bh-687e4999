import * as React from "react";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  onBack?: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "minimal";
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    title, 
    subtitle, 
    showBackButton = true, 
    backUrl, 
    onBack, 
    className,
    children,
    variant = "default",
    ...props 
  }, ref) => {
    const navigate = useNavigate();

    const handleBack = () => {
      if (onBack) {
        onBack();
      } else if (backUrl) {
        navigate(backUrl);
      } else {
        navigate(-1);
      }
    };

    if (variant === "minimal") {
      return (
        <div
          ref={ref}
          className={cn(
            "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b pt-safe",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3 p-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-4",
          className
        )}
        {...props}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">{subtitle}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader };