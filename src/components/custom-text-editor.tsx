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

      ...field
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

      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node | null;
      }

      const found = new Set<string>();

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
        node = node.parentNode as Node | null;
      }

      if (isTypingModeRef.current) {
        typingStyles.forEach((style) => found.add(style));
      }

      setActiveStyles(found);
    }, [typingStyles]);

    useEffect(() => {
      if (editorRef.current && !content) {
        editorRef.current.innerHTML =
          '<p>Type your text here and select words to format them...</p>';
        updateContent();
      }
    }, []);

    useEffect(() => {
      const handler = () => {
        setTimeout(detectActiveStyles, 10);
      };

      document.addEventListener('selectionchange', handler);
      return () => document.removeEventListener('selectionchange', handler);
    }, [detectActiveStyles]);

    const updateContent = useCallback(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;

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

            const newElement = document.createElement(newTag);
            newElement.innerHTML = targetElement.innerHTML;

            targetElement.parentNode?.replaceChild(newElement, targetElement);

            const newRange = document.createRange();
            newRange.selectNodeContents(newElement);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
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
        if (['h1', 'h2'].includes(tag)) {
          toggleBlockStyle(tag);
        } else {
          toggleInlineStyle(tag);
        }
      },
      [toggleBlockStyle, toggleInlineStyle]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
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

        Array.from(files).forEach((file, index) => {
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
            };

            reader.onerror = () => {
              console.error('Error reading file:', file.name);
            };

            reader.readAsDataURL(file);
          } else {
            console.warn('Unsupported file type:', file.type);
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
