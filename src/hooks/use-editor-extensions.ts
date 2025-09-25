import { useCallback, useEffect, useMemo, useRef } from 'react';

import { CustomImageResize } from '@/components/tiptap/custom-image-resize';
import { FontSizeExtension } from '@/components/tiptap/extensions/font-size';
import { LineHeightExtension } from '@/components/tiptap/extensions/line-height';
import { TableDeletionExtension } from '@/components/tiptap/extensions/table-deletion';
import { blogAtom } from '@/lib/jotai/blog-atoms';
import { useEditorStore } from '@/store/use-editor-store';
import type { User } from '@prisma/client';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { ListKit, TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Dropcursor } from '@tiptap/extensions';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import bash from 'highlight.js/lib/languages/bash';
import {
  default as javascript,
  default as js,
} from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import {
  default as ts,
  default as typescript,
} from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { useAtom } from 'jotai';
import { all, createLowlight } from 'lowlight';
import ImageResize from 'tiptap-extension-resize-image';

import css from 'highlight.js/lib/languages/css';

// Define the expected form data structure
interface FormData {
  content: string;
  // Add other fields if they exist
  authorId?: string;
  author?: User;
  title?: string;
  slug?: string;
  category: string;
  images?: string[];
  anonymous?: boolean;
  // etc.
}

// Props type for the hook
interface UseOptimizedEditorProps {
  value: string;
  setContent: (content: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setEditor: (editor: Editor | null) => void;
}

// const lowlight = createLowlight(all);

// lowlight.register('html', html);
// lowlight.register('css', css);
// lowlight.register('js', js);
// lowlight.register('ts', ts);
// lowlight.register('javascript', javascript);
// lowlight.register('typescript', typescript);
// lowlight.register('python', python);
// lowlight.register('html', html);
// lowlight.register('css', css);
// lowlight.register('json', json);
// lowlight.register('bash', bash);

// const LANGUAGES = [
//   { value: 'javascript', label: 'JavaScript' },
//   { value: 'typescript', label: 'TypeScript' },
//   { value: 'python', label: 'Python' },
//   { value: 'html', label: 'HTML' },
//   { value: 'css', label: 'CSS' },
//   { value: 'json', label: 'JSON' },
//   { value: 'bash', label: 'Bash' },
//   { value: 'text', label: 'Plain Text' },
// ];

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

// const createCodeBlockWithMarkupFix = (lowlight: any) => {
//   return CodeBlockLowlight.configure({
//     lowlight,
//     defaultLanguage: 'plaintext',
//     HTMLAttributes: {
//       class: 'hljs code-block-custom',
//       'data-language-indicator': 'true',
//     },
//   }).extend({
//     addAttributes() {
//       return {
//         ...this.parent?.(),
//         language: {
//           default: 'plaintext',
//           parseHTML: (element) => {
//             const lang = element.getAttribute('class') || 'plaintext';
//             return lang === 'language-markup' ? 'HTML' : 'plaintext';
//           },
//         },
//       };
//     },
//   });
// };

export const useEditorExtensions = () => {
  // Create lowlight instance with languages
  const lowlight = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const lowlightInstance = createLowlight(all);

    // Register additional languages
    lowlightInstance.register('html', html);
    lowlightInstance.register('css', css);
    lowlightInstance.register('js', js);
    lowlightInstance.register('javascript', js); // alias
    lowlightInstance.register('ts', ts);
    lowlightInstance.register('typescript', ts); // alias
    lowlightInstance.register('python', python);
    lowlightInstance.register('json', json);
    lowlightInstance.register('bash', bash);
    lowlightInstance.register('markdown', markdown);
    lowlightInstance.register('plaintext', plaintext);

    return lowlightInstance;
  }, []);

  const extensions = useMemo(
    () => [
      Dropcursor.configure({
        color: '#ff0000',
        width: 2,
        class: 'my-custom-class',
      }),
      TextStyleKit.configure({
        lineHeight: false,
        fontSize: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      StarterKit.configure({
        link: false,
        dropcursor: false,
        codeBlock: false,
        paragraph: false,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'paragraph-class',
        },
      }),
      LineHeightExtension,
      FontSizeExtension.configure({
        types: ['textStyle'],
        defaultSize: '14px', // Set explicit default
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'http',
        // protocols: ['http', 'https'],
      }),
      TaskList,
      ListKit.configure({
        bulletList: false,
        listItem: false,
        orderedList: false,
        taskList: false,
        taskItem: false,
        listKeymap: false,
      }),
      Highlight.configure({ multicolor: true }),
      TaskItem.configure({ nested: true }),

      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'table-class',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'table-cell',
        },
      }),

      TableDeletionExtension,
      ImageResize.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'image-resize-container relative inline-block',
        },
      }),

      CodeBlockLowlight.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: 'hljs code-block-custom',
              parseHTML: (element) => element.getAttribute('class'),
              renderHTML: (attributes) => {
                const language = attributes.language || 'plaintext';
                if (language === 'text') {
                  return { class: `hljs code-block-custom code-plaintext` };
                }
                return {
                  class: `hljs code-block-custom code-${language}`,
                };
              },
            },
          };
        },
      }).configure({
        lowlight,
        defaultLanguage: 'plaintext',
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: 'hljs code-block-custom ',
          'data-language-indicator': 'true',
          spellCheck: 'false',
        },
      }),
    ],
    [lowlight]
  );

  return { extensions, lowlight };
};

