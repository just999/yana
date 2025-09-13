// 'use client';

// import React, { useCallback, useMemo, useState } from 'react';

// import {
//   fileAtoms,
//   imageAtoms,
//   ImageData,
//   pendingImgAtoms,
// } from '@/lib/jotai/blog-atoms';
// import { extractUploadedImages, sanitizeFileName } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { X } from 'lucide-react';
// import Image from 'next/image';

// import AlertDialogButton from '../alert-dialog-button';

// interface ImagePreviewProps {
//   content: string;
//   slug: string;
//   removeImageById: (imgFile: ImageData, slug: string, content: string) => void;
// }

// export const ImagePreview: React.FC<ImagePreviewProps> = ({
//   content,
//   slug,
//   removeImageById,
// }) => {
//   const [images, setImages] = useAtom(imageAtoms);
//   const [imageFiles, setImageFiles] = useAtom(fileAtoms);

//   const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());
//   const [isOptimized, setIsOptimized] = useState<boolean>(true);
//   const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   console.log({ content, slug, images });
//   const dataImage = extractUploadedImages(content);

//   const extractedImages = useMemo(() => {
//     if (!content) return [];

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(content, 'text/html');
//     const imgElements = doc.querySelectorAll('img');

//     return Array.from(imgElements)
//       .map((img, index) => ({
//         src: img.src,
//         name: img.getAttribute('alt') ?? 'image.jpg',
//         id: sanitizeFileName(img.getAttribute('alt') ?? 'image.jpg'),
//       }))
//       .filter((img) => !removingImages.has(img.id));
//   }, [content, removingImages]);

//   // Enhanced remove function with loading state
//   const handleRemoveImage = useCallback(
//     async (image: ImageData) => {
//       try {
//         // Mark image as being removed
//         setRemovingImages((prev) => new Set([...prev, image.src]));

//         // Call the actual remove function
//         await removeImageById(image, slug, content);

//         // Remove from removing set after successful deletion
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(image.id);
//           return newSet;
//         });

//         const elementToRemove = document.querySelector(
//           `img[data-image-id="${image.id}"]`
//         );
//         if (elementToRemove) {
//           elementToRemove.remove();
//         }
//       } catch (error) {
//         console.error('Failed to remove image:', error);
//         // Remove from removing set on error
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(image.src);
//           return newSet;
//         });
//       }
//     },
//     [removeImageById, slug, content]
//   );

//   if (extractedImages.length === 0) {
//     return null;
//   }

//   return (
//     <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
//       <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
//         Images in Content ({pendingImages.length})
//       </h4>

//       <div className='flex flex-wrap justify-center gap-1'>
//         {pendingImages.map((file, index) => {
//           const isRemoving = removingImages.has(file.localUrl);

//           return (
//             <div
//               key={`${file}-${index}`}
//               className={`group relative ${isRemoving ? 'pointer-events-none opacity-50' : 'group-hover:cursor-pointer'}`}
//             >
//               <Image
//                 src={file.localUrl || '/img/noimg.svg'}
//                 alt={file.id || 'image'}
//                 width={100}
//                 height={100}
//                 className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
//                 style={{ width: 'auto', height: '100px' }}
//                 data-image-id={file.id}
//                 // unoptimized={file.imageUrl.startsWith('blob:')}
//                 unoptimized={!isOptimized}
//                 onError={(e) => {
//                   e.currentTarget.src = '/img/noimg.svg';
//                   setIsOptimized(false);
//                   e.currentTarget.onerror = null;
//                 }}
//                 onLoad={() => {
//                   // Image loaded successfully, remove any error state
//                   setIsLoading(false);
//                 }}
//               />

//               {/* Loading overlay when removing */}
//               {isRemoving && (
//                 <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-sm bg-black'>
//                   <div className='text-xs text-white'>Removing...</div>
//                 </div>
//               )}

//               <AlertDialogButton
//                 icon={X}
//                 action='remove'
//                 remove={() => images.length > 0 && handleRemoveImage(images[0])}
//                 disabled={isLoading}
//                 className={`absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 shadow-lg transition-opacity duration-200 hover:bg-red-600 ${
//                   !isOptimized
//                     ? 'cursor-not-allowed opacity-50'
//                     : 'opacity-0 group-hover:opacity-100'
//                 }`}
//               />

