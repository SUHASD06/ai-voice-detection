import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  isHuman: boolean;
}

export const ConfidenceBar = ({ confidence, isHuman }: ConfidenceBarProps) => {
  const percentage = Math.round(confidence * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Confidence Score
        </span>
        <span className={cn(
          "text-lg font-bold font-mono",
          isHuman ? "text-success" : "text-destructive"
        )}>
          {percentage}%
        </span>
      </div>
      
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 animate-progress-fill",
            isHuman 
              ? "bg-gradient-to-r from-success/80 to-success" 
              : "bg-gradient-to-r from-destructive/80 to-destructive"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