// Optimized editor configuration
export function useOptimizedEditor({
  value,
  setContent,
  setHasUnsavedChanges,
  // setEditor,
}: UseOptimizedEditorProps): Editor | null {
  const { setEditor } = useEditorStore();
  const { extensions } = useEditorExtensions();
  // const [formData, setFormData] = useAtom(blogAtom);
  // Debounced content update to prevent excessive re-renders
  const debouncedUpdateRef = useRef<NodeJS.Timeout>(null);

  const debouncedUpdate = useCallback(
    (editor: Editor) => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }

      debouncedUpdateRef.current = setTimeout(() => {
        const newContent = JSON.stringify(editor.getJSON());
        setContent(newContent);
        // setEditor(editor);
        // setFormData((prev) => ({
        //   ...prev,
        //   content: newContent,
        // }));
        setHasUnsavedChanges(true);
      }, 150); // 150ms debounce
    },
    [setContent, setHasUnsavedChanges]
  );

  const editorEventHandlers = useMemo(
    () => ({
      onCreate({ editor }: { editor: Editor }) {
        setEditor(editor);

        if (value) {
          requestAnimationFrame(() => {
            try {
              // Handle both JSON objects and JSON strings
              const contentToSet =
                typeof value === 'string' ? JSON.parse(value) : value;
              editor.commands.setContent(contentToSet);
            } catch (error) {
              console.error('Error parsing content:', error);
              // Fallback to treating it as HTML
              editor.commands.setContent(value);
            }
          });
        }
      },

      onUpdate({ editor }: { editor: Editor }) {
        debouncedUpdate(editor);
      },

      // Combine selection/transaction/focus/blur events to reduce setEditor calls
      onSelectionUpdate({ editor }: { editor: Editor }) {
        setEditor(editor);
      },

      onTransaction({ editor }: { editor: Editor }) {
        // Only update if necessary - avoid redundant calls
        setEditor(editor);
      },

      onFocus({ editor }: { editor: Editor }) {
        setEditor(editor);
      },

      onBlur({ editor }: { editor: Editor }) {
        setEditor(editor);
      },

      onContentError({ editor }: { editor: Editor }) {
        console.error('Content error in editor');
        setEditor(editor);
      },

      onDestroy() {
        setEditor(null);

        // Clear any pending debounced updates
        if (debouncedUpdateRef.current) {
          clearTimeout(debouncedUpdateRef.current);
          debouncedUpdateRef.current = null;
        }
      },
    }),
    [setEditor, debouncedUpdate, value]
  );

  // Memoize editor props for better performance
  const editorProps = useMemo(
    () => ({
      attributes: {
        class:
          'focus:outline-none print:border-0 dark:bg-accent/90 bg-white dark:text-gray-100 shadow-lg border-0 border-[#e8e8e8] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text',
      },

      // Optimize paste handling
      handlePaste: (view: any, event: ClipboardEvent) => {
        const items = Array.from(event.clipboardData?.items || []);
        const hasImages = items.some((item) => item.type.startsWith('image/'));

        if (hasImages) {
          // Let the image paste extension handle this
          return false;
        }

        // For non-image content, use default behavior
        return false;
      },

      // Optimize drag and drop
      handleDrop: (view: any, event: DragEvent) => {
        // Prevent default file drops if you have custom handling
        if (event.dataTransfer?.files?.length) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    }),
    []
  );

  const editor = useEditor(
    {
      autofocus: true,

      // TipTap v3: Control re-rendering behavior
      shouldRerenderOnTransaction: false,
      immediatelyRender: false,

      extensions,
      content: value || '',
      editorProps,

      ...editorEventHandlers,

      // onCreate({ editor }) {
      //   setEditor(editor);
      //   if (value) {
      //     requestAnimationFrame(() => {
      //       try {
      //         // Handle both JSON objects and JSON strings
      //         const contentToSet =
      //           typeof value === 'string' ? JSON.parse(value) : value;
      //         editor.commands.setContent(contentToSet);

      //         // setFormData((prev) => ({
      //         //   ...prev,
      //         //   content:
      //         //     typeof value === 'string' ? value : JSON.stringify(value),
      //         // }));
      //       } catch (error) {
      //         console.error('Error parsing content:', error);
      //         // Fallback to treating it as HTML
      //         editor.commands.setContent(value);
      //         // setFormData((prev) => ({
      //         //   ...prev,
      //         //   content: JSON.stringify(editor.getJSON()),
      //         // }));
      //       }
      //     });
      //   }
      // },

      // // Use debounced update instead of immediate update
      // onUpdate({ editor }) {
      //   debouncedUpdate(editor);
      // },
      // onSelectionUpdate({ editor }) {
      //   setEditor(editor);
      // },
      // onTransaction({ editor }) {
      //   setEditor(editor);
      // },
      // onFocus({ editor }) {
      //   setEditor(editor);
      // },
      // onBlur({ editor }) {
      //   setEditor(editor);
      // },
      // onContentError({ editor }) {
      //   setEditor(editor);
      // },
      // onDestroy() {
      //   setEditor(null);
      //   // setFormData((prev) => ({
      //   //   ...prev,
      //   //   content: '',
      //   // }));

      //   // Clear any pending debounced updates
      //   if (debouncedUpdateRef.current) {
      //     clearTimeout(debouncedUpdateRef.current);
      //   }
      // },

      // editorProps: {
      //   attributes: {
      //     class:
      //       'focus:outline-none print:border-0 dark:bg-accent/90 bg-white dark:text-gray-100 shadow-lg border-0 border-[#e8e8e8] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text',
      //   },

      //   // Optimize paste handling
      //   handlePaste: (view, event, slice) => {
      //     // Let our custom image paste handler deal with images
      //     const items = Array.from(event.clipboardData?.items || []);

      //     const hasImages = items.some((item) =>
      //       item.type.startsWith('image/')
      //     );

      //     if (hasImages) {
      //       // Let the image paste extension handle this
      //       return false;
      //     }

      //     // For non-image content, use default behavior
      //     return false;
      //   },

      //   // Optimize drag and drop
      //   handleDrop: (view, event, slice, moved) => {
      //     // Prevent default file drops if you have custom handling
      //     if (event.dataTransfer?.files?.length) {
      //       event.preventDefault();
      //       return true;
      //     }
      //     return false;
      //   },
      // },

      // extensions,
      // content: value || '',
      // immediatelyRender: false,
    },
    [extensions, value, editorEventHandlers]
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }
    };
  }, []);

  return editor;
}