//               {/* Image info overlay */}
//               {/* <div className='bg-opacity-60 absolute right-0 bottom-0 left-0 bg-black p-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:box-border group-hover:rounded-b-sm group-hover:border-red-200 group-hover:opacity-100'>
//               <div className='truncate text-[8px]'>{image.id}</div>
//             </div> */}
//             </div>
//           );
//         })}
//       </div>

//       <p className='mt-2 text-xs text-gray-500'>
//         Hover to remove , Max 5 images
//       </p>
//     </div>
//   );
// };

// 'use client';

// import React, { useCallback, useEffect, useMemo, useState } from 'react';

// import { imageAtoms, ImageData } from '@/lib/jotai/blog-atoms';
// import { extractImageUrls, sanitizeFileName } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { Trash2Icon, X } from 'lucide-react';
// import Image from 'next/image';

// import AlertDialogButton from '../alert-dialog-button';

// interface ImagePreviewProps {
//   content: string;
//   slug: string;
//   removeImageById: (imgFile: ImageData, slug: string, content: string) => void;
// }

// export const ImagePreview: React.FC<ImagePreviewProps> = ({
//   content,
//   slug,
//   removeImageById,
// }) => {
//   const [images, setImages] = useAtom(imageAtoms);
//   const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());

//   const extractedImages = useMemo(() => {
//     if (!content) return [];

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(content, 'text/html');
//     const imgElements = doc.querySelectorAll('img');

//     return Array.from(imgElements)
//       .map((img, index) => {
//         const src = img.src || img.getAttribute('src') || '';
//         const alt = img.getAttribute('alt') || '';

//         // Skip images with empty or invalid src
//         if (!src || src.trim() === '') {
//           console.warn('Skipping image with empty src:', { alt, index });
//           return null;
//         }

//         return {
//           src: src.trim(),
//           name: alt || `image-${index}.jpg`,
//           id: sanitizeFileName(alt || `image-${index}`),
//         };
//       })
//       .filter((image): image is NonNullable<typeof image> => image !== null) // Remove null entries
//       .filter((image) => !removingImages.has(image.id)); // Filter out images being removed
//   }, [content, removingImages]);

//   // Enhanced remove function with better error handling
//   const handleRemoveImage = useCallback(
//     async (image: ImageData) => {
//       try {
//         console.log('Removing image:', image);

//         // Validate image data before removal
//         if (!image.src || image.src.trim() === '') {
//           console.error('Cannot remove image: invalid src');
//           return;
//         }

//         // Mark image as being removed
//         setRemovingImages((prev) => new Set([...prev, image.id]));

//         // Call the actual remove function
//         await removeImageById(image, slug, content);
//       } catch (error) {
//         console.error('Failed to remove image:', error);
//       } finally {
//         // Always remove from removing set
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(image.id);
//           return newSet;
//         });
//       }
//     },
//     [removeImageById, slug, content]
//   );

//   // Debug logging
//   useEffect(() => {
//     console.log('ImagePreview - Extracted images:', extractedImages);
//     console.log('ImagePreview - Content length:', content?.length || 0);
//   }, [extractedImages, content]);

//   if (extractedImages.length === 0) {
//     return null;
//   }

//   return (
//     <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
//       <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
//         Images in Content ({extractedImages.length})
//       </h4>

//       <div className='flex flex-wrap justify-center gap-1'>
//         {extractedImages.map((image, index) => {
//           const isRemoving = removingImages.has(image.id);

//           // Additional validation before rendering
//           if (!image.src || image.src.trim() === '') {
//             console.warn('Skipping render for image with empty src:', image);
//             return null;
//           }

