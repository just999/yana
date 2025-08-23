// import React, { useRef, useState } from 'react';

// import {
//   AlignCenter,
//   AlignLeft,
//   Bold,
//   Image,
//   Italic,
//   List,
//   Type,
//   Underline,
// } from 'lucide-react';

// const MAX_IMAGES = 5;

// const RichTextEditor = () => {
//   interface Errors {
//     content?: string;
//   }

//   const [content, setContent] = useState('');
//   const [errors, setErrors] = useState<Errors>({});
//   const [imageCount, setImageCount] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const editorRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Form validation
//   const validateForm = () => {
//     const newErrors: Errors = {};

//     // Remove HTML tags for validation
//     const textContent = content.replace(/<[^>]*>/g, '').trim();

//     if (!textContent) {
//       newErrors.content = 'Content is required';
//     } else if (textContent.length < 10) {
//       newErrors.content = 'Content must be at least 10 characters long';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = () => {
//     if (validateForm()) {

//       alert('Form submitted successfully! Check console for data.');
//     }
//   };

//   const applyInlineStyle = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     const content = range.extractContents();

//     const wrapper = document.createElement(tag);
//     wrapper.appendChild(content);
//     range.insertNode(wrapper);

//     // Reselect to place cursor correctly
//     range.setStartAfter(wrapper);
//     selection.removeAllRanges();
//     selection.addRange(range);

//     updateContent();
//   };

//   const applyBlockStyle = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     const parent = selection.anchorNode?.parentElement;
//     if (!parent) return;

//     const newBlock = document.createElement(tag);
//     newBlock.innerHTML = parent.innerHTML;

//     parent.replaceWith(newBlock);
//     updateContent();
//   };

//   // Execute formatting commands
//   const execCommand = (command: string, value: unknown = null) => {
//     document.execCommand(command, false, value as string | undefined);
//     updateContent();
//   };

//   // Update content and count images
//   const updateContent = () => {
//     if (editorRef.current) {
//       const newContent = editorRef.current.innerHTML;
//       setContent(newContent);

//       // Count images in content
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = newContent;
//       const images = tempDiv.querySelectorAll('img');
//       setImageCount(images.length);

//       // Clear errors when user starts typing
//       if (errors.content) {
//         setErrors({});
//       }
//     }
//   };

//   // Handle image insertion
//   const handleImageInsert = () => {
//     if (imageCount >= MAX_IMAGES) {
//       alert(`Maximum ${MAX_IMAGES} images allowed`);
//       return;
//     }
//     fileInputRef.current?.click();
//   };

//   // Process selected image files (multiple)
//   const handleImageFile = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const files = Array.from(event.target.files || []);
//     if (files.length === 0) return;

//     // Check if adding these images would exceed the limit
//     if (imageCount + files.length > MAX_IMAGES) {
//       alert(
//         `You can only upload ${MAX_IMAGES - imageCount} more image(s). Maximum ${MAX_IMAGES} images allowed.`
//       );
//       return;
//     }

//     setIsUploading(true);

//     try {
//       // Process each file
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i] as File;

//         // Validate file
//         if (file.size > 5 * 1024 * 1024) {
//           alert(
//             `Image "${file.name}" is too large. Size should be less than 5MB`
//           );
//           continue;
//         }

//         if (!file.type.startsWith('image/')) {
//           alert(`"${file.name}" is not a valid image file`);
//           continue;
//         }

//         // Convert to base64 and insert
//         await new Promise((resolve) => {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             const imageUrl = e.target?.result;

//             // Focus editor and insert image
//             editorRef.current?.focus();

//             // Create image container with controls
//             const imageContainer = document.createElement('div');
//             imageContainer.style.position = 'relative';
//             imageContainer.style.display = 'inline-block';
//             imageContainer.style.margin = '10px 5px';
//             imageContainer.contentEditable = 'false';

//             // Create image element
//             const img = document.createElement('img');
//             img.src = typeof imageUrl === 'string' ? imageUrl : '';
//             img.style.maxWidth = '300px';
//             img.style.height = 'auto';
//             img.style.border = '2px solid #e5e7eb';
//             img.style.borderRadius = '8px';
//             img.alt = file.name;
//             img.title = file.name;

//             // Create delete button
//             const deleteBtn = document.createElement('button');
//             deleteBtn.innerHTML = '×';
//             deleteBtn.style.position = 'absolute';
//             deleteBtn.style.top = '-8px';
//             deleteBtn.style.right = '-8px';
//             deleteBtn.style.width = '24px';
//             deleteBtn.style.height = '24px';
//             deleteBtn.style.borderRadius = '50%';
//             deleteBtn.style.backgroundColor = '#ef4444';
//             deleteBtn.style.color = 'white';
//             deleteBtn.style.border = 'none';
//             deleteBtn.style.fontSize = '16px';
//             deleteBtn.style.cursor = 'pointer';
//             deleteBtn.style.display = 'flex';
//             deleteBtn.style.alignItems = 'center';
//             deleteBtn.style.justifyContent = 'center';
//             deleteBtn.title = 'Remove image';

//             // Delete functionality
//             deleteBtn.onclick = (e) => {
//               e.preventDefault();
//               imageContainer.remove();
//               updateContent();
//             };

//             // Show delete button on hover
//             imageContainer.onmouseenter = () => {
//               deleteBtn.style.display = 'flex';
//             };
//             imageContainer.onmouseleave = () => {
//               deleteBtn.style.display = 'none';
//             };
//             deleteBtn.style.display = 'none';

//             imageContainer.appendChild(img);
//             imageContainer.appendChild(deleteBtn);

//             // Insert image container at cursor position
//             const selection = window.getSelection();
//             if (selection && selection.rangeCount > 0) {
//               const range = selection.getRangeAt(0);
//               range.deleteContents();
//               range.insertNode(imageContainer);

