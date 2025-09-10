import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { deleteImageServerAction } from '@/actions/blog-actions';
import { maxBlogImages } from '@/lib/constants';
import {
  fileAtoms,
  imageAtoms,
  ImageData,
  imageUrlAtoms,
  pendingImgAtoms,
} from '@/lib/jotai/blog-atoms';
import { useUploadThing } from '@/lib/uploadthing';
import { useEditorStore } from '@/store/use-editor-store';
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
  // routeConfig: ExpandedRouteConfig | undefined,
  updateContent?: (value?: string) => void,
  isDialogOpen?: boolean,
  setIsDialogOpen?: (isDialogOpen: boolean) => void
) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [images, setImages] = useAtom(imageAtoms);

  const [imgUrl, setImgUrl] = useAtom(imageUrlAtoms);

  const fileToImageIdMap = useRef(new Map<File, string>());

  const { editor } = useEditorStore();

  // const insertImage = useCallback(
  //   (file: File, imageId: string, isInline: boolean = false) => {
  //     if (!editorRef?.current) return;

  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       const dataUrl = e.target?.result as string;
  //       const localUrl = URL.createObjectURL(file);

  //       const img = document.createElement('img');
  //       img.src = dataUrl;
  //       img.alt = file.name;
  //       img.setAttribute('data-image-id', imageId);

  //       if (isInline) {
  //         img.style.maxHeight = '1.2em';
  //         img.style.maxWidth = '2em';
  //         img.style.verticalAlign = 'middle';
  //         img.style.display = 'inline';
  //         img.style.margin = '0 2px';
  //       } else {
  //         img.style.maxWidth = '30%';
  //         img.style.display = 'block';
  //         img.style.margin = '10px 0';
  //       }

  //       const selection = window.getSelection();
  //       const range = selection?.rangeCount
  //         ? selection.getRangeAt(0)
  //         : document.createRange();

  //       if (isInline) {
  //         range.deleteContents();
  //         range.insertNode(img);

  //         range.setStartAfter(img);
  //         range.collapse(true);
  //       } else {
  //         const container = document.createElement('div');
  //         container.className = 'editor-paragraph';
  //         container.classList.add('editor-paragraph');
  //         container.appendChild(img);

  //         let currentP =
  //           range.startContainer.nodeType === Node.TEXT_NODE
  //             ? range.startContainer.parentElement?.closest('p')
  //             : (range.startContainer as Element)?.closest('p');

  //         if (!currentP) {
  //           currentP = document.createElement('p');
  //           const editor = editorRef.current;
  //           if (editor) {
  //             editor.appendChild(currentP);
  //           }
  //         }

  //         range.collapse(false);
  //         range.insertNode(container);

  //         range.setStartAfter(container);
  //         range.collapse(true);
  //       }

  //       editorRef?.current?.focus();
  //       selection?.removeAllRanges();
  //       selection?.addRange(range);

  //       setPendingImages((prev) => [
  //         ...prev,
  //         { id: imageId, file: file, localUrl: dataUrl },
  //       ]);

  //       setImages((prev) => [...prev, { src: dataUrl, id: imageId }]);

  //       if (updateContent) updateContent();

  //       return () => URL.revokeObjectURL(localUrl);
  //     };
  //     reader.readAsDataURL(file);
  //   },
  //   [editorRef, setImages, setPendingImages, updateContent]
  // );

  const insertImage = useCallback(
    (file: File, imageId: string, isInline: boolean = false) => {
      if (!editorRef?.current) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // const editor = editorRef.current;

        const imageHTML = `<img src="${dataUrl}" alt="${file.name}" data-image-id="${imageId}" class="${
          isInline ? 'inline-image' : 'block-image'
        }" />`;

        // TipTap v3 insertContent
        editor?.commands.insertContent(imageHTML);

        setPendingImages((prev) => [
          ...prev,
          { id: imageId, file: file, localUrl: dataUrl },
        ]);

        // setImages((prev) => [...prev, { src: dataUrl, id: imageId }]);

        // editor?.chain().focus().setImage({ src: dataUrl }).run();

        if (updateContent) updateContent();
      };

      reader.readAsDataURL(file);
    },
    [editorRef, setImages, setPendingImages, updateContent]
  );

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run();
  };

  const handleImageUpload = (files: FileList | File[]) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = files?.[0];
      if (file) {
        const imgUrl = URL.createObjectURL(file);
        onChange(imgUrl);

        insertImage(file, imgUrl);
      }
    };

    input.click();
  };

  // const handleImageUpload = useCallback(
  //   (
  //     files: FileList | File[],
  //     e: React.MouseEvent,
  //     isInline: boolean = false
  //   ) => {
  //     const editor = editorRef?.current;
  //     if (!editor) return;

  //     const selection = window.getSelection();
  //     const range =
  //       selection && selection.rangeCount > 0
  //         ? selection.getRangeAt(0)
  //         : document.createRange();
  //     range.selectNodeContents(editor);
  //     range.collapse(false);

  //     Array.from(files).forEach((file) => {
  //       if (!file.type.startsWith('image/')) return;
  //       const imageId = URL.createObjectURL(file);
  //       const dataImgId = imageId.split('/').pop();
  //       const sanitizedFileName = sanitizeFileName(file.name);
  //       const fileImageId = `${sanitizedFileName}-${file.size}-${file.type}`;
  //       fileToImageIdMap.current.set(file, imageId);
  //       setImgUrl((prev) => [...prev, imageId]);
  //       if (dataImgId) insertImage(file, dataImgId);
  //     });

  //     if (fileInputRef.current) fileInputRef.current.value = '';

  //     const fileInput = document.createElement('input');
  //     fileInput.type = 'file';
  //     fileInput.accept = 'image/*';

  //     fileInput.onchange = (event) => {
  //       const file = (event.target as HTMLInputElement).files?.[0];
  //       if (file) {
  //         const imageId = URL.createObjectURL(file);
  //         insertImage(file, imageId, isInline);
  //       }
  //     };

  //     fileInput.click();
  //   },
  //   [editorRef, insertImage, setImgUrl]
  // );

  // const handleImageButtonClick = useCallback(
  //   (e: MouseEvent) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     fileInputRef.current?.click();
  //     // editorRef?.current?.focus();
  //     editor?.chain().focus();
  //   },
  //   [editorRef]
  // );

  const handleImageButtonClick = useCallback(() => {
    if (imgUrl) {
      onChange(imgUrl[0]);
      setImgUrl([]);
      if (isDialogOpen && setIsDialogOpen) setIsDialogOpen(isDialogOpen);
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleFileInputChange is triggered');
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

      // setImageFiles((prev) => [...prev, ...newFiles]);

      // handleImageUpload(newFiles);
      // handleImageUpload(newFiles, e as never);
    },
    [imageFiles, setImageFiles, handleImageUpload]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newTotal = imageFiles.length + acceptedFiles.length;
    if (newTotal > 3) {
      toast.error('You can only upload up to 3 images');
      return;
    }

    const newImageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith('image/')
    );
    setImageFiles((prev) => [...prev, ...newImageFiles]);
  }, []);

  const { startUpload, routeConfig } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      const newImages = (res ?? [])
        .map((file) => ({
          src: file.ufsUrl || file.url,
          id: file.key,
        }))
        .slice(0, maxBlogImages);

      setImages(newImages);
      const newBlogUrl = newImages.map((img) => img.src);
      setImgUrl((prev) => [...prev, ...newBlogUrl]);

      setIsUploading(false);
      toast.success('Upload completed successfully!');
    },
    onUploadError: (error) => {
      setIsUploading(false);
      console.error('Upload error:', error);
      if (error.message.includes('Failed to register metadata')) {
        toast.error('Invalid file selection. Please choose a valid image.');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    },
    onUploadBegin: () => {
      setIsUploading(true);
      toast.info('Uploading image...');
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig as never).fileTypes
    ),
    multiple: true,
    maxFiles: maxImages,
    // onDrop: (acceptedFiles: File[]) => {
    //   const newTotal = imageFiles.length + acceptedFiles.length;
    //   if (newTotal > 3) {
    //     toast.error('You can only upload up to 3 images.');
    //     return;
    //   }
    //   const newImageFiles = acceptedFiles.filter((file) =>
    //     file.type.startsWith('image/')
    //   );
    //   setImageFiles((prev) => [...prev, ...newImageFiles]);
    // },
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

  // const removeImageById = useCallback(
  //   async (imgFile: ImageData, slug: string, htmlContent: string) => {
  //     console.log('use editor image');
  //     const editor = editorRef?.current;
  //     if (!editor) return;
  //     const keyToDelete = imgFile.src.split('/').pop();
  //     if (!keyToDelete) return;

  //     const dataImgId = imgFile.src.startsWith('http')
  //       ? keyToDelete
  //       : imgFile.src;
  //     try {
  //       if (imgFile.src.startsWith('http')) {
  //         const res = await deleteImageServerAction(
  //           imgFile.src,
  //           slug,
  //           htmlContent
  //         );
  //       }
  //       const imgElement = editor.querySelector(`img[alt="${imgFile.id}"]`);

  //       const dataImageId = Array.from(editor.querySelectorAll('img'))
  //         .map((img) => img.getAttribute('alt'))
  //         .filter((id): id is string => Boolean(id));
  //       const allImages = Array.from(editor.querySelectorAll('img')).filter(
  //         (img) => img.src && img.src.trim() !== ''
  //       );

  //       const imgToRemove = allImages.find(
  //         (img) =>
  //           img.src === imgFile.src || img.getAttribute('alt') === imgFile.id
  //       );
  //       console.log(
  //         'All images in editor:',
  //         allImages.map((img) => ({
  //           src: img,
  //           alt: img,
  //         }))
  //       );

  //       const dataUrls = document.querySelectorAll('img[src]');
  //       if (imgElement) {
  //         const nextElement = imgElement.nextElementSibling;
  //         if (nextElement && nextElement.tagName === 'BR') {
  //           nextElement.remove();
  //         }
  //         imgElement.remove();
  //       }
  //       const imgArr = Array.from(editor.querySelectorAll('img'));
  //       const datImgId = imgArr.map((i) => i.getAttribute('alt'));

  //       const pendingImage = pendingImages.find(
  //         (img) => img.localUrl !== imgFile.src || img
  //       );

  //       setPendingImages((prev) =>
  //         prev.filter((img) => img.localUrl !== imgFile.src && img)
  //       );
  //       setImages((prev) =>
  //         prev.filter(
  //           (img) => img.src !== imgFile.src && imgFile.id !== dataImgId
  //         )
  //       );

  //       setImgUrl((prev) => prev.filter((img) => img !== imgFile.src));

  //       if (pendingImage) {
  //         setImageFiles((prev) => prev.filter((f) => f !== pendingImage.file));

  //         if (imgFile.src.startsWith('blob:')) {
  //           URL.revokeObjectURL(imgFile.src);
  //         }
  //       }
  //       const imgSrc = imgFile.src;
  //     } catch (error) {
  //       console.error('Error removing image:', error);
  //     }

  //     if (updateContent) updateContent();
  //   },
  //   [
  //     editorRef,
  //     updateContent,
  //     setPendingImages,
  //     setImages,
  //     setImgUrl,
  //     setImageFiles,
  //     pendingImages,
  //   ]
  // );

  // const removeImageById = useCallback(
  //   async (imgFile: ImageData, slug: string, htmlContent: string) => {
  //     const editorElement = editorRef?.current;
  //     if (!editorElement) return;

  //     console.log('Starting image removal for:', imgFile.id);
  //     console.log('Image src:', imgFile.src);
  //     console.log('Is blob URL:', imgFile.src.startsWith('blob:'));

  //     try {
  //       // Method 1: Find the specific image by alt attribute
  //       const targetImage = editorElement.querySelector(
  //         `img[alt="${imgFile.id}"][src]`
  //       );

  //       // Method 2: Get all images with src and find by matching src
  //       const allImagesWithSrc = Array.from(
  //         editorElement.querySelectorAll('img')
  //       ).filter((img) => img.src && img.src.trim() !== '');

  //       const imageToRemove = allImagesWithSrc.find(
  //         (img) =>
  //           img.src === imgFile.src || img.getAttribute('alt') === imgFile.id
  //       );

  //       if (imageToRemove) {
  //         const nextElement = imageToRemove.nextElementSibling;
  //         if (nextElement && nextElement.tagName === 'BR') {
  //           nextElement.remove();
  //         }
  //         imageToRemove.remove();
  //         console.log('Image removed successfully');
  //       } else {
  //         console.warn('Image not found:', imgFile);
  //       }

  //       // Server deletion logic
  //       if (imgFile.src.startsWith('https')) {
  //         await deleteImageServerAction(imgFile.src, slug, htmlContent);
  //       }

  //       // State updates...
  //       setPendingImages((prev) =>
  //         prev.filter(
  //           (img) => img.localUrl !== imgFile.src && img.id !== imgFile.id
  //         )
  //       );

  //       setImages((prev) =>
  //         prev.filter((img) => img.src !== imgFile.src && img.id !== imgFile.id)
  //       );

  //       setImgUrl((prev) => prev.filter((url) => url !== imgFile.src));

  //       // Cleanup blob URLs
  //       if (imgFile.src.startsWith('blob:')) {
  //         URL.revokeObjectURL(imgFile.src);
  //       }
  //     } catch (error) {
  //       console.error('Error removing image:', error);
  //     }

  //     if (updateContent) updateContent();
  //   },
  //   [
  //     editorRef,
  //     updateContent,
  //     setPendingImages,
  //     setImages,
  //     setImgUrl,
  //     setImageFiles,
  //     pendingImages,
  //   ]
  // );

  // const removeImageById = useCallback(
  //   async (imgFile: ImageData, slug: string, htmlContent: string) => {
  //     const editorElement = editorRef?.current;
  //     if (!editorElement) {
  //       console.warn('Editor element not found');
  //       return;
  //     }

  //     console.log('Starting image removal for:', imgFile.id);
  //     console.log('Image src:', imgFile.src);
  //     console.log('Is blob URL:', imgFile.src.startsWith('blob'));

  //     try {
  //       // DEBUGGING: Log all images in the editor
  //       const allImages = Array.from(editorElement.querySelectorAll('img'));
  //       console.log('=== ALL IMAGES IN EDITOR ===');
  //       allImages.forEach((img, index) => {
  //         if (!img.src.trim()) return;
  //         console.log(`Image ${index + 1}:`, {
  //           src: img.src,
  //           alt: img.getAttribute('alt'),
  //           'data-image-id': img.getAttribute('data-image-id'),
  //           srcAttribute: img.getAttribute('src'),
  //         });
  //       });
  //       console.log('================================', allImages);

  //       // Try to find the image using multiple methods
  //       let imageToRemove: HTMLImageElement | null = null;

  //       // Method 1: By alt attribute
  //       imageToRemove = editorElement.querySelector(`img[alt="${imgFile.id}"]`);
  //       if (imageToRemove) {
  //         console.log('✅ Found image by alt attribute');
  //       }

  //       // Method 2: By src (exact match)
  //       if (!imageToRemove) {
  //         imageToRemove = editorElement.querySelector(
  //           `img[src="${imgFile.src}"]`
  //         );
  //         if (imageToRemove) {
  //           console.log('✅ Found image by src attribute');
  //         }
  //       }

  //       // Method 3: By data-image-id
  //       if (!imageToRemove) {
  //         imageToRemove = editorElement.querySelector(
  //           `img[data-image-id="${imgFile.id}"]`
  //         );
  //         if (imageToRemove) {
  //           console.log('✅ Found image by data-image-id');
  //         }
  //       }

  //       // Method 4: Search through all images manually
  //       if (!imageToRemove) {
  //         console.log('Searching through all images manually...');
  //         for (const img of allImages) {
  //           const imgSrc = img.src || img.getAttribute('src');
  //           const imgAlt = img.getAttribute('alt');
  //           const imgDataId = img.getAttribute('data-image-id');

  //           if (
  //             imgSrc === imgFile.src ||
  //             imgAlt === imgFile.id ||
  //             imgDataId === imgFile.id ||
  //             (imgSrc && imgSrc.includes(imgFile.src.split('/').pop() || ''))
  //           ) {
  //             imageToRemove = img;
  //             console.log('✅ Found image through manual search');
  //             break;
  //           }
  //         }
  //       }

  //       // 1. Remove from DOM if found
  //       if (imageToRemove) {
  //         console.log('Removing image from DOM...');

  //         // Remove any adjacent BR tags
  //         const nextElement = imageToRemove.nextElementSibling;
  //         if (nextElement && nextElement.tagName === 'BR') {
  //           nextElement.remove();
  //         }

  //         // Remove the image element
  //         imageToRemove.remove();
  //         console.log('✅ Image removed from DOM successfully');
  //       } else {
  //         console.error('❌ Image not found in DOM with any method');
  //         console.log('Looking for:', {
  //           id: imgFile.id,
  //           src: imgFile.src,
  //           srcEnd: imgFile.src.split('/').pop(),
  //         });
  //         return; // Exit early if image not found
  //       }

  //       // 2. Update React state immediately
  //       console.log('Updating React state...');

  //       setPendingImages((prev) => {
  //         const filtered = prev.filter((img) => {

  //           img.localUrl !== imgFile.src && img.id !== imgFile.id;
  //         });
  //         console.log(`Pending images: ${prev.length} → ${filtered.length}`);
  //         return filtered;
  //       });

  //       setImages((prev) => {
  //         const filtered = prev.filter(
  //           (img) => img.src !== imgFile.src && img.id !== imgFile.id
  //         );
  //         console.log(`Images: ${prev.length} → ${filtered.length}`);
  //         return filtered;
  //       });

  //       setImgUrl((prev) => {
  //         const filtered = prev.filter((url) => url !== imgFile.src);
  //         console.log(`Image URLs: ${prev.length} → ${filtered.length}`);
  //         return filtered;
  //       });

  //       // 3. Handle file cleanup
  //       const pendingImage = pendingImages.find(
  //         (img) => img.localUrl === imgFile.src || img.id === imgFile.id
  //       );

  //       if (pendingImage?.file) {
  //         setImageFiles((prev) => {
  //           const filtered = prev.filter((f) => f !== pendingImage.file);
  //           console.log(`Image files: ${prev.length} → ${filtered.length}`);
  //           return filtered;
  //         });
  //       }

  //       // 4. Server deletion (for uploaded images)
  //       if (imgFile.src.startsWith('https')) {
  //         console.log('Deleting from server...');
  //         try {
  //           const result = await deleteImageServerAction(
  //             imgFile.src,
  //             slug,
  //             htmlContent
  //           );
  //           console.log('✅ Server deletion successful:', result);
  //         } catch (serverError) {
  //           console.error('❌ Server deletion failed:', serverError);
  //           // Don't throw - continue with local cleanup
  //         }
  //       }

  //       // 5. Revoke blob URL LAST (with small delay)
  //       if (imgFile.src.startsWith('blob:')) {
  //         console.log('Scheduling blob URL revocation...');
  //         setTimeout(() => {
  //           try {
  //             URL.revokeObjectURL(imgFile.src);
  //             console.log('✅ Blob URL revoked successfully');
  //           } catch (revokeError) {
  //             console.error('❌ Failed to revoke blob URL:', revokeError);
  //           }
  //         }, 150); // Small delay to ensure React has finished re-rendering
  //       }

  //       // 6. Update content last
  //       if (updateContent) {
  //         console.log('Updating content...');
  //         // Small delay to ensure DOM changes are complete
  //         setTimeout(() => {
  //           updateContent();
  //           console.log('✅ Content updated');
  //         }, 50);
  //       }

  //       console.log('✅ Image removal completed successfully');
  //     } catch (error) {
  //       console.error('❌ Error during image removal:', error);

  //       // Provide more specific error information
  //       if (error instanceof Error) {
  //         console.error('Error message:', error.message);
  //         console.error('Error stack:', error.stack);
  //       }

  //       // Try to recover gracefully - still update state even if DOM removal failed
  //       setPendingImages((prev) =>
  //         prev.filter(
  //           (img) => img.localUrl !== imgFile.src && img.id !== imgFile.id
  //         )
  //       );
  //       setImages((prev) =>
  //         prev.filter((img) => img.src !== imgFile.src && img.id !== imgFile.id)
  //       );
  //       setImgUrl((prev) => prev.filter((url) => url !== imgFile.src));
  //     }
  //   },
  //   [
  //     editorRef,
  //     updateContent,
  //     setPendingImages,
  //     setImages,
  //     setImgUrl,
  //     setImageFiles,
  //     pendingImages,
  //   ]
  // );

  const removeImageById = useCallback(
    async (imgFile: ImageData, slug: string, htmlContent: string) => {
      if (!editor) {
        console.warn('TipTap editor instance not found');
        return;
      }

      // console.log('Starting image removal for:', imgFile.id);
      // console.log('Image src:', imgFile.src);

      try {
        // STEP 1: Debug - Log the entire TipTap document structure
        console.log('=== TIPTAP DOCUMENT DEBUG ===');
        console.log(
          'Document JSON:',
          JSON.stringify(editor.getJSON(), null, 2)
        );
        console.log('Document HTML:', editor.getHTML());

        // STEP 2: Find ALL nodes in the document and log them
        const allNodes: Array<{ type: string; attrs: any; pos: number }> = [];
        editor.state.doc.descendants((node, pos) => {
          allNodes.push({
            type: node.type.name,
            attrs: node.attrs,
            pos: pos,
          });
        });

        console.log('All nodes in document:', allNodes);

        // STEP 3: Find specifically image nodes
        const imageNodes = allNodes.filter((node) => node.type === 'image');
        console.log('Image nodes found:', imageNodes);

        // STEP 4: Try multiple removal strategies
        let imageFound = false;
        let removalMethod = '';

        // Strategy 1: Search by exact src match
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === imgFile.src) {
            console.log('✅ Found image by exact src match');
            editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
            imageFound = true;
            removalMethod = 'exact src match';
            return false;
          }
        });

        // Strategy 2: Search by ID in alt attribute
        if (!imageFound) {
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.alt === imgFile.id) {
              console.log('✅ Found image by alt attribute');
              editor.commands.deleteRange({
                from: pos,
                to: pos + node.nodeSize,
              });
              imageFound = true;
              removalMethod = 'alt attribute';
              return false;
            }
          });
        }

        // Strategy 3: Search by data-image-id
        if (!imageFound) {
          editor.state.doc.descendants((node, pos) => {
            if (
              node.type.name === 'image' &&
              node.attrs['data-image-id'] === imgFile.id
            ) {
              console.log('✅ Found image by data-image-id');
              editor.commands.deleteRange({
                from: pos,
                to: pos + node.nodeSize,
              });
              imageFound = true;
              removalMethod = 'data-image-id';
              return false;
            }
          });
        }

        // Strategy 4: Partial src matching (for blob URLs or filename matching)
        if (!imageFound) {
          const targetFileName = imgFile.src.split('/').pop() || imgFile.id;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image') {
              const nodeSrc = node.attrs.src || '';
              const nodeFileName = nodeSrc.split('/').pop() || '';

              if (
                nodeFileName === targetFileName ||
                nodeSrc.includes(targetFileName)
              ) {
                console.log('✅ Found image by filename match');
                editor.commands.deleteRange({
                  from: pos,
                  to: pos + node.nodeSize,
                });
                imageFound = true;
                removalMethod = 'filename match';
                return false;
              }
            }
          });
        }

        // Strategy 5: Use chain commands (alternative approach)
        if (!imageFound) {
          console.log('Trying chain commands approach...');
          let chainSuccess = false;

          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image') {
              const src = node.attrs.src;
              const alt = node.attrs.alt;

              // More flexible matching
              if (
                src === imgFile.src ||
                alt === imgFile.id ||
                (src &&
                  imgFile.src &&
                  src.includes(imgFile.src.split('/').pop() || ''))
              ) {
                const success = editor
                  .chain()
                  .focus()
                  .setTextSelection({ from: pos, to: pos + node.nodeSize })
                  .deleteSelection()
                  .run();

                if (success) {
                  chainSuccess = true;
                  imageFound = true;
                  removalMethod = 'chain commands';
                  console.log('✅ Image removed using chain commands');
                  return false;
                }
              }
            }
          });
        }

        // Strategy 6: Fallback - Update HTML content directly and reset editor
        if (!imageFound) {
          console.log(
            'All TipTap methods failed, trying HTML content replacement...'
          );

          const currentHTML = editor.getHTML();
          console.log('Current HTML:', currentHTML);

          // Try to remove the image from HTML string
          const imgRegexPatterns = [
            new RegExp(
              `<img[^>]*src="${imgFile.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
              'gi'
            ),
            new RegExp(
              `<img[^>]*alt="${imgFile.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
              'gi'
            ),
            new RegExp(
              `<img[^>]*data-image-id="${imgFile.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
              'gi'
            ),
          ];

          let updatedHTML = currentHTML;
          let htmlChanged = false;

          imgRegexPatterns.forEach((pattern) => {
            const newHTML = updatedHTML.replace(pattern, '');
            if (newHTML !== updatedHTML) {
              updatedHTML = newHTML;
              htmlChanged = true;
              console.log('✅ Found and removed image from HTML');
            }
          });

          if (htmlChanged) {
            editor.commands.setContent(updatedHTML);
            imageFound = true;
            removalMethod = 'HTML replacement';
            console.log('✅ Editor content updated with new HTML');
          }
        }

        if (!imageFound) {
          console.error('❌ Image not found with any method');
          console.log('Search criteria:', {
            id: imgFile.id,
            src: imgFile.src,
            srcEnd: imgFile.src.split('/').pop(),
          });
          console.log('Available image nodes:', imageNodes);
          return;
        }

        // 2. Update React state
        console.log('Updating React state...');

        setPendingImages((prev) => {
          const filtered = prev.filter((img) => {
            // Fix: Return boolean instead of assignment
            return img.localUrl !== imgFile.src && img.id !== imgFile.id;
          });
          console.log(`Pending images: ${prev.length} → ${filtered.length}`);
          return filtered;
        });

        setImages((prev) => {
          const filtered = prev.filter(
            (img) => img.src !== imgFile.src && img.id !== imgFile.id
          );
          console.log(`Images: ${prev.length} → ${filtered.length}`);
          return filtered;
        });

        setImgUrl((prev) => {
          const filtered = prev.filter((url) => url !== imgFile.src);
          console.log(`Image URLs: ${prev.length} → ${filtered.length}`);
          return filtered;
        });

        // 3. Handle file cleanup
        const pendingImage = pendingImages.find(
          (img) => img.localUrl === imgFile.src || img.id === imgFile.id
        );

        if (imgFile.alt) {
          setImageFiles((prev) => {
            const filtered = prev.filter((f) => !imgFile.alt?.includes(f.name));
            console.log(`Image files: ${prev.length} → ${filtered.length}`);
            return filtered;
          });
        }

        // 4. Server deletion (for uploaded images)
        if (imgFile.src.startsWith('https')) {
          console.log('Deleting from server...');
          try {
            const result = await deleteImageServerAction(
              imgFile.src,
              slug,
              htmlContent
            );
            console.log('✅ Server deletion successful:', result);
          } catch (serverError) {
            console.error('❌ Server deletion failed:', serverError);
            // Don't throw - continue with local cleanup
          }
        }

        // 5. Revoke blob URL LAST
        if (imgFile.src.startsWith('blob:')) {
          console.log('Revoking blob URL...');
          try {
            URL.revokeObjectURL(imgFile.src);
            console.log('✅ Blob URL revoked successfully');
          } catch (revokeError) {
            console.error('❌ Failed to revoke blob URL:', revokeError);
          }
        }

        // 6. Force TipTap to update its content (optional, but helps ensure sync)
        if (updateContent) {
          console.log('Updating content...');
          // Let TipTap process the changes first
          setTimeout(() => {
            updateContent();
            console.log('✅ Content updated');
          }, 10);
        }

        console.log('✅ Image removal completed successfully');
      } catch (error) {
        console.error('❌ Error during image removal:', error);

        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }

        // Try to recover gracefully - still update state
        setPendingImages((prev) =>
          prev.filter(
            (img) => img.localUrl !== imgFile.src && img.id !== imgFile.id
          )
        );
        setImages((prev) =>
          prev.filter((img) => img.src !== imgFile.src && img.id !== imgFile.id)
        );
        setImgUrl((prev) => prev.filter((url) => url !== imgFile.src));
      }
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

  // Additional debug function to help identify the issue
  const debugImageMatching = useCallback(
    (imgFile: ImageData) => {
      const editorElement = editorRef?.current;
      if (!editorElement) return;

      console.log('=== DEBUGGING IMAGE MATCHING ===');
      console.log('Looking for image:', imgFile);

      const allImages = Array.from(editorElement.querySelectorAll('img'));
      console.log(`Total images in editor: ${allImages.length}`);

      allImages.forEach((img, index) => {
        const imgData = {
          index,
          src: img.src,
          srcAttr: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          dataImageId: img.getAttribute('data-image-id'),
          className: img.className,
        };

        console.log(`Image ${index + 1}:`, imgData);

        // Check matches
        const matches = {
          srcMatch: img.src === imgFile.src,
          altMatch: img.getAttribute('alt') === imgFile.id,
          dataIdMatch: img.getAttribute('data-image-id') === imgFile.id,
        };

        if (Object.values(matches).some(Boolean)) {
          console.log('🎯 POTENTIAL MATCH:', matches);
        }
      });

      console.log('================================');
    },
    [editorRef]
  );

  // Usage: Call this before removeImageById to debug
  // debugImageMatching(imgFile);

  // Utility function to debug images in editor
  const debugEditorImages = (editorElement: HTMLElement) => {
    console.log('=== Editor Images Debug ===');

    const allImages = editorElement.querySelectorAll('img');
    console.log(`Total img tags: ${allImages.length}`);

    const imagesWithSrc = Array.from(allImages).filter(
      (img) => img.src && img.src.trim() !== ''
    );
    console.log(`Images with valid src: ${imagesWithSrc.length}`);

    imagesWithSrc.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, {
        src: img.src,
        alt: img.getAttribute('alt'),
        srcAttribute: img.getAttribute('src'),
        width: img.width,
        height: img.height,
      });
    });

    return imagesWithSrc;
  };

  return {
    insertImage,
    previews,
    fileInputRef,
    handleImageUpload,
    handleImageButtonClick,
    handleFileInputChange,
    getRootProps,
    getInputProps,
    startUpload,
    routeConfig,
    removeImageById,
    images,
    setImages,
    updateImageUrl,
    pendingImages,
    setPendingImages,
  };
};
