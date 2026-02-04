import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ className, text = "Analyzing audio… please wait" }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-2 border-muted animate-spin-slow" />
        
        {/* Inner spinning ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};
