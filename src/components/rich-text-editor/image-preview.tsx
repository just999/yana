'use client';

import React, { useCallback, useEffect, useMemo } from 'react';

import { imageAtoms, ImageData } from '@/lib/jotai/blog-atoms';
import { extractImageUrls, sanitizeFileName } from '@/lib/utils';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';
import Image from 'next/image';

import AlertDialogButton from '../alert-dialog-button';

interface ImagePreviewProps {
  content: string;
  // onContentChange: (newContent: string) => void;
  slug: string;
  removeImageById: (imgFile: ImageData, slug: string, content: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  content,
  // onContentChange,
  slug,
  removeImageById,
}) => {
  const [images, setImages] = useAtom(imageAtoms);
  // Extract images from HTML content
  const extractedImages = useMemo(() => {
    if (!content) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgElements = doc.querySelectorAll('img');

    return Array.from(imgElements).map((img, index) => ({
      src: img.src,
      name: img.getAttribute('alt') ?? 'image.jpg',
      id: sanitizeFileName(img.getAttribute('alt') ?? 'image.jpg'),
      // name: img.getAttribute('alt') ?? 'image.jpg',
      // alt: img.alt || `Image ${index + 1}`,
      // index,
      // element: img.outerHTML,
    }));
  }, [content]);
  // const extractedImages = useMemo(() => {
  //   return extractImageUrls(content);
  // }, [content]);
  if (extractedImages.length === 0) {
    return null;
  }

  // useEffect(() => {
  //   if (extractedImages) setImages(extractedImages);
  // }, [extractedImages]);

  return (
    <div className='bg-accent/30 mt-4 rounded-lg border p-2 text-center backdrop-blur-lg'>
      <h4 className='mb-3 text-xs text-gray-700 dark:text-stone-400'>
        Images in Content ({extractedImages.length})
      </h4>

      <div className='flex flex-wrap justify-center gap-1'>
        {extractedImages.map((image, index) => (
          <div
            key={index}
            className='group relative group-hover:cursor-pointer'
          >
            <Image
              src={image.src}
              alt={image.id}
              width={0}
              height={0}
              className='group-hover:bg-red/70 h-20 w-20 rounded-sm object-cover object-center group-hover:box-border group-hover:border-2'
              style={{ width: 'auto', height: '100px' }}
              data-image-id={image.id}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEySDEwVjhIMTRWMTJIMTZMMTIgMTZaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
              }}
            />

            {/* Remove button */}
            {/* <button
              type='button'
              onClick={() => removeImageById(image, slug, content)}
              className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600'
              title='Remove image'
            >
              ×
            </button> */}
            <AlertDialogButton
              icon={X}
              action=''
              remove={() => removeImageById(image, slug, content)}
              className='absolute -top-2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600'
            />

            {/* Image info overlay */}
            {/* <div className='bg-opacity-60 absolute right-0 bottom-0 left-0 bg-black p-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:box-border group-hover:rounded-b-sm group-hover:border-red-200 group-hover:opacity-100'>
              <div className='truncate text-[8px]'>{image.id}</div>
            </div> */}
          </div>
        ))}
      </div>

      <p className='mt-2 text-xs text-gray-500'>
        Hover to remove , Max 5 images
      </p>
    </div>
  );
};
