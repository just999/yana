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
  elementId: string; // To track the img element in content
  uploadedUrl?: string; // After successful upload
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
  // const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());

  // const [typingStyles, setTypingStyles] = useState<Set<string>>(new Set());
  // const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  // const isTypingModeRef = useRef(false);
  // const savedSelectionRef = useRef<Range | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // const isUpdatingStyles = useRef<boolean>(false);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Count images
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
    setImageFiles([]); // Clear image files
    setImageCount(0); // Reset image count
    if (editorRef.current) {
      // Remove all <img> tags from the editor content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorRef.current.innerHTML;
      const images = tempDiv.querySelectorAll('img');
      images.forEach((img) => img.remove());
      editorRef.current.innerHTML =
        tempDiv.innerHTML || `<p>${placeholder || ''}</p>`;
      updateContent();
    }
  }, [updateContent, placeholder]);

  // const detectActiveStyles = useCallback(() => {
  //   const selection = window.getSelection();
  //   if (!selection || selection.rangeCount === 0) {
  //     setActiveStyles(new Set());
  //     return;
  //   }

  //   let node = selection.focusNode;
  //   if (!node) return;

  //   if (node.nodeType === Node.TEXT_NODE) {
  //     node = node.parentNode as Node | null;
  //   }

  //   const found = new Set<string>();
  //   let detectedColor = '#000000';

  //   while (node && node instanceof HTMLElement && node !== editorRef.current) {
  //     const tag = node.nodeName.toLowerCase();
  //     for (const [key, aliases] of Object.entries(tagAliases)) {
  //       if (aliases.includes(tag)) {
  //         found.add(key);
  //       }
  //     }

  //     if (['h1', 'h2', 'center', 'left', 'justify', 'right'].includes(tag)) {
  //       found.add(tag);
  //     }

  //     if (node.style && node.style.color) {
  //       detectedColor = node.style.color;
  //       if (detectedColor.startsWith('rgb')) {
  //         const rgbMatch = detectedColor.match(
  //           /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
  //         );
  //         if (rgbMatch) {
  //           const r = parseInt(rgbMatch[1]);
  //           const g = parseInt(rgbMatch[2]);
  //           const b = parseInt(rgbMatch[3]);
  //           detectedColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  //         }
  //       }
  //     }

  //     node = node.parentNode as Node | null;
  //   }

  //   if (isTypingModeRef.current) {
  //     typingStyles.forEach((style) => found.add(style));
  //   }

  //   setActiveStyles(found);
  //   setCurrentTextColor(detectedColor);
  // }, [typingStyles]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const initialContent = value || `<p>${placeholder || ''}</p>`;
      editorRef.current.innerHTML = initialContent;
      setIsInitialized(true);
    }
  }, [value, placeholder, isInitialized]);

  // Update editor when value prop changes
  useEffect(() => {
    if (
      editorRef.current &&
      isInitialized &&
      value !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML = value || `<p>${placeholder || ''}</p>`;
    }
  }, [value, placeholder, isInitialized]);

  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;
  //   const handler = () => {
  //     clearTimeout(timeoutId);
  //     timeoutId = setTimeout(detectActiveStyles, 100);
  //   };

  //   document.addEventListener('selectionchange', handler);
  //   return () => {
  //     clearTimeout(timeoutId);
  //     document.removeEventListener('selectionchange', handler);
  //   };
  // }, [detectActiveStyles]);

  // ... (rest of the hook methods would be here - expandSelectionToWord, toggleInlineStyle, etc.)
  // For brevity, I'm showing the structure. The full implementation would include all methods.

  return {
    editorRef,
    fileInputRef,
    imageCount,
    setImageCount,
    imageFiles,
    setImageFiles,
    resetImages,
    // currentTextColor,
    // setCurrentTextColor,
    showColorPicker,
    setShowColorPicker,
    updateContent,
    // detectActiveStyles,
    // isTypingModeRef,
    // savedSelectionRef,
    // isUpdatingStyles,
    // ... other methods
  };
};