//               // Add a space after the image for easier text editing
//               const space = document.createTextNode(' ');
//               range.setStartAfter(imageContainer);
//               range.insertNode(space);
//               range.setStartAfter(space);
//               range.setEndAfter(space);
//               selection.removeAllRanges();
//               selection.addRange(range);
//             } else {
//               // If no selection, append to end
//               editorRef.current?.appendChild(imageContainer);
//               editorRef.current?.appendChild(document.createTextNode(' '));
//             }

//             resolve(undefined);
//           };

//           reader.readAsDataURL(file);
//         });
//       }

//       updateContent();
//     } catch (error) {
//       console.error('Error processing images:', error);
//       alert('Some images failed to upload. Please try again.');
//     } finally {
//       setIsUploading(false);
//       // Clear file input
//       event.target.value = '';
//     }
//   };

//   // Clear content
//   const clearContent = () => {
//     setContent('');
//     setImageCount(0);
//     if (editorRef.current) {
//       editorRef.current.innerHTML = '';
//     }
//     setErrors({});
//   };

//   // Toolbar button component
//   type ToolbarButtonProps = {
//     onClick: React.MouseEventHandler<HTMLButtonElement>;
//     icon: React.ComponentType<{ size?: number }>;
//     title: string;
//     isActive: boolean;
//   };

//   const ToolbarButton: React.FC<ToolbarButtonProps> = ({
//     onClick,
//     icon: Icon,
//     title,
//     isActive,
//   }) => (
//     <button
//       onClick={onClick}
//       onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
//       className={`rounded p-2 transition-colors hover:bg-gray-100 ${
//         isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
//       }`}
//       title={title}
//       type='button'
//     >
//       <Icon size={16} />
//     </button>
//   );

//   return (
//     <div className='mx-auto max-w-4xl bg-white p-6'>
//       <h1 className='mb-6 text-2xl font-bold'>
//         Custom Rich Text Editor with Image Support
//       </h1>

//       <div className='space-y-6'>
//         <div>
//           <label className='mb-2 block text-sm font-medium text-gray-700'>
//             Content Editor
//           </label>

//           {/* Toolbar */}
//           <div className='flex flex-wrap gap-1 rounded-t-md border border-gray-300 bg-gray-50 p-2'>
//             <ToolbarButton
//               onClick={() => applyInlineStyle('strong')}
//               // onClick={() => execCommand('bold')}
//               icon={Bold}
//               title='Bold'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyInlineStyle('em')}
//               // onClick={() => execCommand('italic')}
//               icon={Italic}
//               title='Italic'
//               isActive={false}
//             />
//             <ToolbarButton
//               // onClick={() => execCommand('underline')}
//               onClick={() => applyInlineStyle('u')}
//               icon={Underline}
//               title='Underline'
//               isActive={false}
//             />

//             <div className='mx-1 h-6 w-px bg-gray-300'></div>

//             <ToolbarButton
//               onClick={() => applyBlockStyle('h1')}
//               icon={Type}
//               title='Heading 1'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('h2')}
//               icon={Type}
//               title='Heading 2'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('h3')}
//               icon={Type}
//               title='Heading 3'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('h4')}
//               icon={Type}
//               title='Heading 4'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('h5')}
//               icon={Type}
//               title='Heading 5'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('h6')}
//               icon={Type}
//               title='Heading 6'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => applyBlockStyle('p')}
//               icon={Type}
//               title='Paragraph'
//               isActive={false}
//             />

//             <div className='mx-1 h-6 w-px bg-gray-300'></div>

//             <ToolbarButton
//               onClick={() => execCommand('justifyLeft')}
//               icon={AlignLeft}
//               title='Align Left'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => execCommand('justifyCenter')}
//               icon={AlignCenter}
//               title='Align Center'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => execCommand('insertUnorderedList')}
//               icon={List}
//               title='Bullet List'
//               isActive={false}
//             />

//             <div className='mx-1 h-6 w-px bg-gray-300'></div>

//             <ToolbarButton
//               onClick={handleImageInsert}
//               icon={Image}
//               title={`Insert Images (${imageCount}/${MAX_IMAGES})`}
//               isActive={isUploading}
//             />
//           </div>

//           {/* Editor */}
//           <div
//             ref={editorRef}
//             contentEditable={true}
//             onInput={updateContent}
//             onBlur={updateContent}
//             className={`min-h-64 rounded-b-md border-x border-b border-gray-300 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
//               errors.content ? 'border-red-500' : ''
//             }`}
//             style={{
//               lineHeight: '1.6',
//               fontSize: '14px',
//             }}
//           />

//           {/* Image upload status */}
//           {imageCount > 0 && (
//             <div className='mt-2 text-sm text-gray-600'>
//               Images: {imageCount}/{MAX_IMAGES} uploaded
//               {imageCount >= MAX_IMAGES && (
//                 <span className='ml-2 text-red-500'>Maximum reached</span>
//               )}
//             </div>
//           )}

//           {isUploading && (
//             <div className='mt-1 text-sm text-blue-600'>
//               Uploading images...
//             </div>
//           )}

//           {/* Hidden file input for images */}
//           <input
//             ref={fileInputRef}
//             type='file'
//             accept='image/*'
//             multiple
//             onChange={handleImageFile}
//             className='hidden'
//             disabled={imageCount >= MAX_IMAGES || isUploading}
//           />

//           {errors.content && (
//             <p className='mt-1 text-sm text-red-500'>{errors.content}</p>
//           )}
//         </div>

//         <div className='flex gap-4'>
//           <button
//             onClick={handleSubmit}
//             className='rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'
//           >
//             Submit Form
//           </button>

