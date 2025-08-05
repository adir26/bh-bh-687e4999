import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps extends React.ComponentProps<"input"> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, showClearButton = true, value, ...props }, ref) => {
    const showClear = showClearButton && value && String(value).length > 0;

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          value={value}
          className={cn(
            "pr-10",
            showClear && "pl-10",
            className
          )}
          {...props}
        />
        {showClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted-foreground/10 rounded-full"
            onClick={handleClear}
            tabIndex={-1}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };