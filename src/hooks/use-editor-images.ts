import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { deleteImageServerAction } from '@/actions/blog-actions';
import {
  fileAtoms,
  imageAtoms,
  imageUrlAtoms,
  pendingImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { ImageData } from '@/lib/types';
import { sanitizeFileName } from '@/lib/utils';
import { useDropzone } from '@uploadthing/react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

export const useEditorImages = (
  editorRef: RefObject<HTMLDivElement | null> | undefined,
  maxImages: number,
  routeConfig: string,
  updateContent: (value?: string) => void
) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const [images, setImages] = useAtom(imageAtoms);

  const [imgUrl, setImgUrl] = useAtom(imageUrlAtoms);

  const fileToImageIdMap = useRef(new Map<File, string>());

  const insertImage = useCallback(
    (file: File, imageId: string, isInline: boolean = false) => {
      if (!editorRef?.current) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const localUrl = URL.createObjectURL(file);

        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = file.name;
        img.setAttribute('data-image-id', imageId);

        if (isInline) {
          img.style.maxHeight = '1.2em';
          img.style.maxWidth = '2em';
          img.style.verticalAlign = 'middle';
          img.style.display = 'inline';
          img.style.margin = '0 2px';
        } else {
          img.style.maxWidth = '30%';
          img.style.display = 'block';
          img.style.margin = '10px 0';
        }

        const selection = window.getSelection();
        const range = selection?.rangeCount
          ? selection.getRangeAt(0)
          : document.createRange();

        if (isInline) {
          range.deleteContents();
          range.insertNode(img);

          range.setStartAfter(img);
          range.collapse(true);
        } else {
          const container = document.createElement('div');
          container.className = 'editor-paragraph';
          container.classList.add('editor-paragraph');
          container.appendChild(img);

          let currentP =
            range.startContainer.nodeType === Node.TEXT_NODE
              ? range.startContainer.parentElement?.closest('p')
              : (range.startContainer as Element)?.closest('p');

          if (!currentP) {
            currentP = document.createElement('p');
            const editor = editorRef.current;
            if (editor) {
              editor.appendChild(currentP);
            }
          }

          range.collapse(false);
          range.insertNode(container);

          range.setStartAfter(container);
          range.collapse(true);
        }

        editorRef?.current?.focus();
        selection?.removeAllRanges();
        selection?.addRange(range);

        setPendingImages((prev) => [
          ...prev,
          { id: imageId, file: file, localUrl: dataUrl },
        ]);

        setImages((prev) => [...prev, { src: dataUrl, id: imageId }]);

        if (updateContent) updateContent();

        return () => URL.revokeObjectURL(localUrl);
      };
      reader.readAsDataURL(file);
    },
    [editorRef, setImages, setPendingImages, updateContent]
  );

  const handleImageUpload = useCallback(
    (
      files: FileList | File[],
      e: React.MouseEvent,
      isInline: boolean = false
    ) => {
      const editor = editorRef?.current;
      if (!editor) return;

      const selection = window.getSelection();
      const range =
        selection && selection.rangeCount > 0
          ? selection.getRangeAt(0)
          : document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const imageId = URL.createObjectURL(file);
        const dataImgId = imageId.split('/').pop();
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileImageId = `${sanitizedFileName}-${file.size}-${file.type}`;
        fileToImageIdMap.current.set(file, imageId);
        setImgUrl((prev) => [...prev, imageId]);
        if (dataImgId) insertImage(file, dataImgId);
      });

      if (fileInputRef.current) fileInputRef.current.value = '';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const imageId = URL.createObjectURL(file);
          insertImage(file, imageId, isInline);
        }
      };

      fileInput.click();
    },
    [editorRef, insertImage, setImgUrl]
  );

  const handleImageButtonClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
      editorRef?.current?.focus();
    },
    [editorRef]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newFiles = Array.from(files).filter(
        (file) =>
          !imageFiles.some(
            (existing) =>
              existing.name === file.name &&
              existing.size === file.size &&
              existing.lastModified === file.lastModified
          )
      );
      if (newFiles.length === 0) {
        toast.warning('Files already exist', {
          style: { backgroundColor: 'red', color: 'white' },
        });
        return;
      }

      setImageFiles((prev) => [...prev, ...newFiles]);

      handleImageUpload(newFiles, e as never);
    },
    [imageFiles, setImageFiles, handleImageUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes([routeConfig] as never).fileTypes
    ),
    multiple: true,
    maxFiles: maxImages,
    onDrop: (acceptedFiles: File[]) => {
      const newTotal = imageFiles.length + acceptedFiles.length;
      if (newTotal > 3) {
        toast.error('You can only upload up to 3 images.');
        return;
      }
      const newImageFiles = acceptedFiles.filter((file) =>
        file.type.startsWith('image/')
      );
      setImageFiles((prev) => [...prev, ...newImageFiles]);
    },
  });

  useEffect(() => {
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const updateImageUrl = useCallback(
    (imageId: string, newUrl: string) => {
      const img = editorRef?.current?.querySelector(
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
      const editor = editorRef?.current;
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
        const imgElement = editor.querySelector(`img[alt="${imgFile.id}"]`);
        const dataImageId = Array.from(editor.querySelectorAll('img'))
          .map((img) => img.getAttribute('alt'))
          .filter((id): id is string => Boolean(id));
        if (imgElement) {
          const nextElement = imgElement.nextElementSibling;
          if (nextElement && nextElement.tagName === 'BR') {
            nextElement.remove();
          }
          imgElement.remove();
        }
        const imgArr = Array.from(editor.querySelectorAll('img'));
        const datImgId = imgArr.map((i) => i.getAttribute('alt'));

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
  return {
    previews,
    fileInputRef,
    handleImageUpload,
    handleImageButtonClick,
    handleFileInputChange,
    getRootProps,
    getInputProps,
    removeImageById,
    images,
    setImages,
    updateImageUrl,
    pendingImages,
  };
};