//           <button
//             onClick={clearContent}
//             className='rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700'
//           >
//             Clear Content
//           </button>
//         </div>
//       </div>

//       {/* Live Preview */}
//       <div className='mt-8 border-t pt-6'>
//         <h2 className='mb-4 text-lg font-semibold'>Live Preview:</h2>
//         <div
//           className='min-h-32 rounded-md border bg-gray-50 p-4'
//           dangerouslySetInnerHTML={{
//             __html: content || '<p class="text-gray-500">No content yet...</p>',
//           }}
//         />
//       </div>

//       {/* Raw HTML Output */}
//       <div className='mt-6'>
//         <h3 className='text-md mb-2 font-semibold'>Raw HTML Output:</h3>
//         <pre className='overflow-x-auto rounded bg-gray-100 p-3 text-xs'>
//           {content || 'No content yet...'}
//         </pre>
//       </div>

//       {/* Instructions */}
//       <div className='mt-8 rounded-md bg-blue-50 p-4'>
//         <h3 className='mb-2 font-semibold text-blue-800'>Enhanced Features:</h3>
//         <ul className='space-y-1 text-sm text-blue-700'>
//           <li>
//             • <strong>Multiple image support:</strong> Upload up to {MAX_IMAGES}{' '}
//             images at once
//           </li>
//           <li>
//             • <strong>Image management:</strong> Hover over images to see delete
//             button
//           </li>
//           <li>
//             • <strong>Smart validation:</strong> File size, type, and count
//             limits
//           </li>
//           <li>
//             • <strong>Visual feedback:</strong> Image counter and upload status
//           </li>
//           <li>
//             • <strong>Responsive images:</strong> Auto-sized with hover controls
//           </li>
//           <li>• Form validation without external libraries</li>
//           <li>
//             • Toolbar with formatting options (bold, italic, headings, etc.)
//           </li>
//           <li>• Live preview of formatted content with images</li>
//           <li>• Raw HTML output for debugging</li>
//           <li>• Built with vanilla React and Tailwind CSS</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default RichTextEditor;

// RichTextEditor.tsx (Refactored - No execCommand)

// 'use client';

// import React, { useEffect, useRef, useState } from 'react';

// import { cn } from '@/lib/utils';
// import {
//   AlignCenter,
//   AlignLeft,
//   Bold,
//   Image,
//   Italic,
//   List,
//   Type,
//   Underline,
// } from 'lucide-react';

// import { InputCustom } from './ui';

// const MAX_IMAGES = 5;

// const RichTextEditor = () => {
//   interface Errors {
//     content?: string;
//   }

//   const [content, setContent] = useState('');
//   const [errors, setErrors] = useState<Errors>({});
//   const [imageCount, setImageCount] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const editorRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [activeStyles, setActiveStyles] = useState<string[]>([]);
//   const [formatState, setFormatState] = useState<{ [tag: string]: boolean }>(
//     {}
//   );

//   const validateForm = () => {
//     const newErrors: Errors = {};
//     const textContent = content.replace(/<[^>]*>/g, '').trim();
//     if (!textContent) newErrors.content = 'Content is required';
//     else if (textContent.length < 10)
//       newErrors.content = 'Content must be at least 10 characters';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   useEffect(() => {
//     const handleSelectionChange = () => {
//       detectActiveStyles();
//     };

//     document.addEventListener('selectionchange', handleSelectionChange);
//     return () => {
//       document.removeEventListener('selectionchange', handleSelectionChange);
//     };
//   }, []);

//   useEffect(() => {
//     console.log('Active styles:', activeStyles);
//   }, [activeStyles]);

//   const handleSubmit = () => {
//     if (validateForm()) {
//       console.log('Form Data:', { content });
//       alert('Form submitted!');
//     }
//   };

//   const updateContent = () => {
//     if (editorRef.current) {
//       const newContent = editorRef.current.innerHTML;
//       setContent(newContent);
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = newContent;
//       const images = tempDiv.querySelectorAll('img');
//       setImageCount(images.length);
//       if (errors.content) setErrors({});
//     }
//   };

//   const toggleInlineStyle = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     const range = selection.getRangeAt(0);
//     const selectedText = range.toString();

//     const parent = selection.anchorNode?.parentElement;
//     const isActive = parent?.closest(tag) !== null;

//     if (!selectedText) {
//       // No selection → just toggle the formatState
//       setFormatState((prev) => ({
//         ...prev,
//         [tag]: !prev[tag],
//       }));
//       return;
//     }

//     if (isActive) {
//       const wrapper = parent?.closest(tag);
//       if (wrapper) {
//         const unwrapped = document.createTextNode(wrapper.textContent || '');
//         wrapper.replaceWith(unwrapped);
//         range.selectNode(unwrapped);
//         range.collapse(false);
//       }
//     } else {
//       const wrapper = document.createElement(tag);
//       wrapper.appendChild(range.extractContents());
//       range.insertNode(wrapper);
//       range.setStartAfter(wrapper);
//       range.collapse(true);
//     }

//     selection.removeAllRanges();
//     selection.addRange(range);
//     updateContent();
//     detectActiveStyles();
//   };

//   const applyInlineStyle = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;
//     const range = selection.getRangeAt(0);
//     const content = range.extractContents();
//     const wrapper = document.createElement(tag);
//     wrapper.appendChild(content);
//     range.insertNode(wrapper);
//     range.setStartAfter(wrapper);
//     selection.removeAllRanges();
//     selection.addRange(range);
//     updateContent();
//   };

//   const applyBlockStyle = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;
//     const range = selection.getRangeAt(0);
//     const parent = selection.anchorNode?.parentElement;
//     if (!parent) return;
//     const newBlock = document.createElement(tag);
//     newBlock.innerHTML = parent.innerHTML;
//     parent.replaceWith(newBlock);
//     updateContent();
//   };

//   const wrapBlockWith = (tag: keyof HTMLElementTagNameMap) => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;
//     const range = selection.getRangeAt(0);
//     const wrapper = document.createElement(tag);
//     wrapper.appendChild(range.extractContents());
//     range.insertNode(wrapper);
//     range.setStartAfter(wrapper);
//     range.setEndAfter(wrapper);
//     selection.removeAllRanges();
//     selection.addRange(range);
//     updateContent();
//   };

//   const handleCommand = (command: string) => {
//     const commands: Record<string, () => void> = {
//       bold: () => applyInlineStyle('strong'),
//       italic: () => applyInlineStyle('em'),
//       underline: () => applyInlineStyle('u'),
//       h1: () => applyBlockStyle('h1'),
//       h2: () => applyBlockStyle('h2'),
//       h3: () => applyBlockStyle('h3'),
//       h4: () => applyBlockStyle('h4'),
//       h5: () => applyBlockStyle('h5'),
//       h6: () => applyBlockStyle('h6'),
//       p: () => applyBlockStyle('p'),
//       justifyLeft: () =>
//         editorRef.current && (editorRef.current.style.textAlign = 'left'),
//       justifyCenter: () =>
//         editorRef.current && (editorRef.current.style.textAlign = 'center'),
//       list: () => wrapBlockWith('ul'),
//     };
//     commands[command]?.();
//   };

//   const handleImageInsert = () => {
//     if (imageCount >= MAX_IMAGES) {
//       alert(`Maximum ${MAX_IMAGES} images allowed`);
//       return;
//     }
//     fileInputRef.current?.click();
//   };

//   const handleImageFile = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const files = Array.from(event.target.files || []);
//     if (files.length === 0) return;
//     if (imageCount + files.length > MAX_IMAGES) {
//       alert(`Only ${MAX_IMAGES - imageCount} more image(s) allowed.`);
//       return;
//     }
//     setIsUploading(true);

//     try {
//       for (const file of files) {
//         if (file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/'))
//           continue;
//         await new Promise((resolve) => {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             const imageUrl = e.target?.result;
//             editorRef.current?.focus();
//             const imageContainer = document.createElement('div');
//             imageContainer.contentEditable = 'false';
//             imageContainer.style.position = 'relative';
//             imageContainer.style.display = 'inline-block';
//             imageContainer.style.margin = '10px 5px';

//             const img = document.createElement('img');
//             img.src = String(imageUrl);
//             img.style.maxWidth = '300px';
//             img.style.border = '2px solid #e5e7eb';
//             img.style.borderRadius = '8px';
//             img.alt = file.name;
//             imageContainer.appendChild(img);

//             const deleteBtn = document.createElement('button');
//             deleteBtn.innerHTML = '×';
//             deleteBtn.style.position = 'absolute';
//             deleteBtn.style.top = '-8px';
//             deleteBtn.style.right = '-8px';
//             deleteBtn.onclick = () => {
//               imageContainer.remove();
//               updateContent();
//             };
//             deleteBtn.style.display = 'none';
//             imageContainer.onmouseenter = () =>
//               (deleteBtn.style.display = 'flex');
//             imageContainer.onmouseleave = () =>
//               (deleteBtn.style.display = 'none');
//             imageContainer.appendChild(deleteBtn);

//             const selection = window.getSelection();
//             if (selection && selection.rangeCount > 0) {
//               const range = selection.getRangeAt(0);
//               range.deleteContents();
//               range.insertNode(imageContainer);
//               range.collapse(false);
//               selection.removeAllRanges();
//               selection.addRange(range);
//             } else {
//               editorRef.current?.appendChild(imageContainer);
//             }
//             resolve(undefined);
//           };
//           reader.readAsDataURL(file);
//         });
//       }
//       updateContent();
//     } finally {
//       setIsUploading(false);
//       event.target.value = '';
//     }
//   };

//   const clearContent = () => {
//     setContent('');
//     setImageCount(0);
//     editorRef.current && (editorRef.current.innerHTML = '');
//     setErrors({});
//   };

//   type ToolbarButtonProps = {
//     onClick: React.MouseEventHandler<HTMLButtonElement>;
//     icon: React.ComponentType<{ size?: number; className?: string }>;
//     title: string;
//     isActive: boolean;
//   };

//   const ToolbarButton: React.FC<ToolbarButtonProps> = ({
//     onClick,
//     icon: Icon,
//     title,
//     isActive,
//   }) => (
//     <button
//       onClick={onClick}
//       onMouseDown={(e) => e.preventDefault()}
//       className={`cursor-pointer rounded p-2 hover:bg-gray-100 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
//       title={title}
//       type='button'
//     >
//       <div>
//         {isActive ? 'active' : 'inActive'}
//         <Icon
//           size={16}
//           className={cn(isActive ? 'text-sky-600' : 'text-muted')}
//         />
//       </div>
//     </button>
//   );

//   const isStyleActive = (tag: string): boolean => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return false;

//     let node = selection.focusNode as HTMLElement | null;
//     if (!node) return false;

//     if (node.nodeType === Node.TEXT_NODE) {
//       node = node.parentElement;
//     }

//     const aliases = tagAliases[tag] || [tag];

//     while (node && node !== editorRef.current) {
//       const nodeName = node.nodeName.toLowerCase();
//       if (aliases.includes(nodeName)) {
//         return true;
//       }
//       node = node.parentElement;
//     }

//     return false;
//   };

//   // const detectActiveStyles = () => {
//   //   const styles = ['strong', 'em', 'u', 'h1', 'h2', 'p'];
//   //   const active = styles.filter(isStyleActive);
//   //   setActiveStyles(active);
//   // };

