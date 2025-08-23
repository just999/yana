import { useCallback, useEffect } from 'react';

import { deleteImageServerAction } from '@/actions/blog-actions';
import {
  blogAtom,
  fileAtoms,
  imageAtoms,
  ImageData,
  imageUrlAtoms,
  pendingImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { useAtom } from 'jotai';

type ImageMeta = {
  id: string;
  file: File;
  localUrl: string;
};

export const useImageInsertion = <T extends HTMLElement>(
  editorRef: React.RefObject<T | null>,
  updateContent: (value?: string) => void
) => {
  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const [images, setImages] = useAtom(imageAtoms);
  const [imgUrl, setImgUrl] = useAtom(imageUrlAtoms);
  const [formData, setFormData] = useAtom(blogAtom);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);

  const updateImageUrl = useCallback(
    (imageId: string, newUrl: string) => {
      const img = editorRef.current?.querySelector(
        `img[data-image-id="${imageId}"]`
      ) as HTMLImageElement;

      if (img) {
        img.src = newUrl;
      }
      setPendingImages((prev) => prev.filter((img) => img.id !== imageId));

      if (updateContent) updateContent();
    },
    [editorRef, updateContent, setPendingImages]
  );

  const removeImageById = useCallback(
    async (imgFile: ImageData, slug: string, htmlContent: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      const keyToDelete = imgFile.src.split('/').pop();
      if (!keyToDelete) return;

      const dataImgId = imgFile.src.startsWith('https')
        ? keyToDelete
        : imgFile.src;

      try {
        if (imgFile.src.startsWith('https')) {
          const res = await deleteImageServerAction(
            imgFile.src,
            slug,
            htmlContent
          );
        }
        const imgElement = editor.querySelector(
          `img[data-image-id="${imgFile.id}"]`
        );
        const dataImageId = Array.from(editor.querySelectorAll('img'))
          .map((img) => img.getAttribute('data-image-id'))
          .filter((id): id is string => Boolean(id));
        if (imgElement) {
          const nextElement = imgElement.nextElementSibling;
          if (nextElement && nextElement.tagName === 'BR') {
            nextElement.remove();
          }
          imgElement.remove();
        }

        const pendingImage = pendingImages.find(
          (img) => img.localUrl !== imgFile.src || img
        );

        setPendingImages((prev) =>
          prev.filter((img) => img.localUrl !== imgFile.src && img)
        );
        setImages((prev) =>
          prev.filter(
            (img) => img.src !== imgFile.src && imgFile.id !== dataImgId
          )
        );

        setImgUrl((prev) => prev.filter((img) => img !== imgFile.src));

        if (pendingImage) {
          setImageFiles((prev) => prev.filter((f) => f !== pendingImage.file));

          if (imgFile.src.startsWith('blob:')) {
            URL.revokeObjectURL(imgFile.src);
          }
        }
        const imgSrc = imgFile.src;
      } catch (error) {
        console.error('Error removing image:', error);
      }

      if (updateContent) updateContent();
    },
    [
      editorRef,
      updateContent,
      setPendingImages,
      setImages,
      setImgUrl,
      setImageFiles,
      pendingImages,
    ]
  );

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.localUrl));
    };
  }, [pendingImages]);

  return {
    updateImageUrl,
    pendingImages,
    removeImageById,
    images,
  };
};
