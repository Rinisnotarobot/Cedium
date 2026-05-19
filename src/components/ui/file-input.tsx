"use client";

import { useRef } from "react";
import { cn } from "#/lib/utils";

export interface FileInputProps {
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FileInput({
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 10 * 1024 * 1024,
  onFileSelect,
  onError,
  disabled = false,
  className,
  children,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        onError?.(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      onFileSelect(file);
    }
    e.target.value = "";
  };

  return (
    <div className={cn("relative", className)} onClick={handleClick}>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}