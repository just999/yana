// 'use client';

// import React, { forwardRef, useCallback } from 'react';

// import { cn } from '@/lib/utils';
// import { X } from 'lucide-react';

// import { Button } from '../ui';

// interface EditorContentProps {
//   className?: string;
//   error?: string;
//   name?: string;
//   onInput: (e: React.FormEvent) => void;
//   onKeyUp: () => void;
//   onKeyDown: (e: React.KeyboardEvent) => void;
//   onMouseUp: () => void;
//   onFocus: () => void;
//   onBlur: () => void;
//   onMouseDown: () => void;
//   images: File[];
// }

// export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
//   (
//     {
//       className = '',
//       error,
//       name,
//       onInput,
//       onKeyUp,
//       onKeyDown,
//       onMouseUp,
//       onFocus,
//       onBlur,
//       onMouseDown,
//       images,
//     },

//     ref
//   ) => {
//     const removeImage = useCallback((imageName: string) => {
//       // Implement image removal logic here, e.g., update parent state to remove the image from the images array
//     }, []);

//     return (
//       <div className='overflow-y-auto'>
//         <div
//           ref={ref}
//           contentEditable
//           className={cn(
//             'min-h-32 rounded-b border border-t-0 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none',
//             error ? 'border-red-500' : '',
//             className
//           )}
//           onInput={onInput}
//           onKeyUp={onKeyUp}
//           onKeyDown={onKeyDown}
//           onMouseUp={onMouseUp}
//           onFocus={onFocus}
//           onBlur={onBlur}
//           onMouseDown={onMouseDown}
//           suppressContentEditableWarning={true}
//           data-name={name}
//           role='textbox'
//           aria-label='Rich text editor'
//           aria-describedby={error ? 'editor-error' : undefined}
//         >
//           {images.map((imgFile, idx) => (
//             <div key={idx} className='relative mt-4 mr-2 mb-2 inline-block'>
//               <img
//                 src={URL.createObjectURL(imgFile)}
//                 alt={`uploaded-${idx}`}
//                 className='max-h-32 rounded'
//               />
//               <Button
//                 type='button'
//                 onClick={() => removeImage(imgFile.name)}
//                 className='absolute top-0 z-10 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-red-500 text-2xl font-extrabold opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600 dark:text-white'
//                 // title='Remove image'
//               >
//                 <X size={32} className='z-20 stroke-3 text-white' />
//               </Button>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
// );

// EditorContent.displayName = 'EditorContent';

'use client';

import React, {
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';

import { Button } from '../ui';

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
  // images: ImageData[];
  // setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
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
      // images,
      // setImages,
      onRemoveImage,
      updateContent,
      removeImage,
    },
    ref
  ) => {
    const [images, setImages] = useAtom(imageAtoms);
    const objectUrlsRef = useRef<Map<string, string>>(new Map());
    // const [images, setImages] = useAtom(imageAtoms);

    // Clean up object URLs when component unmounts or images change
    // useEffect(() => {
    //   // Only proceed if ref is a RefObject (has 'current')
    //   let currentUrls: any = undefined;
    //   if (ref && typeof ref === 'object' && 'current' in ref) {
    //     currentUrls = ref.current;
    //   }
    //   if (!currentUrls) return;

    //   // Clean up URLs for images that are no longer in the array
    //   const currentImageNames = new Set(images.map((img: any) => img.name));
    //   Array.from<string>(currentUrls.keys()).forEach((imageName: string) => {
    //     if (!currentImageNames.has(imageName)) {
    //       const url = currentUrls.get(imageName);
    //       if (url) {
    //         URL.revokeObjectURL(url);
    //         currentUrls.delete(imageName);
    //       }
    //     }
    //   });

    //   // Create URLs for new images
    //   images.forEach((img: any) => {
    //     if (!currentUrls.has(img.name)) {
    //       currentUrls.set(img.name, URL.createObjectURL(img));
    //     }
    //   });

    //   return () => {
    //     // Cleanup all URLs on unmount
    //     (Array.from(currentUrls.values()) as string[]).forEach(
    //       (url: string) => {
    //         URL.revokeObjectURL(url);
    //       }
    //     );
    //     currentUrls.clear();
    //   };
    // }, [images]);

    // const getImageUrl = useCallback((file: File) => {
    //   const existingUrl = objectUrlsRef.current.get(file.name);
    //   if (existingUrl) {
    //     return existingUrl;
    //   }
    //   const newUrl = URL.createObjectURL(file);
    //   objectUrlsRef.current.set(file.name, newUrl);
    //   return newUrl;
    // }, []);

    // const removeImage = (idx: number) => {
    //   let editor: HTMLDivElement | null = null;
    //   if (ref && typeof ref === 'object' && 'current' in ref) {
    //     editor = ref.current;
    //   }
    //   if (!editor) return;

    //   const imageToRemove = images[idx];

    //   const imgElement = editor.querySelector(
    //     `img[data-image-id="${imageToRemove.id}"]`
    //   );

    //   if (imgElement) {
    //     const nextElement = imgElement.nextElementSibling;
    //     if (nextElement && nextElement.tagName === 'BR') {
    //       nextElement.remove();

    //       updateContent();
    //     }
    //   }

    //   // if (onRemoveImage) {
    //   //   onRemoveImage(file);
    //   // }
    //   setImages((prev: ImageData[]) =>
    //     prev.filter((_, i: number) => i !== idx)
    //   );
    // };

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
