import { useState, useCallback } from "react";
import { Mic, Shield, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ResultCard } from "@/components/ResultCard";
import { ErrorMessage } from "@/components/ErrorMessage";
import { detectVoice, type DetectionResult } from "@/lib/api";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result?.split(",")[1];
        if (!base64) {
          reject(new Error("Could not read file as audio. Try a different format (e.g. MP3 or WAV)."));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64Audio = await convertToBase64(selectedFile);
      const data = await detectVoice(base64Audio);
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      const message = err instanceof Error ? err.message : "Failed to analyze audio. Please try again.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Advanced Audio Analysis</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            AI Generated Voice
            <span className="text-gradient-primary"> Detection</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Detect whether a voice is Human or AI-generated
          </p>
          
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Our advanced neural network analyzes audio patterns, vocal characteristics, 
            and speech artifacts to determine the authenticity of voice recordings with high accuracy.
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Upload Card */}
          <div className="card-glass p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Voice Sample
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upload an MP3 voice sample for analysis
                </p>
              </div>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              disabled={isAnalyzing}
            />

            <div className="mt-6">
              <Button
                variant="glow"
                size="xl"
                className="w-full"
                disabled={!selectedFile || isAnalyzing}
                onClick={handleAnalyze}
              >
                <Cpu className="w-5 h-5" />
                {isAnalyzing ? "Analyzing..." : "Analyze Voice"}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="card-glass p-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && (
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          )}

          {/* Result Card */}
          {result && !isAnalyzing && (
            <ResultCard result={result} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Powered by advanced machine learning technology</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
