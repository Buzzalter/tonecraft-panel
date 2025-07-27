import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AudioUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  disabled?: boolean;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({ onFileSelect, selectedFile, disabled = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('audio/')) {
        onFileSelect(file);
      }
    }
    setIsDragActive(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled
  });

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  if (selectedFile) {
    return (
      <Card className="p-6 border-2 border-dashed border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveFile}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={cn(
        "p-8 border-2 border-dashed transition-all duration-300",
        disabled 
          ? "border-muted bg-muted/50 cursor-not-allowed opacity-60" 
          : isDragActive 
            ? "border-primary bg-primary/10 shadow-lg cursor-pointer" 
            : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/8 cursor-pointer"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">
          Upload Reference Audio
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag & drop your audio file here, or click to browse
        </p>
        <p className="text-sm text-muted-foreground">
          Supports MP3, WAV, FLAC, M4A, OGG
        </p>
      </div>
    </Card>
  );
};