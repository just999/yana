'use client';

import React, { forwardRef, RefObject, useRef } from 'react';

import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';

interface ImageData {
  src: string;
  id: string;
}

interface EditorContentProps {
  editorRef: RefObject<HTMLDivElement | null> | undefined;
  className?: string;
  placeholder?: string;
  error?: string;
  name?: string;
  onInput: (e: React.FormEvent) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onMouseDown: () => void;

  onRemoveImage?: (filename: File) => void;
  updateContent: () => void;
  removeImage?: (index: number) => void;
}

export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  (
    {
      className = '',
      error,
      name,
      onInput,
      onKeyUp,
      onKeyDown,
      onMouseUp,
      onFocus,
      onBlur,
      onMouseDown,

      onRemoveImage,
      updateContent,
      removeImage,
    },
    ref
  ) => {
    const [images, setImages] = useAtom(imageAtoms);
    const objectUrlsRef = useRef<Map<string, string>>(new Map());

    return (
      <div className='overflow-y-auto'>
        <div
          ref={ref}
          contentEditable
          className={cn(
            'min-h-32 rounded-b border border-t-0 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none',
            error ? 'border-red-500' : '',
            className
          )}
          onInput={onInput}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onMouseUp={onMouseUp}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseDown={onMouseDown}
          suppressContentEditableWarning={true}
          data-name={name}
          role='textbox'
          aria-label='Rich text editor'
          aria-describedby={error ? 'editor-error' : undefined}
        >
          {/* {removeImage &&
            images.map((imgFile, idx) => (
              <div
                key={typeof imgFile === 'string' ? idx : imgFile.id}
                className='group relative mt-4 mr-2 mb-2 inline-block'
                contentEditable={false}
              >
                <img
                  src={typeof imgFile === 'string' ? imgFile : imgFile.src}
                  alt={`uploaded-${idx}`}
                  className='max-h-32 rounded'
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                  }}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                
                    const url = objectUrlsRef.current.get(imgFile.src);
                    if (url) {
                      URL.revokeObjectURL(url);
                      objectUrlsRef.current.delete(imgFile.src);
                    }

                    removeImage(idx);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className='absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600'
                  title='Remove image'
                >
                  <X size={16} className='stroke-2 text-white' />
                </button>
              </div>
            ))} */}
        </div>
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';