//           return (
//             <div
//               key={`${image.id}-${index}-${image.src.substring(0, 10)}`} // More unique key
//               className={`group relative ${
//                 isRemoving
//                   ? 'pointer-events-none opacity-50'
//                   : 'group-hover:cursor-pointer'
//               }`}
//             >
//               <Image
//                 src={image.src}
//                 alt={image.id || `image-${index}`}
//                 width={100}
//                 height={100}
//                 className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
//                 style={{ width: 'auto', height: '100px' }}
//                 data-image-id={image.id}
//                 unoptimized={
//                   image.src.startsWith('blob:') || image.src.startsWith('data:')
//                 }
//                 priority={false} // Prevent eager loading
//                 onError={(e) => {
//                   const target = e.target as HTMLImageElement;
//                   console.error('Image load error for:', image.src);

//                   // Only set fallback if image is not being removed
//                   if (!isRemoving && target.src !== '') {
//                     target.src =
//                       'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEySDEwVjhIMTRWMTJIMTZMMTIgMTZaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
//                   }
//                 }}
//                 onLoad={() => {
//                   console.log(
//                     'Image loaded successfully:',
//                     image.src.substring(0, 50)
//                   );
//                 }}
//               />

//               {/* Loading overlay when removing */}
//               {isRemoving && (
//                 <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-sm bg-black'>
//                   <div className='text-xs text-white'>Removing...</div>
//                 </div>
//               )}

//               {/* Remove button */}
//               <AlertDialogButton
//                 icon={X}
//                 action='remove'
//                 remove={() => !isRemoving && handleRemoveImage(image)}
//                 disabled={isRemoving}
//                 className={`absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 shadow-lg transition-opacity duration-200 hover:bg-red-600 ${
//                   isRemoving
//                     ? 'cursor-not-allowed opacity-50'
//                     : 'opacity-0 group-hover:opacity-100'
//                 }`}
//               />
//             </div>
//           );
//         })}
//       </div>

//       <p className='mt-2 text-xs text-gray-500'>
//         Hover to remove, Max 5 images
//       </p>
//     </div>
//   );
// };

// // Alternative: If you want to use regular img tags instead of Next.js Image
// export const ImagePreviewWithRegularImg: React.FC<ImagePreviewProps> = ({
//   content,
//   slug,
//   removeImageById,
// }) => {
//   const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());

//   const extractedImages = useMemo(() => {
//     if (!content) return [];

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(content, 'text/html');
//     const imgElements = doc.querySelectorAll('img'); // Only select imgs with src

//     return Array.from(imgElements)
//       .map((img, index) => {
//         const src = img.src || img.getAttribute('src') || '';
//         const alt = img.getAttribute('alt') || '';

//         // Skip invalid images
//         if (
//           !src ||
//           src.trim() === '' ||
//           src === 'data:,' ||
//           src === 'about:blank'
//         ) {
//           return null;
//         }

//         return {
//           src: src.trim(),
//           name: alt || `image-${index}.jpg`,
//           id: sanitizeFileName(alt || `image-${index}`),
//         };
//       })
//       .filter((image): image is NonNullable<typeof image> => image !== null)
//       .filter((image) => !removingImages.has(image.id));
//   }, [content, removingImages]);

//   const handleRemoveImage = useCallback(
//     async (image: ImageData) => {
//       try {
//         setRemovingImages((prev) => new Set([...prev, image.id]));
//         await removeImageById(image, slug, content);
//       } catch (error) {
//         console.error('Failed to remove image:', error);
//       } finally {
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(image.id);
//           return newSet;
//         });
//       }
//     },
//     [removeImageById, slug, content]
//   );

//   if (extractedImages.length === 0) {
//     return null;
//   }

//   return (
//     <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
//       <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
//         Images in Content ({extractedImages.length})
//       </h4>

//       <div className='flex flex-wrap justify-center gap-1'>
//         {extractedImages.map((image, index) => {
//           const isRemoving = removingImages.has(image.id);

//           return (
//             <div
//               key={`${image.id}-${index}`}
//               className={`group relative ${
//                 isRemoving
//                   ? 'pointer-events-none opacity-50'
//                   : 'group-hover:cursor-pointer'
//               }`}
//             >
//               {/* Use regular img tag instead of Next.js Image */}
//               <img
//                 src={image.src}
//                 alt={image.id}
//                 className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
//                 style={{ width: 'auto', height: '100px' }}
//                 data-image-id={image.id}
//                 onError={(e) => {
//                   const target = e.target as HTMLImageElement;
//                   console.error('Image load error for:', image.src);

