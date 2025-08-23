'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { useAtom } from 'jotai';

export const tagAliases: Record<string, string[]> = {
  strong: ['strong', 'b'],
  em: ['em', 'i'],
  u: ['u'],
  h1: ['h1'],
  h2: ['h2'],
  ol: ['ol'],
  li: ['li'],
  ul: ['ul'],
  p: ['p'],
  span: ['span'],
};

type ImageState = {
  file: File;
  previewUrl: string;
  elementId: string;
  uploadedUrl?: string;
};

export const useRichTextEditor = (
  value: string,
  onChange?: (value: string) => void,
  placeholder?: string
) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageCount, setImageCount] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [showColorPicker, setShowColorPicker] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;

      const tempDiv = document.createElement('div');
      tempDiv.className = 'editor-paragraph';
      tempDiv.classList.add('editor-paragraph');
      tempDiv.innerHTML = newContent;
      const images = tempDiv.querySelectorAll('img');
      setImageCount(images.length);

      if (onChange) {
        onChange(
          newContent === `<p>${placeholder}</p>` || newContent === ''
            ? ''
            : newContent
        );
      }

      if (onChange) {
        onChange(newContent);
      }
    }
  }, [onChange]);

  const resetImages = useCallback(() => {
    setImageFiles([]);
    setImageCount(0);
    if (editorRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorRef.current.innerHTML;
      const images = tempDiv.querySelectorAll('img');
      images.forEach((img) => img.remove());
      editorRef.current.innerHTML =
        tempDiv.innerHTML || `<p>${placeholder || ''}</p>`;
      updateContent();
    }
  }, [updateContent, placeholder]);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const initialContent = value || `<p>${placeholder || ''}</p>`;
      editorRef.current.innerHTML = initialContent;
      setIsInitialized(true);
    }
  }, [value, placeholder, isInitialized]);

  useEffect(() => {
    if (
      editorRef.current &&
      isInitialized &&
      value !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML = value || `<p>${placeholder || ''}</p>`;
    }
  }, [value, placeholder, isInitialized]);

  return {
    editorRef,
    fileInputRef,
    imageCount,
    setImageCount,
    imageFiles,
    setImageFiles,
    resetImages,

    showColorPicker,
    setShowColorPicker,
    updateContent,
  };
};
