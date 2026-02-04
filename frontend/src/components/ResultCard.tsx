import { User, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "./ConfidenceBar";

interface DetectionResult {
  classification: "HUMAN" | "AI_GENERATED";
  confidence: number;
  explanation: string;
}

interface ResultCardProps {
  result: DetectionResult;
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const isHuman = result.classification === "HUMAN";

  return (
    <div 
      className={cn(
        "card-glass p-6 animate-fade-up",
        isHuman ? "glow-success" : "glow-destructive"
      )}
    >
      {/* Classification Header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={cn(
          "p-4 rounded-xl",
          isHuman ? "bg-success/20" : "bg-destructive/20"
        )}>
          {isHuman ? (
            <User className={cn("w-10 h-10", "text-success")} />
          ) : (
            <Bot className={cn("w-10 h-10", "text-destructive")} />
          )}
        </div>
        
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            {isHuman ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              Detection Result
            </span>
          </div>
          <h3 className={cn(
            "text-3xl font-bold tracking-tight",
            isHuman ? "text-success" : "text-destructive"
          )}>
            {isHuman ? "Human Voice" : "AI Generated"}
          </h3>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6">
        <ConfidenceBar confidence={result.confidence} isHuman={isHuman} />
      </div>

      {/* Explanation */}
      <div className="border-t border-border/50 pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Analysis Explanation
        </h4>
        <p className="text-foreground/90 leading-relaxed">
          {result.explanation}
        </p>
      </div>
    </div>
  );
};