//                   if (!isRemoving) {
//                     target.src =
//                       'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEySDEwVjhIMTRWMTJIMTZMMTIgMTZaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
//                   }
//                 }}
//                 onLoad={() => {
//                   console.log('Image loaded:', image.src.substring(0, 50));
//                 }}
//               />

//               {isRemoving && (
//                 <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-sm bg-black'>
//                   <div className='text-xs text-white'>Removing...</div>
//                 </div>
//               )}

//               <AlertDialogButton
//                 icon={X}
//                 action='remove'
//                 remove={() => !isRemoving && handleRemoveImage(image)}
//                 disabled={isRemoving}
//                 className={`absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 shadow-lg transition-opacity duration-200 hover:bg-red-600 ${
//                   isRemoving
//                     ? 'cursor-not-allowed opacity-50'
//                     : 'opacity-0 group-hover:opacity-100'
//                 }`}
//               />
//             </div>
//           );
//         })}
//       </div>

//       <p className='mt-2 text-xs text-gray-500'>
//         Hover to remove, Max 5 images
//       </p>
//     </div>
//   );
// };

'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  fileAtoms,
  imageAtoms,
  ImageData,
  pendingImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { extractImageUrls } from '@/lib/utils';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';

import AlertDialogButton from '../alert-dialog-button';

