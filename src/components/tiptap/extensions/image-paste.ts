// import { Extension } from '@tiptap/core';
// import { Plugin, PluginKey } from '@tiptap/pm/state';
// import { Editor } from '@tiptap/react';

// export const imagePasteExtension = Extension.create({
//   name: 'imagePaste',
//   addProseMirrorPlugins() {
//     return [
//       new Plugin({
//         key: new PluginKey('imagePaste'),
//         props: {
//           handlePaste: (view, event, slice) => {
//             const items = Array.from(event.clipboardData?.items || []);
//             const imageItems = items.filter(
//               (item) => item.type.indexOf('image') === 0
//             );

//             if (imageItems.length === 0) {
//               return false; // Let TipTap handle non-image content normally
//             }

//             event.preventDefault();

//             imageItems.forEach((item) => {
//               const file = item.getAsFile();
//               if (file) {
//                 handleImageFile(file, view, this.editor);
//               }
//             });

//             return true; // Prevent default paste behavior
//           },
//         },
//       }),
//     ];
//   },
// });

// async function handleImageFile(file: File, view: any, editor: Editor) {
//   console.log('Pasted image file:', file);

//   // Create blob URL for immediate display
//   const imageUrl = URL.createObjectURL(file);

//   // TipTap v3 way to insert image
//   editor.commands.insertContent({
//     type: 'image',
//     attrs: {
//       src: imageUrl,
//       alt: file.name,
//       'data-image-id': file.name,
//       title: file.name,
//     },
//   });

//   // Optional: Upload to server and replace blob URL
//   // try {
//   //   const uploadedUrl = await uploadImageToServer(file);

//   //   // Replace blob URL with server URL in the content
//   //   const currentHTML = editor.getHTML();
//   //   const updatedHTML = currentHTML.replace(imageUrl, uploadedUrl);
//   //   editor.commands.setContent(updatedHTML);

//   //   // Clean up blob URL
//   //   URL.revokeObjectURL(imageUrl);
//   //   console.log('✅ Image uploaded and URL replaced');
//   // } catch (error) {
//   //   console.error('Failed to upload pasted image:', error);
//   // }
// }

import { useEffect } from 'react';

import { Editor } from '@tiptap/react';

export function useImagePaste(
  editor: Editor | null,
  editorRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const editorElement = editorRef.current;

    const handlePaste = async (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      const items = Array.from(clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      if (imageItems.length === 0) return;

      event.preventDefault();
      event.stopPropagation();

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;

        const imageUrl = URL.createObjectURL(file);
        const imageId = generateImageId();

        // Insert image immediately
        const success = editor.commands.insertContent(
          `<img src="${imageUrl}" alt="${file.name}" data-image-id="${imageId}" title="${file.name}" style="max-width: 100%; height: auto;" />`
        );

        if (success) {
          console.log('✅ Image pasted successfully');

          // Handle server upload in background
          handleServerUpload(file, imageUrl, imageId, editor);
        } else {
          console.error('❌ Failed to paste image');
          URL.revokeObjectURL(imageUrl);
        }
      }
    };

    editorElement.addEventListener('paste', handlePaste, true);

    return () => {
      editorElement.removeEventListener('paste', handlePaste, true);
    };
  }, [editor, editorRef]);
}

// Helper function for server upload
async function handleServerUpload(
  file: File,
  tempUrl: string,
  imageId: string,
  editor: Editor
) {
  try {
    const serverUrl = await uploadImageToServer(file);

    // Find and replace the specific image by data-image-id
    const currentHTML = editor.getHTML();
    const regex = new RegExp(
      `<img([^>]*data-image-id="${imageId}"[^>]*)src="${tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"([^>]*)>`,
      'g'
    );

    const updatedHTML = currentHTML.replace(
      regex,
      `<img$1src="${serverUrl}"$2>`
    );

    if (updatedHTML !== currentHTML) {
      editor.commands.setContent(updatedHTML);
      URL.revokeObjectURL(tempUrl);
      console.log('✅ Image URL updated with server URL');
    }
  } catch (error) {
    console.error('❌ Failed to upload image:', error);
    // Keep the blob URL as fallback
  }
}

// Helper functions
function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function uploadImageToServer(file: File): Promise<string> {
  // Replace with your actual upload implementation
  const formData = new FormData();
  formData.append('image', file);

  // const response = await fetch('/api/upload-image', {
  //   method: 'POST',
  //   body: formData,
  // });

  // if (!response.ok) {
  //   throw new Error('Upload failed');
  // }

  // const result = await response.json();
  // return result.url;

  return 'success';
}

async function uploadAndReplaceImage(
  file: File,
  tempUrl: string,
  editor: Editor
) {
  try {
    const serverUrl = await uploadImageToServer(file);

    // Replace the temporary URL with server URL
    const currentContent = editor.getHTML();
    const updatedContent = currentContent.replace(tempUrl, serverUrl);
    editor.commands.setContent(updatedContent);

    // Clean up blob URL
    URL.revokeObjectURL(tempUrl);

    console.log('✅ Pasted image uploaded successfully');
  } catch (error) {
    console.error('❌ Failed to upload pasted image:', error);
  }
}
