import { useState, useRef, useCallback } from "react";
import { Upload, FileAudio, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export const FileUpload = ({ onFileSelect, selectedFile, disabled }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "audio/mpeg" || file.name.endsWith(".mp3")) {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
        "hover:border-primary/50 hover:bg-muted/30",
        isDragOver && "border-primary bg-primary/10 scale-[1.02]",
        selectedFile && "border-primary/50 bg-muted/20",
        disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,audio/mpeg"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 rounded-lg">
            <FileAudio className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="text-foreground font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted/50">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium mb-1">
              Drop your MP3 file here
            </p>
            <p className="text-muted-foreground text-sm">
              or click to browse
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileAudio className="w-4 h-4" />
            <span>MP3 files only</span>
          </div>
        </div>
      )}
    </div>
  );
};