// Optimized updateContent function
export const useOptimizedUpdateContent = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  setImageCount: any,
  handleContentChange: (content: string) => void
) => {
  return useCallback(() => {
    // Use requestAnimationFrame to prevent blocking the main thread
    requestAnimationFrame(() => {
      if (!editorRef?.current) return;

      const newContent = editorRef.current.innerHTML;

      // Create document fragment instead of div for better performance
      const range = document.createRange();
      const fragment = range.createContextualFragment(newContent);
      const images = fragment.querySelectorAll('img');

      setImageCount(images.length);

      if (handleContentChange) {
        handleContentChange(newContent);
      }
    });
  }, [editorRef, setImageCount, handleContentChange]);
};

// Simple and fast image paste hook
export function useSimpleImagePaste(
  editor: Editor | null,
  editorElement: HTMLElement | null
) {
  useEffect(() => {
    if (!editor || !editorElement) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));

      if (!imageItem) return;

      event.preventDefault();

      const file = imageItem.getAsFile();
      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      const imageId = `img-${Date.now()}`;

      // Fast insertion without complex processing
      editor.commands.insertContent(
        `<img src="${imageUrl}" alt="${file.name}" data-image-id="${imageId}" style="max-width: 100%; height: auto;" />`
      );

      console.log('✅ Image pasted quickly');
    };

    editorElement.addEventListener('paste', handlePaste);

    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, editorElement]);
}

// Performance monitoring utility
// export function useEditorPerformance(editor: Editor | null) {
//   useEffect(() => {
//     if (!editor) return;

//     let updateCount = 0;
//     const startTime = Date.now();

//     const handleUpdate = () => {
//       updateCount++;
//       if (updateCount % 10 === 0) {
//         console.log(
//           `TipTap updates: ${updateCount} in ${Date.now() - startTime}ms`
//         );
//       }
//     };

//     editor.on('update', handleUpdate);

//     return () => {
//       editor.off('update', handleUpdate);
//     };
//   }, [editor]);
// }