//   const tagAliases: Record<string, string[]> = {
//     strong: ['strong', 'b'],
//     em: ['em', 'i'],
//     u: ['u'],
//     h1: ['h1'],
//     h2: ['h2'],
//     p: ['p'],
//   };

//   const detectActiveStyles = () => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     let node = selection.focusNode;
//     if (!node) return;

//     // If inside text node, use parent element
//     if (node.nodeType === Node.TEXT_NODE) {
//       node = node.parentNode;
//     }

//     const foundTags: Set<string> = new Set();

//     while (node && node instanceof HTMLElement && node !== editorRef.current) {
//       const tag = node.nodeName.toLowerCase();

//       for (const [styleKey, aliases] of Object.entries(tagAliases)) {
//         if (aliases.includes(tag)) {
//           foundTags.add(styleKey);
//         }
//       }

//       node = node.parentNode;
//     }

//     const active = Array.from(foundTags);
//     console.log('🎯 Active styles:', active);
//     setActiveStyles(active);
//   };

//   const applyPendingFormats = () => {
//     if (!editorRef.current) return;

//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0 || !selection.focusNode)
//       return;

//     const range = selection.getRangeAt(0);

//     // Don't apply formatting if user selected a range
//     if (!range.collapsed) return;

//     const activeTags = Object.entries(formatState)
//       .filter(([_, active]) => active)
//       .map(([tag]) => tag);

//     if (activeTags.length === 0) return;

//     const focusNode = selection.focusNode;
//     if (focusNode.nodeType === Node.TEXT_NODE) {
//       const textNode = focusNode as Text;
//       const parent = textNode.parentElement;

//       if (parent && parent === editorRef.current) {
//         const typedChar = textNode.nodeValue?.slice(-1) || '';
//         const charNode = document.createTextNode(typedChar);

//         // Remove last char from textNode
//         textNode.nodeValue = textNode.nodeValue?.slice(0, -1) || '';

//         // Wrap it in nested tags
//         const wrapper = activeTags.reduceRight((acc, tag) => {
//           const el = document.createElement(tag);
//           el.appendChild(acc);
//           return el;
//         }, charNode as Node);

//         // Insert wrapped char after textNode
//         textNode.after(wrapper);

//         // Restore cursor
//         const newRange = document.createRange();
//         newRange.setStartAfter(wrapper);
//         newRange.collapse(true);
//         selection.removeAllRanges();
//         selection.addRange(newRange);
//       }
//     }
//   };

//   return (
//     <div className='mx-auto max-w-4xl bg-white p-6'>
//       <h1 className='mb-6 text-2xl font-bold'>Rich Text Editor (Modern)</h1>

//       <div className='space-y-4'>
//         <div className='rounded border shadow-sm'>
//           <div className='flex gap-1 border-b bg-gray-50 p-2'>
//             <ToolbarButton
//               onClick={() => toggleInlineStyle('strong')}
//               icon={Bold}
//               title='Bold'
//               isActive={
//                 activeStyles.includes('strong') ||
//                 formatState['strong'] === true
//               }
//             />
//             <ToolbarButton
//               onClick={() => toggleInlineStyle('em')}
//               icon={Italic}
//               title='Italic'
//               isActive={
//                 activeStyles.includes('em') || formatState['em'] === true
//               }
//             />
//             <ToolbarButton
//               onClick={() => toggleInlineStyle('u')}
//               icon={Underline}
//               title='Underline'
//               isActive={activeStyles.includes('u') || formatState['u'] === true}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h1')}
//               icon={Type}
//               title='H1'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h2')}
//               icon={Type}
//               title='H2'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h3')}
//               icon={Type}
//               title='H3'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h4')}
//               icon={Type}
//               title='H4'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h5')}
//               icon={Type}
//               title='H5'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('h6')}
//               icon={Type}
//               title='H6'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('p')}
//               icon={Type}
//               title='Paragraph'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('justifyLeft')}
//               icon={AlignLeft}
//               title='Left'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('justifyCenter')}
//               icon={AlignCenter}
//               title='Center'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={() => handleCommand('list')}
//               icon={List}
//               title='List'
//               isActive={false}
//             />
//             <ToolbarButton
//               onClick={handleImageInsert}
//               icon={Image}
//               title='Image'
//               isActive={isUploading}
//             />
//           </div>
//           <div
//             ref={editorRef}
//             contentEditable
//             suppressContentEditableWarning
//             onInput={() => {
//               applyPendingFormats();
//               updateContent();
//               detectActiveStyles();
//             }}
//             onMouseUp={detectActiveStyles}
//             onKeyUp={detectActiveStyles}
//             onFocus={detectActiveStyles}
//             onBlur={updateContent}
//             style={{
//               minHeight: 200,
//               border: '1px solid #ccc',
//               padding: '1rem',
//               color: 'darkblue',
//               background: '#f3f3f3',
//             }}
//           />
//         </div>

//         <InputCustom
//           type='file'
//           ref={fileInputRef}
//           accept='image/*'
//           multiple
//           onChange={handleImageFile}
//           className='hidden'
//         />

//         {errors.content && (
//           <p className='text-sm text-red-500'>{errors.content}</p>
//         )}

//         <div className='flex gap-4'>
//           <button
//             onClick={handleSubmit}
//             className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
//           >
//             Submit
//           </button>
//           <button
//             onClick={clearContent}
//             className='rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700'
//           >
//             Clear
//           </button>
//         </div>

