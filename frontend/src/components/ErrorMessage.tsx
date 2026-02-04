import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage = ({ message, onDismiss, className }: ErrorMessageProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-up",
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      <p className="text-destructive text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-destructive/20 transition-colors"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
      )}
    </div>
  );
};
