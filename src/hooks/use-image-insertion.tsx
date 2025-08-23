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

  // 🧠 Insert <img> with blob preview
  // const insertImage = useCallback(
  //   (file: File, imageId: string) => {
  //     if (!editorRef.current) return;

  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       const dataUrl = e.target?.result as string;

  //       const htmlContent = editorRef.current?.innerHTML;
  //       // const imageId = `${Date.now()}-${Math.random()}`;
  //       const localUrl = URL.createObjectURL(file);
  //       // Create img element with proper attributes
  //       const img = document.createElement('img');
  //       img.src = dataUrl;
  //       img.alt = file.name;
  //       img.setAttribute('data-image-id', imageId);
  //       img.style.maxWidth = '100%';
  //       img.style.display = 'block';
  //       img.style.margin = '10px 0';

  //       // Create a container to ensure proper HTML structure
  //       const container = document.createElement('div');
  //       container.appendChild(img);

  //       const selection = window.getSelection();
  //       const range = selection?.rangeCount
  //         ? selection.getRangeAt(0)
  //         : document.createRange();

  //       range.collapse(false);
  //       range.insertNode(container);

  //       // range.deleteContents();
  //       // const fragment = range.createContextualFragment(imgHTML);
  //       // range.insertNode(fragment);

  //       // range.insertNode(img);
  //       // editorRef.current.focus();
  //       // selection?.removeAllRanges();
  //       // selection?.addRange(range);

  //       // Move cursor after the image
  //       range.setStartAfter(container);
  //       range.collapse(true);

  //       editorRef.current?.focus();
  //       selection?.removeAllRanges();
  //       selection?.addRange(range);

  //       setPendingImages((prev) => [
  //         ...prev,
  //         { id: imageId, file: file, localUrl: dataUrl },
  //       ]);

  //       setImages((prev) => [...prev, { src: dataUrl, id: imageId }]);
  //       // setImgUrl((prev) => [...prev, imgBlob]);
  //       // setFormData(prev=>({
  //       //   ...prev,
  //       //   content:
  //       // }))
  //       if (updateContent) updateContent();

  //       return () => URL.revokeObjectURL(localUrl);
  //     };
  //     reader.readAsDataURL(file);
  //   },
  //   [editorRef, setImages, setPendingImages, updateContent]
  // );

  // const isHTMLImageElement = (
  //   element: Element | null | undefined
  // ): element is HTMLImageElement => {
  //   return element instanceof HTMLImageElement;
  // };

  // ✅ Replace <img> src with final URL from UploadThing
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
    async (
      imgFile: ImageData,
      slug: string,
      htmlContent: string
      // imageUrl: string,
      // fileImageId: string
    ) => {
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

        // Find the corresponding file from pendingImages
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

        // const filteredImg = images.filter((f) => f.src !== imageUrl);
        // setImgUrl((prev) => {
        //   const filtered = prev.filter((img) => {
        //     const shouldKeep = img !== imageUrl;
        //     return shouldKeep;
        //   });
        //   return filtered;
        // });
        setImgUrl((prev) => prev.filter((img) => img !== imgFile.src));

        // if (imgFile) {
        //   setImageFiles((prev) => prev.filter((file) => file !== imgFile));
        // }

        if (pendingImage) {
          setImageFiles((prev) => prev.filter((f) => f !== pendingImage.file));

          // Clean up blob URL to prevent memory leaks
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

  // 🧹 Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.localUrl));
    };
  }, [pendingImages]);

  return {
    // insertImage,
    updateImageUrl,
    pendingImages,
    removeImageById,
    images,
  };
};
