'use client';

import { createContext, useContext, useState } from 'react';

type EditorContextType = {
  htmlContent: string;
  setHtmlContent: (content: string) => void;
  images: File[];
  setImages: (files: File[]) => void;
};

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [images, setImages] = useState<File[]>([]);

  return (
    <EditorContext.Provider
      value={{ htmlContent, setHtmlContent, images, setImages }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}