//         <div className='mt-8'>
//           <h2 className='mb-2 text-lg font-semibold'>Preview:</h2>
//           <div
//             className='border p-4'
//             dangerouslySetInnerHTML={{
//               __html:
//                 content || '<p class="text-gray-500">No content yet...</p>',
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RichTextEditor;
'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useImageInsertion } from '@/hooks/use-image-insertion';
import { fileAtoms } from '@/lib/jotai/blog-atoms';
import { RichTextEditorProps, RichTextEditorRef } from '@/lib/types';
import { useAtom } from 'jotai';
import { Bold, Image, Italic, Type, Underline } from 'lucide-react';

const tagAliases: Record<string, string[]> = {
  strong: ['strong', 'b'],
  em: ['em', 'i'],
  u: ['u'],
  h1: ['h1'],
  h2: ['h2'],
  p: ['p'],
};

const ToolbarButton = ({
  title,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string;
  icon: React.ComponentType<{ size: number }>;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    type='button'
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`cursor-pointer rounded p-2 transition-colors duration-150 ${
      isActive
        ? 'bg-blue-500 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
    }`}
  >
    <Icon size={16} />
  </button>
);

interface Errors {
  content?: string;
}

const CustomTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      onBlur,
      placeholder = 'Type your text here and select words to format them...',
      error,
      name = '',
      className,
      rules,
      // onImageFilesChange,
      ...field
      // ...props
    },
    ref
  ) => {
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageCount, setImageCount] = useState(0);
    const [imageFiles, setImageFiles] = useAtom(fileAtoms);
    const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());
    const [typingStyles, setTypingStyles] = useState<Set<string>>(new Set());
    const isTypingModeRef = useRef(false);
    const savedSelectionRef = useRef<Range | null>(null);

    const detectActiveStyles = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      let node = selection.focusNode;
      if (!node) return;

      // If it's a text node, get its parent element
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node | null;
      }

      const found = new Set<string>();

      // Traverse up the DOM tree to find active formatting
      while (
        node &&
        node instanceof HTMLElement &&
        node !== editorRef.current
      ) {
        const tag = node.nodeName.toLowerCase();

        // Check if this tag matches any of our formatting options
        for (const [key, aliases] of Object.entries(tagAliases)) {
          if (aliases.includes(tag)) {
            found.add(key);
          }
        }
        node = node.parentNode as Node | null;
      }

      // If we're in typing mode, merge with typing styles
      if (isTypingModeRef.current) {
        typingStyles.forEach((style) => found.add(style));
      }

      setActiveStyles(found);
    }, [typingStyles]);

    useEffect(() => {
      // Set initial content only once when component mounts
      if (editorRef.current && !content) {
        editorRef.current.innerHTML =
          '<p>Type your text here and select words to format them...</p>';
        updateContent();
      }
    }, []);

    useEffect(() => {
      const handler = () => {
        // Small delay to ensure selection has been updated
        setTimeout(detectActiveStyles, 10);
      };

      document.addEventListener('selectionchange', handler);
      return () => document.removeEventListener('selectionchange', handler);
    }, [detectActiveStyles]);

    const updateContent = useCallback(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);

        // Count images
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        // tempDiv.className = 'editor-paragraph';
        // tempDiv.classList.add('editor-paragraph');
        const images = tempDiv.querySelectorAll('img');
        setImageCount(images.length);

        if (errors.content) setErrors({});
      }
    }, [errors.content]);

    const { updateImageUrl, pendingImages } = useImageInsertion(
      editorRef,
      updateContent
    );

    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }
    }, []);

    const restoreSelection = useCallback(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelectionRef.current);
        }
      }
    }, []);

    const expandSelectionToWord = useCallback((range: Range): Range => {
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      if (
        startContainer.nodeType === Node.TEXT_NODE &&
        endContainer.nodeType === Node.TEXT_NODE
      ) {
        const startText = startContainer.textContent || '';
        const endText = endContainer.textContent || '';

        let startOffset = range.startOffset;
        let endOffset = range.endOffset;

        // Expand backwards to start of word
        while (startOffset > 0 && /\w/.test(startText[startOffset - 1])) {
          startOffset--;
        }

        // Expand forwards to end of word
        while (endOffset < endText.length && /\w/.test(endText[endOffset])) {
          endOffset++;
        }

        const newRange = document.createRange();
        newRange.setStart(startContainer, startOffset);
        newRange.setEnd(endContainer, endOffset);

        return newRange;
      }

      return range;
    }, []);

    const findParentElement = (
      node: Node | null,
      tagName: string
    ): HTMLElement | null => {
      while (node && node !== editorRef.current) {
        if (
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === tagName.toLowerCase()
        ) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };

    const toggleInlineStyle = useCallback(
      (tagName: string) => {
        const selection = window.getSelection();
        if (!selection) return;

        const editor = editorRef.current;
        if (!editor) return;

        let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range) {
          editor.focus();
          return;
        }

        // If no text is selected, try to expand to the current word
        if (range.collapsed) {
          const expandedRange = expandSelectionToWord(range);
          if (!expandedRange.collapsed) {
            range = expandedRange;
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // Still no selection, enable typing mode
            const newTypingStyles = new Set(typingStyles);
            if (newTypingStyles.has(tagName)) {
              newTypingStyles.delete(tagName);
            } else {
              newTypingStyles.add(tagName);
            }
            setTypingStyles(newTypingStyles);
            isTypingModeRef.current = true;

            // Update active styles
            const newActiveStyles = new Set(activeStyles);
            if (newTypingStyles.has(tagName)) {
              newActiveStyles.add(tagName);
            } else {
              newActiveStyles.delete(tagName);
            }
            setActiveStyles(newActiveStyles);

            editor.focus();
            return;
          }
        }

        const selectedText = range.toString();
        if (!selectedText) return;

        // Check if the selection is already wrapped in this tag
        const startContainer = range.startContainer;
        const parentElement =
          startContainer.nodeType === Node.TEXT_NODE
            ? startContainer.parentElement
            : (startContainer as HTMLElement);

        const existingWrapper = findParentElement(parentElement, tagName);

        try {
          if (existingWrapper) {
            // Remove the formatting by unwrapping
            const fragment = document.createDocumentFragment();
            while (existingWrapper.firstChild) {
              fragment.appendChild(existingWrapper.firstChild);
            }
            existingWrapper.parentNode?.replaceChild(fragment, existingWrapper);
          } else {
            // Add the formatting by wrapping
            const wrapper = document.createElement(tagName);
            const contents = range.extractContents();
            wrapper.appendChild(contents);
            range.insertNode(wrapper);

            // Select the wrapped content
            range.selectNodeContents(wrapper);
          }

          // Restore selection
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (error) {
          console.error('Error toggling style:', error);
        }

        updateContent();
        setTimeout(detectActiveStyles, 50);
      },
      [
        updateContent,
        detectActiveStyles,
        expandSelectionToWord,
        typingStyles,
        activeStyles,
      ]
    );

    const toggleBlockStyle = useCallback(
      (tagName: string) => {
        const selection = window.getSelection();
        if (!selection) return;

        const editor = editorRef.current;
        if (!editor) return;

        let targetElement: HTMLElement | null = null;

        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.commonAncestorContainer;

          // Find the block element containing the selection
          while (node && node !== editor) {
            if (node instanceof HTMLElement) {
              const tag = node.tagName.toLowerCase();
              if (
                ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tag)
              ) {
                targetElement = node;
                break;
              }
            }
            node = (node.parentNode as Node) || null;
          }
        }

        try {
          if (targetElement) {
            const currentTag = targetElement.tagName.toLowerCase();
            const newTag = currentTag === tagName.toLowerCase() ? 'p' : tagName;

            // Create new element
            const newElement = document.createElement(newTag);
            newElement.innerHTML = targetElement.innerHTML;

            // Replace the old element
            targetElement.parentNode?.replaceChild(newElement, targetElement);

            // Restore selection to the new element
            const newRange = document.createRange();
            newRange.selectNodeContents(newElement);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            // No block element found, create one
            const newElement = document.createElement(tagName);
            newElement.textContent = 'New ' + tagName.toUpperCase();

            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.insertNode(newElement);
              range.selectNodeContents(newElement);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              editor.appendChild(newElement);
            }
          }
        } catch (error) {
          console.error('Error toggling block style:', error);
        }

        updateContent();
        setTimeout(detectActiveStyles, 50);
      },
      [updateContent, detectActiveStyles]
    );

    const toggleStyle = useCallback(
      (tag: string) => {
        // Block styles
        if (['h1', 'h2'].includes(tag)) {
          toggleBlockStyle(tag);
        } else {
          // Inline styles
          toggleInlineStyle(tag);
        }
      },
      [toggleBlockStyle, toggleInlineStyle]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              toggleStyle('strong');
              break;
            case 'i':
              e.preventDefault();
              toggleStyle('em');
              break;
            case 'u':
              e.preventDefault();
              toggleStyle('u');
              break;
            default:
              break;
          }
        }

        // Exit typing mode on certain keys
        if (
          ['Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
            e.key
          )
        ) {
          isTypingModeRef.current = false;
          setTypingStyles(new Set());
        }
      },
      [toggleStyle]
    );

    const handleEditorInput = useCallback(
      (e: React.FormEvent) => {
        const editor = editorRef.current;
        if (!editor) return;

        // If we're in typing mode, apply the styles to new content
        if (isTypingModeRef.current && typingStyles.size > 0) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let node = range.startContainer;

            // Find the text node that was just modified
            if (node.nodeType === Node.TEXT_NODE) {
              const textNode = node as Text;

              // Check if we need to wrap the text with our styles
              const neededStyles = Array.from(typingStyles).filter((style) => {
                return !findParentElement(textNode, style);
              });

              if (neededStyles.length > 0) {
                // Create nested wrapper elements
                let wrapper: Node = textNode;
                neededStyles.forEach((style) => {
                  const element = document.createElement(style);
                  wrapper.parentNode?.replaceChild(element, wrapper);
                  element.appendChild(wrapper);
                  wrapper = element;
                });

                // Restore cursor position
                const newRange = document.createRange();
                let textNodeInWrapper: ChildNode | null = null;
                if (wrapper instanceof Element) {
                  textNodeInWrapper = wrapper.childNodes[
                    wrapper.childNodes.length - 1
                  ] as ChildNode;
                } else if (wrapper instanceof Text) {
                  textNodeInWrapper = wrapper as ChildNode;
                }
                if (textNodeInWrapper) {
                  newRange.setStart(
                    textNodeInWrapper,
                    textNodeInWrapper.textContent?.length || 0
                  );
                  newRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                }
              }
            }
          }
        }

        updateContent();
        detectActiveStyles();
      },
      [updateContent, detectActiveStyles, typingStyles]
    );

    const handleEditorKeyUp = useCallback(() => {
      detectActiveStyles();
    }, [detectActiveStyles]);

    const handleEditorMouseUp = useCallback(() => {
      // Exit typing mode when clicking to move cursor
      isTypingModeRef.current = false;
      setTypingStyles(new Set());
      detectActiveStyles();
    }, [detectActiveStyles]);

    const handleEditorFocus = useCallback(() => {
      detectActiveStyles();
    }, [detectActiveStyles]);

    const handleImageUpload = useCallback(
      (files: FileList) => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        let range: Range;

        // Get or create a range for insertion
        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          // If no selection, insert at the end
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }

        Array.from(files).forEach((file, index) => {
          // Check if it's an image file (including SVG)
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const result = e.target?.result as string;

              //     // Create image element
              const img = document.createElement('img');
              img.src = result;
              img.alt = file.name;
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '10px 0';

              // For SVG files, we might want to set a max height
              if (file.type === 'image/svg+xml') {
                img.style.maxHeight = '300px';
              }

              // Insert the image
              try {
                // Create a new range for each image to avoid conflicts
                const insertRange = range.cloneRange();
                insertRange.collapse(false);

                // Insert image
                insertRange.insertNode(img);

                // Add a line break after the image for better UX
                const br = document.createElement('br');
                insertRange.collapse(false);
                insertRange.insertNode(br);

                // Move the range after the inserted content for next image
                range.setStartAfter(br);
                range.collapse(true);

                // Update content after each image is inserted
                updateContent();
              } catch (error) {
                console.error('Error inserting image:', error);
              }
            };

            reader.onerror = () => {
              console.error('Error reading file:', file.name);
            };

            reader.readAsDataURL(file);
          } else {
            console.warn('Unsupported file type:', file.type);
          }
          // if (file.type.startsWith('image/')) insertImage(file, updateContent);
        });

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [updateContent]
    );

    const handleImageButtonClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          handleImageUpload(files);
        }
      },
      [handleImageUpload]
    );

    // const toggleStyle = useCallback(
    //   (tag: string) => {
    //     // Block styles
    //     if (['h1', 'h2'].includes(tag)) {
    //       toggleBlockStyle(tag);
    //     } else {
    //       // Inline styles
    //       toggleInlineStyle(tag);
    //     }
    //   },
    //   [toggleBlockStyle, toggleInlineStyle]
    // );
    //   (e: React.KeyboardEvent) => {
    //     // Handle keyboard shortcuts
    //     if (e.ctrlKey || e.metaKey) {
    //       switch (e.key.toLowerCase()) {
    //         case 'b':
    //           e.preventDefault();
    //           toggleStyle('strong');
    //           break;
    //         case 'i':
    //           e.preventDefault();
    //           toggleStyle('em');
    //           break;
    //         case 'u':
    //           e.preventDefault();
    //           toggleStyle('u');
    //           break;
    //         default:
    //           break;
    //       }
    //     }

    //     // Exit typing mode on certain keys
    //     if (
    //       ['Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
    //         e.key
    //       )
    //     ) {
    //       isTypingModeRef.current = false;
    //       setTypingStyles(new Set());
    //     }
    //   },
    //   [toggleStyle]
    // );

    return (
      <div className='mx-auto max-w-2xl p-4'>
        <div className='mb-2 flex gap-1 rounded-t border bg-gray-50 p-2'>
          <ToolbarButton
            title='Bold (Ctrl+B)'
            icon={Bold}
            onClick={() => toggleStyle('strong')}
            isActive={activeStyles.has('strong')}
          />
          <ToolbarButton
            title='Italic (Ctrl+I)'
            icon={Italic}
            onClick={() => toggleStyle('em')}
            isActive={activeStyles.has('em')}
          />
          <ToolbarButton
            title='Underline (Ctrl+U)'
            icon={Underline}
            onClick={() => toggleStyle('u')}
            isActive={activeStyles.has('u')}
          />
          <div className='mx-1 w-px bg-gray-300' />
          <ToolbarButton
            title='Heading 1'
            icon={Type}
            onClick={() => toggleStyle('h1')}
            isActive={activeStyles.has('h1')}
          />
          <ToolbarButton
            title='Heading 2'
            icon={Type}
            onClick={() => toggleStyle('h2')}
            isActive={activeStyles.has('h2')}
          />
          <div className='mx-1 w-px bg-gray-300' />
          <ToolbarButton
            title='Insert Images'
            icon={Image}
            onClick={handleImageButtonClick}
            isActive={false}
          />
        </div>

        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        <div
          ref={editorRef}
          contentEditable
          className='max-h-[512px] overflow-auto rounded-b border border-t-0 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          onInput={handleEditorInput}
          onKeyUp={handleEditorKeyUp}
          onKeyDown={handleKeyDown}
          onMouseUp={handleEditorMouseUp}
          onFocus={handleEditorFocus}
          onMouseDown={saveSelection}
          suppressContentEditableWarning={true}
        />

        <div className='mt-4 text-sm text-gray-600'>
          <div>
            <strong>Active Styles:</strong>{' '}
            {activeStyles.size > 0
              ? Array.from(activeStyles).join(', ')
              : 'None'}
          </div>
          <div className='mt-2 rounded bg-blue-50 p-2 text-xs'>
            <strong>💡 Improved Usage:</strong>
            <ul className='mt-1 space-y-1'>
              <li>
                <strong>Smart Selection:</strong> Place cursor in a word and
                click a style button - it will format the whole word
              </li>
              <li>
                <strong>Manual Selection:</strong> Select any text and click
                style buttons to format it
              </li>
              <li>
                <strong>Typing Mode:</strong> Click style buttons with no
                selection to format new text as you type
              </li>
              <li>
                <strong>Insert Images:</strong> Click the image button to upload
                multiple images (supports JPG, PNG, GIF, SVG, WebP, etc.)
              </li>
              <li>
                <strong>Keyboard Shortcuts:</strong> Ctrl+B (bold), Ctrl+I
                (italic), Ctrl+U (underline)
              </li>
            </ul>
          </div>
          {imageCount > 0 && (
            <div className='mt-1'>
              <strong>Images:</strong> {imageCount}
            </div>
          )}
        </div>

        {content && (
          <div className='mt-4'>
            <details className='text-sm'>
              <summary className='cursor-pointer text-gray-600 hover:text-gray-800'>
                View HTML Output
              </summary>
              <pre className='mt-2 overflow-auto rounded bg-gray-200 p-2 text-xs text-wrap text-stone-700'>
                {content}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }
);

export default CustomTextEditor;
