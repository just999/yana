// 'use client';

// import React, { useEffect, useRef, useState } from 'react';

// const tagAliases: Record<string, string[]> = {
//   strong: ['strong', 'b'],
//   em: ['em', 'i'],
// };

// export default function TextEditor() {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const [activeStyles, setActiveStyles] = useState<string[]>([]);

//   const detectActiveStyles = () => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) return;

//     let node = selection.focusNode;
//     if (!node) return;

//     // If inside a text node, move to its parent
//     if (node.nodeType === Node.TEXT_NODE) {
//       node = node.parentNode;
//     }

//     const found = new Set<string>();

//     while (node && node instanceof HTMLElement && node !== editorRef.current) {
//       const tag = node.nodeName.toLowerCase();
//       for (const [key, aliases] of Object.entries(tagAliases)) {
//         if (aliases.includes(tag)) {
//           found.add(key);
//         }
//       }
//       node = node.parentNode;
//     }

//     const active = Array.from(found);
//     console.log('🎯 Active styles:', active);
//     setActiveStyles(active);
//   };

//   useEffect(() => {
//     const handleSelectionChange = () => detectActiveStyles();
//     document.addEventListener('selectionchange', handleSelectionChange);
//     return () => {
//       document.removeEventListener('selectionchange', handleSelectionChange);
//     };
//   }, []);

//   return (
//     <div className='p-4'>
//       <div className='mb-2'>
//         <strong>
//           <em>This is bold and italic.</em>
//         </strong>
//       </div>
//       <div
//         ref={editorRef}
//         contentEditable
//         suppressContentEditableWarning
//         className='min-h-32 border border-gray-300 p-2'
//         onInput={detectActiveStyles}
//       >
//         <strong>
//           <em>Try placing your cursor here and look at the console</em>
//         </strong>
//       </div>
//     </div>
//   );
// }

'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui';
import { blogDefaultValue } from '@/lib/constants';
import { blogAtom, imageAtoms, imageCountAtoms } from '@/lib/jotai/blog-atoms';
import { useAtom, useSetAtom } from 'jotai';
import {
  Bold,
  Heading1,
  Heading2,
  Image,
  Italic,
  Palette,
  Underline,
  X,
} from 'lucide-react';

const tagAliases: Record<string, string[]> = {
  strong: ['strong', 'b'],
  em: ['em', 'i'],
  u: ['u'],
  h1: ['h1'],
  h2: ['h2'],
  p: ['p'],
  span: ['span'], // For color styling
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

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  name?: string;
}

interface RichTextEditorRef {
  focus: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
}

const TextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      onBlur,
      placeholder = 'Type your text here and select words to format them...',
      error,
      name,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [imageCount, setImageCount] = useState(0);
    const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());
    const [typingStyles, setTypingStyles] = useState<Set<string>>(new Set());
    const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const isTypingModeRef = useRef(false);
    const savedSelectionRef = useRef<Range | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    // const [images, setImages] = useState<ImageData[]>([]);

    const [images, setImages] = useAtom(imageAtoms);
    const [imageCount, setImageCount] = useAtom(imageCountAtoms);
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      getContent: () => {
        return editorRef.current?.innerHTML || '';
      },
      setContent: (content: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          updateContent();
        }
      },
    }));

    const applyTextColor = useCallback((color: string) => {
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
          // No selection, set color for future typing
          setCurrentTextColor(color);
          return;
        }
      }

      const selectedText = range.toString();
      if (!selectedText) return;

      try {
        // Create a span element with the color style
        const span = document.createElement('span');
        span.style.color = color;

        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);

        // Select the colored content
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (error) {
        console.error('Error applying text color:', error);
      }

      setCurrentTextColor(color);
      updateContent();
      setTimeout(detectActiveStyles, 50);
    }, []);

    const detectActiveStyles = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      let node = selection.focusNode;
      if (!node) return;

      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node | null;
      }

      const found = new Set<string>();
      let detectedColor = '#000000';

      while (
        node &&
        node instanceof HTMLElement &&
        node !== editorRef.current
      ) {
        const tag = node.nodeName.toLowerCase();

        for (const [key, aliases] of Object.entries(tagAliases)) {
          if (aliases.includes(tag)) {
            found.add(key);
          }
        }

        if (['h1', 'h2'].includes(tag)) {
          found.add(tag);
        }

        if (node.style && node.style.color) {
          detectedColor = node.style.color;
          if (detectedColor.startsWith('rgb')) {
            const rgbMatch = detectedColor.match(
              /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
            );
            if (rgbMatch) {
              const r = parseInt(rgbMatch[1]);
              const g = parseInt(rgbMatch[2]);
              const b = parseInt(rgbMatch[3]);
              detectedColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            }
          }
        }

        node = node.parentNode as Node | null;
      }

      if (isTypingModeRef.current) {
        typingStyles.forEach((style) => found.add(style));
      }

      setActiveStyles(found);
      setCurrentTextColor(detectedColor);
    }, [typingStyles]);

    const updateContent = useCallback(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;

        // Count images
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        // tempDiv.className = 'editor-paragraph';
        // tempDiv.classList.add('editor-paragraph');
        const images = tempDiv.querySelectorAll('img');
        setImageCount(images.length);

        // Call onChange callback for React Hook Form
        if (onChange) {
          onChange(newContent);
        }
      }
    }, [onChange]);

    // Initialize editor content
    useEffect(() => {
      if (editorRef.current && !isInitialized) {
        const initialContent = value || `<p>${placeholder}</p>`;
        editorRef.current.innerHTML = initialContent;
        setIsInitialized(true);
      }
    }, [value, placeholder, isInitialized]);

    // Update editor when value prop changes (controlled component)
    useEffect(() => {
      if (
        editorRef.current &&
        isInitialized &&
        value !== editorRef.current.innerHTML
      ) {
        editorRef.current.innerHTML = value || `<p>${placeholder}</p>`;
      }
    }, [value, placeholder, isInitialized]);

    useEffect(() => {
      const handler = () => {
        setTimeout(detectActiveStyles, 10);
      };

      document.addEventListener('selectionchange', handler);
      return () => document.removeEventListener('selectionchange', handler);
    }, [detectActiveStyles]);

    useEffect(() => {
      // onImageFilesChange?.(imageFiles);
      setImages(images);
    }, [setImages]);

    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
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

        while (startOffset > 0 && /\w/.test(startText[startOffset - 1])) {
          startOffset--;
        }

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

        if (range.collapsed) {
          const expandedRange = expandSelectionToWord(range);
          if (!expandedRange.collapsed) {
            range = expandedRange;
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            const newTypingStyles = new Set(typingStyles);
            if (newTypingStyles.has(tagName)) {
              newTypingStyles.delete(tagName);
            } else {
              newTypingStyles.add(tagName);
            }
            setTypingStyles(newTypingStyles);
            isTypingModeRef.current = true;

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

        const startContainer = range.startContainer;
        const parentElement =
          startContainer.nodeType === Node.TEXT_NODE
            ? startContainer.parentElement
            : (startContainer as HTMLElement);

        const existingWrapper = findParentElement(parentElement, tagName);

        try {
          if (existingWrapper) {
            const fragment = document.createDocumentFragment();
            while (existingWrapper.firstChild) {
              fragment.appendChild(existingWrapper.firstChild);
            }
            existingWrapper.parentNode?.replaceChild(fragment, existingWrapper);
          } else {
            const wrapper = document.createElement(tagName);
            const contents = range.extractContents();
            wrapper.appendChild(contents);
            range.insertNode(wrapper);
            range.selectNodeContents(wrapper);
          }

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

          if (node.nodeType === Node.TEXT_NODE) {
            node = (node.parentNode as Node) || null;
          }

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

            const range = selection.getRangeAt(0);
            const startOffset = range.startOffset;
            const endOffset = range.endOffset;
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;

            const newElement = document.createElement(newTag);
            newElement.innerHTML = targetElement.innerHTML;

            targetElement.parentNode?.replaceChild(newElement, targetElement);

            try {
              const newRange = document.createRange();

              const walker = document.createTreeWalker(
                newElement,
                NodeFilter.SHOW_TEXT,
                null
              );

              let currentNode;
              let found = false;
              while ((currentNode = walker.nextNode())) {
                if (currentNode.textContent === startContainer.textContent) {
                  newRange.setStart(currentNode, startOffset);
                  if (startContainer === endContainer) {
                    newRange.setEnd(currentNode, endOffset);
                  } else {
                    newRange.setEnd(
                      currentNode,
                      currentNode.textContent?.length || 0
                    );
                  }
                  found = true;
                  break;
                }
              }

              if (!found) {
                newRange.selectNodeContents(newElement);
              }

              selection.removeAllRanges();
              selection.addRange(newRange);
            } catch (selectionError) {
              const newRange = document.createRange();
              newRange.setStart(newElement, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
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
        if (['h1', 'h2'].includes(tag)) {
          toggleBlockStyle(tag);
        } else {
          toggleInlineStyle(tag);
        }
      },
      [toggleBlockStyle, toggleInlineStyle]
    );

    const handleColorChange = useCallback(
      (color: string) => {
        applyTextColor(color);
        setShowColorPicker(false);
      },
      [applyTextColor]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
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
        if (isTypingModeRef.current && typingStyles.size > 0) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let node = range.startContainer;

            if (node.nodeType === Node.TEXT_NODE) {
              const textNode = node as Text;

              const neededStyles = Array.from(typingStyles).filter((style) => {
                return !findParentElement(textNode, style);
              });

              if (neededStyles.length > 0) {
                let wrapper: Node = textNode;
                neededStyles.forEach((style) => {
                  const element = document.createElement(style);
                  wrapper.parentNode?.replaceChild(element, wrapper);
                  element.appendChild(wrapper);
                  wrapper = element;
                });

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
      isTypingModeRef.current = false;
      setTypingStyles(new Set());
      detectActiveStyles();
    }, [detectActiveStyles]);

    const handleEditorFocus = useCallback(() => {
      detectActiveStyles();
    }, [detectActiveStyles]);

    const handleEditorBlur = useCallback(() => {
      if (onBlur) {
        onBlur();
      }
    }, [onBlur]);

    const handleImageUpload = useCallback(
      (files: FileList) => {
        const editor = editorRef.current;
        if (!editor) return;
        const selection = window.getSelection();
        let range: Range;

        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }

        Array.from(files).forEach((file) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const result = e.target?.result as string;
              const img = document.createElement('img');
              img.src = result;
              img.alt = file.name;
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.display = 'block';
              img.style.margin = '10px 0';

              // Add a unique data attribute to identify this image
              const imageId = (Date.now() + Math.random()).toString();
              img.setAttribute('data-image-id', imageId.toString());

              if (file.type === 'image/svg+xml') {
                img.style.maxHeight = '300px';
              }

              try {
                const insertRange = range.cloneRange();
                insertRange.collapse(false);

                insertRange.insertNode(img);

                const br = document.createElement('br');
                insertRange.collapse(false);
                insertRange.insertNode(br);

                range.setStartAfter(br);
                range.collapse(true);

                updateContent();
              } catch (error) {
                console.error('Error inserting image:', error);
              }

              // Store both the image data and the unique ID
              setImages((prev) => [...prev, { src: result, id: imageId }]);
            };

            reader.onerror = () => {
              console.error('Error reading file:', file.name);
            };

            reader.readAsDataURL(file);
          }
        });

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

    const removeImage = (index: number) => {
      const editor = editorRef.current;
      if (!editor) return;
      const imageToRemove = images[index];

      // Find and remove the image element from the contenteditable
      const imgElement = editor.querySelector(
        `img[data-image-id="${imageToRemove.id}"]`
      );
      if (imgElement) {
        // Also remove the associated br element if it exists
        const nextElement = imgElement.nextElementSibling;
        if (nextElement && nextElement.tagName === 'BR') {
          nextElement.remove();
        }
        imgElement.remove();

        // Update the content after removing the DOM element
        updateContent();
      }

      // Remove from state
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className='w-full'>
        <div className='mb-2 flex gap-0 rounded-t border bg-gray-50 p-2'>
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
            icon={Heading1}
            onClick={() => toggleStyle('h1')}
            isActive={activeStyles.has('h1')}
          />
          <ToolbarButton
            title='Heading 2'
            icon={Heading2}
            onClick={() => toggleStyle('h2')}
            isActive={activeStyles.has('h2')}
          />
          <div className='mx-1 w-px bg-gray-300' />

          <div className='relative'>
            <button
              type='button'
              title='Text Color'
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex cursor-pointer items-center gap-1 rounded p-2 transition-colors duration-150 ${
                showColorPicker
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              <Palette size={16} />
              <div
                className='h-3 w-3 rounded border border-gray-400'
                style={{ backgroundColor: currentTextColor }}
              />
            </button>

            {showColorPicker && (
              <div className='absolute top-full left-0 z-10 mt-1 rounded-lg border bg-white p-3 shadow-lg'>
                <div className='mb-2 grid grid-cols-6 gap-2'>
                  {[
                    '#000000',
                    '#FF0000',
                    '#00FF00',
                    '#0000FF',
                    '#FFFF00',
                    '#FF00FF',
                    '#00FFFF',
                    '#FFA500',
                    '#800080',
                    '#FFC0CB',
                    '#A52A2A',
                    '#808080',
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#96CEB4',
                    '#FFEAA7',
                    '#DDA0DD',
                    '#98D8C8',
                    '#F7DC6F',
                    '#BB8FCE',
                    '#85C1E9',
                    '#F8C471',
                    '#82E0AA',
                  ].map((color) => (
                    <button
                      key={color}
                      className='h-6 w-6 rounded border-2 border-gray-300 transition-colors hover:border-gray-500'
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type='color'
                  value={currentTextColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className='h-8 w-full rounded border'
                  title='Custom color'
                />
                <button
                  onClick={() => setShowColorPicker(false)}
                  className='mt-2 w-full text-xs text-gray-500 hover:text-gray-700'
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <div className='mx-1 w-px bg-gray-300' />
          <ToolbarButton
            title='Insert Images'
            icon={Image}
            onClick={handleImageButtonClick}
            isActive={false}
          />
        </div>

        <div className='mb-4 flex flex-wrap gap-2'>
          {images.map((img, index) => (
            <div
              key={typeof img === 'string' ? index : img.id}
              className='group relative'
            >
              <div className='group relative mt-4 mr-2 mb-2 inline-block min-h-20'>
                <img
                  src={typeof img === 'string' ? img : img.src}
                  alt={`Uploaded ${index}`}
                  className='h-auto w-20 object-cover'
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className='absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600'
                aria-label='Remove image'
              >
                <X size={16} className='stroke-2 text-white' />
              </button>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className='rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
        >
          Add Images
        </Button>

        <div
          ref={editorRef}
          contentEditable
          className={`min-h-32 rounded-b border border-t-0 p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            error ? 'border-red-500' : ''
          }`}
          onInput={handleEditorInput}
          onKeyUp={handleEditorKeyUp}
          onKeyDown={handleKeyDown}
          onMouseUp={handleEditorMouseUp}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          onMouseDown={saveSelection}
          suppressContentEditableWarning={true}
          data-name={name}
        />

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        <div className='mt-2 text-xs text-gray-500'>
          <div>
            <strong>Active Styles:</strong>{' '}
            {activeStyles.size > 0
              ? Array.from(activeStyles).join(', ')
              : 'None'}
          </div>
          {imageCount > 0 && (
            <div className='mt-1'>
              <strong>Images:</strong> {imageCount}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';

// Example usage with React Hook Form
const ExampleForm = () => {
  // This would be imported from react-hook-form in a real app

  const [formData, setFormData] = useAtom(blogAtom);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useAtom(imageAtoms);
  const setImageCount = useSetAtom(imageCountAtoms);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (
      !formData.content.trim() ||
      formData.content === '<p>Type your content here...</p>'
    ) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully! Check console for data.');
    }
  };

  return (
    <div className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Rich Text Editor with Form</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='title'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            Title
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Enter title...'
          />
          {errors.title && (
            <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='content'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            Content
          </label>
          <TextEditor
            name='content'
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            placeholder='Type your content here...'
            error={errors.content}
          />
        </div>

        <div className='flex gap-4'>
          <button
            type='submit'
            className='cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            Submit
          </button>

          <button
            type='button'
            onClick={() => {
              setFormData(blogDefaultValue);
              setImages([]);
              setImageCount(0);
              setErrors({});
            }}
            className='cursor-pointer rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none'
          >
            Reset
          </button>
        </div>
      </form>

      {formData.content && (
        <div className='mt-6'>
          <details className='text-sm'>
            <summary className='cursor-pointer font-medium text-gray-600 hover:text-gray-800'>
              View HTML Output
            </summary>
            <pre className='mt-2 overflow-x-auto rounded border bg-gray-100 p-3 text-xs'>
              {formData.content}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ExampleForm;