interface ImagePreviewProps {
  content: string;
  slug: string;
  removeImageById: (imgFile: ImageData, slug: string, content: string) => void;
}
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  content,
  slug,
  removeImageById,
}) => {
  const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());
  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const [images, setImages] = useAtom(imageAtoms);

  useEffect(() => {
    if (!content) {
      setImages([]);
      return;
    }

    const imgData = extractImageUrls(content);
    const httpsImages = imgData.reduce((acc, img) => {
      if (img.src.startsWith('https')) {
        acc.push({
          src: img.src,
          id: img.id,
          alt: img.alt,
        });
      }
      return acc;
    }, [] as ImageData[]);

    if (httpsImages) {
      setImages(httpsImages);
    } else if (Array.from(httpsImages).length === 0) {
      setImages([]);
    }
  }, [content]);
  // const extractedImages = useMemo(() => {
  //   if (!content) return [];

  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(content, 'text/html');
  //   const imgElements = doc.querySelectorAll('img'); // Only select imgs with src

  //   return Array.from(imgElements)
  //     .map((img, index) => {
  //       const src = img.src || img.getAttribute('src') || '';
  //       const alt = img.getAttribute('alt') || '';

  //       // Skip invalid images
  //       if (
  //         !src ||
  //         src.trim() === '' ||
  //         src === 'data:,' ||
  //         src === 'about:blank'
  //       ) {
  //         return null;
  //       }

  //       return {
  //         src: src.trim(),
  //         name: alt || `image-${index}.jpg`,
  //         id: sanitizeFileName(alt || `image-${index}`),
  //       };
  //     })
  //     .filter((image): image is NonNullable<typeof image> => image !== null)
  //     .filter((image) => !removingImages.has(image.id));
  // }, [content, removingImages]);

  const handleRemoveImage = useCallback(
    async (image: ImageData) => {
      const filename = pendingImages[0].file.name;

      if (image.alt === filename) {
        setPendingImages((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.filter((img) => img.file.name !== filename);
        });
      }

      try {
        setRemovingImages((prev) => new Set([...prev, image.id]));

        await removeImageById(image, slug, content);
      } catch (error) {
        console.error('Failed to remove image:', error);
      } finally {
        setRemovingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(image.id);
          return newSet;
        });
      }
    },
    [removeImageById, slug, content]
  );

  // if (extractedImages.length === 0) {
  //   return null;
  // }

  return (
    <>
      {images.length > 0 && (
        <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
          <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
            Images in Content ({images.length})
          </h4>
          <div className='flex flex-wrap justify-center gap-1'>
            {images.some((img) => img.src.startsWith('https')) &&
              images.map((image, index) => {
                const isRemoving = removingImages.has(image.id);

                return (
                  <div
                    key={`${image.id}-${index}`}
                    className={`group relative ${
                      isRemoving
                        ? 'pointer-events-none opacity-50'
                        : 'group-hover:cursor-pointer'
                    }`}
                  >
                    {/* Use regular img tag instead of Next.js Image */}
                    <img
                      src={image.src}
                      alt={image.alt}
                      className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
                      style={{ width: 'auto', height: '100px' }}
                      data-image-id={image.alt}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Image load error for:', image.src);

                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEySDEwVjhIMTRWMTJIMTZMMTIgMTZaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
                      }}
                      onLoad={() => {
                        console.log(
                          'Image loaded:',
                          image.src.substring(0, 50)
                        );
                      }}
                    />

                    {isRemoving && (
                      <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-sm bg-black'>
                        <div className='text-xs text-white'>Removing...</div>
                      </div>
                    )}
                    {isRemoving ? 'true' : 'false'}
                    <AlertDialogButton
                      icon={X}
                      action='remove'
                      remove={() => !isRemoving && handleRemoveImage(image)}
                      disabled={isRemoving}
                      className={`absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 shadow-lg transition-opacity duration-200 hover:bg-red-600 ${
                        isRemoving
                          ? 'cursor-not-allowed opacity-50'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
          </div>

          <p className='mt-2 text-xs text-gray-500'>
            Hover to remove, Max 5 images
          </p>
        </div>
      )}
    </>
  );
};

// 'use client';

// import React, { useCallback, useMemo, useState } from 'react';

// import {
//   fileAtoms,
//   imageAtoms,
//   ImageData,
//   pendingImgAtoms,
// } from '@/lib/jotai/blog-atoms';
// import { extractUploadedImages, sanitizeFileName } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { X } from 'lucide-react';
// import Image from 'next/image';

// import AlertDialogButton from '../alert-dialog-button';

// interface ImagePreviewProps {
//   content: string;
//   slug: string;
//   removeImageById: (imgFile: ImageData, slug: string, content: string) => void;
// }

// export const ImagePreview: React.FC<ImagePreviewProps> = ({
//   content,
//   slug,
//   removeImageById,
// }) => {
//   const [images, setImages] = useAtom(imageAtoms);
//   const [imageFiles, setImageFiles] = useAtom(fileAtoms);
//   const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
//   const [removingImages, setRemovingImages] = useState<Set<string>>(new Set());
//   const [isOptimized, setIsOptimized] = useState<boolean>(true);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const dataImage = extractUploadedImages(content);

//   // Enhanced remove function with proper image matching
//   const handleRemoveImage = useCallback(
//     async (imageToRemove: any, imageId: string) => {
//       try {
//         console.log(
//           'Attempting to remove image:',
//           imageToRemove,
//           'with ID:',
//           imageId
//         );

//         // Mark image as being removed using the correct ID
//         setRemovingImages((prev) => new Set([...prev, imageId]));

//         // Create ImageData object that matches your removeImageById function
//         const imageData: ImageData = {
//           src:
//             imageToRemove.localUrl ||
//             imageToRemove.imageUrl ||
//             imageToRemove.src,
//           id: imageId,
//         };

//         // Call the actual remove function
//         await removeImageById(imageData, slug, content);

//         // Remove from all relevant state arrays
//         setPendingImages((prev) => prev.filter((img) => img.id !== imageId));
//         setImages((prev) => prev.filter((img) => img.id !== imageId));
//         setImageFiles((prev) =>
//           prev.filter((file) => {
//             // Match by file name or other identifier if available
//             const fileName = sanitizeFileName(file.name);
//             return fileName !== imageId;
//           })
//         );

//         // Remove from DOM using multiple selectors
//         const selectors = [
//           `img[data-image-id="${imageId}"]`,
//           `img[alt="${imageId}"]`,
//           `img[src="${imageData.src}"]`,
//         ];

//         selectors.forEach((selector) => {
//           const elements = document.querySelectorAll(selector);
//           elements.forEach((el) => {
//             console.log('Removing DOM element:', el);
//             el.remove();
//           });
//         });

//         // Remove from removing set after successful deletion
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(imageId);
//           return newSet;
//         });

//         console.log('Successfully removed image:', imageId);
//       } catch (error) {
//         console.error('Failed to remove image:', error);
//         // Remove from removing set on error
//         setRemovingImages((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(imageId);
//           return newSet;
//         });
//       }
//     },
//     [removeImageById, slug, content, setPendingImages, setImages, setImageFiles]
//   );

//   // Helper function to normalize image data
//   const normalizeImageData = (img: any, index: number) => {
//     // Handle PendingImgProps structure
//     if ('localUrl' in img && 'file' in img) {
//       return {
//         id: img.id,
//         src: img.localUrl,
//         alt: img.id || `image-${index}`,
//         originalData: img,
//       };
//     }

//     // Handle extracted image structure
//     if ('imageUrl' in img) {
//       return {
//         id: img.imageId || sanitizeFileName(img.fileName || `image-${index}`),
//         src: img.imageUrl,
//         alt: img.fileName || `image-${index}`,
//         originalData: img,
//       };
//     }

//     // Fallback for other structures
//     return {
//       id:
//         img.id ||
//         img.imageId ||
//         sanitizeFileName(img.fileName || img.alt || `image-${index}`),
//       src: img.src || img.localUrl || img.imageUrl,
//       alt: img.alt || img.fileName || img.id || `image-${index}`,
//       originalData: img,
//     };
//   };

//   // Use pendingImages if available, otherwise fall back to dataImage
//   const displayImages = pendingImages.length > 0 ? pendingImages : dataImage;

//   if (displayImages.length === 0) {
//     return null;
//   }

//   return (
//     <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
//       <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
//         Images in Content ({displayImages.length})
//       </h4>

//       <div className='flex flex-wrap justify-center gap-1'>
//         {displayImages.map((file, index) => {
//           // Normalize the image data to handle different structures
//           const normalizedImage = normalizeImageData(file, index);
//           const {
//             id: imageId,
//             src: imageSrc,
//             alt: imageAlt,
//             originalData,
//           } = normalizedImage;

//           const isRemoving = removingImages.has(imageId);

//           console.log('Rendering image:', {
//             imageId,
//             imageSrc,
//             imageAlt,
//             isRemoving,
//           });

//           return (
//             <div
//               key={`${imageId}-${index}`}
//               className={`group relative ${isRemoving ? 'pointer-events-none opacity-50' : 'group-hover:cursor-pointer'}`}
//             >
//               <Image
//                 src={imageSrc || '/img/noimg.svg'}
//                 alt={imageAlt || 'image'}
//                 width={100}
//                 height={100}
//                 className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
//                 style={{ width: 'auto', height: '100px' }}
//                 data-image-id={imageId}
//                 unoptimized={!isOptimized}
//                 onError={(e) => {
//                   e.currentTarget.src = '/img/noimg.svg';
//                   setIsOptimized(false);
//                   e.currentTarget.onerror = null;
//                 }}
//                 onLoad={() => {
//                   setIsLoading(false);
//                 }}
//               />

//               {/* Loading overlay when removing */}
//               {isRemoving && (
//                 <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-sm bg-black'>
//                   <div className='text-xs text-white'>Removing...</div>
//                 </div>
//               )}

//               <AlertDialogButton
//                 icon={X}
//                 action='remove'
//                 remove={() => {
//                   if (!isRemoving && originalData && imageId) {
//                     console.log('Remove button clicked for:', imageId);
//                     handleRemoveImage(originalData, imageId);
//                   }
//                 }}
//                 disabled={isLoading || isRemoving}
//                 className={`absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 shadow-lg transition-opacity duration-200 hover:bg-red-600 ${
//                   !isOptimized || isRemoving
//                     ? 'cursor-not-allowed opacity-50'
//                     : 'opacity-0 group-hover:opacity-100'
//                 }`}
//               />
//             </div>
//           );
//         })}
//       </div>

//       <p className='mt-2 text-xs text-gray-500'>
//         Hover to remove, Max 5 images
//       </p>
//     </div>
//   );
// };
