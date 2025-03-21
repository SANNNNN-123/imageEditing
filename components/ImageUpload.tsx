"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Upload as UploadIcon, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update the selected file when the current image changes
  useEffect(() => {
    if (!currentImage) {
      setSelectedFile(null);
    }
  }, [currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);

      // Convert the file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const result = event.target.result as string;
          console.log("Image loaded, length:", result.length);
          onImageSelect(result);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"]
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleRemove = () => {
    setSelectedFile(null);
    onImageSelect("");
  };

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          {...getRootProps()}
          className={`min-h-[150px] p-4 rounded-lg
          ${isDragActive ? "bg-secondary/50" : "bg-secondary"}
          transition-colors duration-200 ease-in-out hover:bg-secondary/50
          border-2 border-dashed border-secondary
          cursor-pointer flex items-center justify-center gap-4
          dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/70
        `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-row items-center">
            <UploadIcon className="w-8 h-8 text-primary mr-3 flex-shrink-0 dark:text-blue-400" />
            <div className="">
              <p className="text-sm font-medium text-foreground dark:text-white">
                Drop your image here or click to browse
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-300">
                Maximum file size: 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-4 rounded-lg bg-secondary dark:bg-slate-800 dark:border dark:border-slate-700">
          <div className="flex w-full items-center mb-4">
            <ImageIcon className="w-8 h-8 text-primary mr-3 flex-shrink-0 dark:text-blue-400" />
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium truncate text-foreground dark:text-white">
                {selectedFile?.name || "Current Image"}
              </p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground dark:text-slate-300">
                  {formatFileSize(selectedFile?.size ?? 0)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="flex-shrink-0 ml-2 dark:hover:bg-slate-700 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
          <div className="w-full overflow-hidden rounded-md dark:bg-slate-900 dark:p-2 flex justify-center">
            <img
              src={currentImage}
              alt="Selected"
              className="max-w-full h-auto object-contain"
              style={{ maxHeight: '400px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
