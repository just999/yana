'use client';

import { createContext, useContext, useState } from 'react';

import type { UploadedImage } from '@/lib/types';

type UploadContextType = {
  pendingFiles: File[];
  uploadedImages: UploadedImage[];
  setPendingFiles: (files: File[]) => void;
  clearFiles: () => void;
};

const UploadContext = createContext<UploadContextType | null>(null);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const clearFiles = () => {
    setPendingFiles([]);
    setUploadedImages([]);
  };

  return (
    <UploadContext.Provider
      value={{ pendingFiles, uploadedImages, setPendingFiles, clearFiles }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUploadContext = () => {
  const ctx = useContext(UploadContext);
  if (!ctx)
    throw new Error('useUploadContext must be used within UploadProvider');
  return ctx;
};
