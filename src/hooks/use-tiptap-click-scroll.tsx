import { useCallback, useEffect, useRef, useState } from 'react';

import { Editor } from '@tiptap/react';

import { useOptimizedEditor } from './use-editor-extensions';

interface ClickScrollOptions {
  enabled?: boolean;
  excludeSelectors?: string[];
  scrollOffset?: number;
  animationDuration?: number;
}

interface UseOptimizedEditorProps {
  value: string;
  setContent: (content: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setEditor: (editor: Editor | null) => void;
  clickScrollOptions?: ClickScrollOptions;
}

const useTipTapClickScroll = (
  editor: Editor | null,
  options: ClickScrollOptions = {}
) => {
  const {
    enabled = true,
    excludeSelectors = [
      'button',
      'input',
      'textarea',
      'select',
      'a',
      '.ProseMirror-menubar',
      '.toolbar',
      '[data-toolbar]',
      '.floating-menu',
      '.bubble-menu',
    ],
    scrollOffset = 100,
    animationDuration = 600,
  } = options;

  const isScrollingRef = useRef<boolean>(false);
  const lastClickTimeRef = useRef<number>(0);

  const scrollToEditorPosition = useCallback(
    (clickX: number, clickY: number) => {
      if (!editor || !editor.view.dom) return;

      const editorDom = editor.view.dom as HTMLElement;
      const editorRect = editorDom.getBoundingClientRect();

      // Check if click is within editor bounds
      const isWithinEditor =
        clickX >= editorRect.left &&
        clickX <= editorRect.right &&
        clickY >= editorRect.top &&
        clickY <= editorRect.bottom;

      if (isWithinEditor) {
        // Get relative position within editor
        const relativeX = clickX - editorRect.left;
        const relativeY = clickY - editorRect.top;

        try {
          // Use TipTap's posAtCoords to find the document position
          const pos = editor.view.posAtCoords({ left: clickX, top: clickY });

          if (pos) {
            // Get the DOM node at this position
            const domAtPos = editor.view.domAtPos(pos.pos);
            const targetNode = domAtPos.node;

            // Find the closest block element
            let targetElement: HTMLElement | null =
              targetNode.nodeType === Node.TEXT_NODE
                ? (targetNode.parentElement as HTMLElement)
                : (targetNode as HTMLElement);

            // Walk up to find a good scroll target (paragraph, heading, etc.)
            while (targetElement && targetElement !== editorDom) {
              const tagName = targetElement.tagName?.toLowerCase();
              if (
                [
                  'p',
                  'h1',
                  'h2',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                  'div',
                  'blockquote',
                  'ul',
                  'ol',
                  'li',
                ].includes(tagName)
              ) {
                break;
              }
              targetElement = targetElement.parentElement as HTMLElement;
            }

            if (targetElement && targetElement !== editorDom) {
              // Calculate scroll position to center the element
              const elementRect = targetElement.getBoundingClientRect();
              const elementTop = elementRect.top + window.scrollY;
              const windowHeight = window.innerHeight;
              const targetScroll = elementTop - windowHeight / 2 + scrollOffset;

              // Clamp to valid scroll range
              const maxScroll =
                document.documentElement.scrollHeight - windowHeight;
              const clampedScroll = Math.max(
                0,
                Math.min(targetScroll, maxScroll)
              );

              // Smooth scroll
              window.scrollTo({
                top: clampedScroll,
                behavior: 'smooth',
              });

              // Visual feedback - highlight the target element briefly
              const originalBackgroundColor =
                targetElement.style.backgroundColor;
              const originalTransition = targetElement.style.transition;

              targetElement.style.transition = 'background-color 0.3s ease';
              targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';

              setTimeout(() => {
                targetElement!.style.backgroundColor = originalBackgroundColor;
                setTimeout(() => {
                  targetElement!.style.transition = originalTransition;
                }, 300);
              }, 300);

              // Also position cursor at the clicked location
              if (pos) {
                editor.commands.setTextSelection(pos.pos);
                editor.commands.focus();
              }
            }
          }
        } catch (error) {
          console.warn('Error in TipTap click-to-scroll:', error);
          // Fallback to basic scrolling
          scrollToBasicPosition(clickY);
        }
      } else {
        // Click outside editor - use basic scrolling
        scrollToBasicPosition(clickY);
      }
    },
    [editor, scrollOffset]
  );

  const scrollToBasicPosition = useCallback((clickY: number) => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    const currentScroll = window.scrollY;

    // Map click position to scroll position
    const relativeClickY = clickY / windowHeight;
    const targetScroll = currentScroll + (relativeClickY - 0.5) * windowHeight;
    const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    window.scrollTo({
      top: clampedScroll,
      behavior: 'smooth',
    });
  }, []);

  const handleEditorClick = useCallback(
    (event: Event) => {
      if (!enabled || isScrollingRef.current) return;

      const mouseEvent = event as MouseEvent;
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      // Prevent rapid clicking
      if (timeSinceLastClick < 100) return;

      lastClickTimeRef.current = now;

      // Check if click is on excluded elements
      const target = mouseEvent.target as Element;
      const isExcluded = excludeSelectors.some((selector: string) =>
        target.closest(selector)
      );

      if (isExcluded) return;

      // Check if this is a double-click (let editor handle it normally)
      if (mouseEvent.detail === 2) return;

      // Set scrolling flag
      isScrollingRef.current = true;

      // Perform the scroll
      scrollToEditorPosition(mouseEvent.clientX, mouseEvent.clientY);

      // Reset scrolling flag
      setTimeout(() => {
        isScrollingRef.current = false;
      }, animationDuration);
    },
    [enabled, excludeSelectors, scrollToEditorPosition, animationDuration]
  );

  const handleDocumentClick = useCallback(
    (event: Event) => {
      if (!enabled || !editor?.view?.dom) return;

      const mouseEvent = event as MouseEvent;
      const editorContainer =
        (editor.view.dom as HTMLElement).closest('.ProseMirror') ||
        (editor.view.dom as HTMLElement).parentElement;

      if (editorContainer) {
        const editorRect = editorContainer.getBoundingClientRect();
        const isOutsideEditor =
          mouseEvent.clientX < editorRect.left ||
          mouseEvent.clientX > editorRect.right ||
          mouseEvent.clientY < editorRect.top ||
          mouseEvent.clientY > editorRect.bottom;

        if (isOutsideEditor) {
          handleEditorClick(event);
        }
      }
    },
    [editor, handleEditorClick, enabled]
  );

  useEffect(() => {
    if (!enabled || !editor?.view?.dom) return;

    const editorDom = editor.view.dom as HTMLElement;
    const editorContainer =
      (editorDom.closest('.ProseMirror') as HTMLElement) ||
      (editorDom.parentElement as HTMLElement);

    if (editorContainer) {
      editorContainer.addEventListener('click', handleEditorClick);
      document.addEventListener('click', handleDocumentClick);

      return () => {
        editorContainer.removeEventListener('click', handleEditorClick);
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [editor, handleEditorClick, handleDocumentClick, enabled]);

  return {
    scrollToEditorPosition,
    isScrolling: isScrollingRef.current,
  };
};

// Enhanced useOptimizedEditor with click-to-scroll
function useOptimizedEditorWithScroll({
  value,
  setContent,
  setHasUnsavedChanges,
  setEditor,
  clickScrollOptions = {},
}: UseOptimizedEditorProps) {
  // Import your existing extensions
  // const { extensions } = useEditorExtensions();
  // const [formData, setFormData] = useAtom(blogAtom);

  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(
    (editor: Editor) => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }

      debouncedUpdateRef.current = setTimeout(() => {
        const newContent = JSON.stringify(editor.getJSON());
        setContent(newContent);
        // setFormData((prev) => ({
        //   ...prev,
        //   content: newContent,
        // }));
        setHasUnsavedChanges(true);
      }, 150);
    },
    [setContent, setHasUnsavedChanges]
  );

  // You'll need to import useEditor from @tiptap/react and your extensions
  const editor = useOptimizedEditor({
    value,
    setContent,
    setHasUnsavedChanges,
    setEditor,
  }); // Replace with your actual useEditor hook

  /*
  const editor = useEditor({
    autofocus: true,
    shouldRerenderOnTransaction: false,

    onCreate({ editor }) {
      setEditor(editor);
      if (value) {
        requestAnimationFrame(() => {
          try {
            const contentToSet =
              typeof value === 'string' ? JSON.parse(value) : value;
            editor.commands.setContent(contentToSet);
          } catch (error) {
            console.error('Error parsing content:', error);
            editor.commands.setContent(value);
          }
        });
      }
    },

    onUpdate({ editor }) {
      debouncedUpdate(editor);
    },

    onDestroy() {
      setEditor(null);
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }
    },

    editorProps: {
      scrollThreshold: 80,
      scrollMargin: 80,
      attributes: {
        class:
          'focus:outline-none print:border-0 dark:bg-accent/90 bg-white dark:text-gray-100 shadow-lg border-0 border-[#e8e8e8] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text click-scroll-enabled',
      },

      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const hasImages = items.some((item) => item.type.startsWith('image/'));
        if (hasImages) {
          return false;
        }
        return false;
      },

      handleDrop: (view, event, slice, moved) => {
        if (event.dataTransfer?.files?.length) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },

    extensions, // Your extensions here
    content: value || '',
    immediatelyRender: false,
  });
  */

  // Initialize click-to-scroll functionality
  const { scrollToEditorPosition, isScrolling } = useTipTapClickScroll(
    editor,
    clickScrollOptions
  );

  return {
    editor,
    scrollToEditorPosition,
    isScrolling,
  };
}

// Simplified React component example
interface BlogEditorProps {
  value: string;
  setContent: (content: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  value,
  setContent,
  setHasUnsavedChanges,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const {
    editor: Editor,
    scrollToEditorPosition,
    isScrolling,
  } = useOptimizedEditorWithScroll({
    value,
    setContent,
    setHasUnsavedChanges,
    setEditor,
    clickScrollOptions: {
      enabled: true,
      scrollOffset: 100,
      animationDuration: 600,
      excludeSelectors: [
        'button',
        'input',
        'textarea',
        'select',
        'a',
        '.ProseMirror-menubar',
        '.toolbar',
        '[data-toolbar]',
        '.floating-menu',
        '.bubble-menu',
        '.image-resize-handle',
      ],
    },
  });

  return (
    <div className='relative'>
      {/* Optional: Click indicator */}
      {isScrolling && (
        <div className='fixed top-4 right-4 z-50 animate-pulse rounded-lg bg-blue-500 px-3 py-2 text-sm text-white'>
          📍 Scrolling to position...
        </div>
      )}

      {/* Your existing toolbar */}
      {/* <Toolbar editor={tipTapEditor} /> */}

      {/* Editor content */}
      <div className='editor-container relative'>
        {/* <EditorContent 
          editor={tipTapEditor} 
          className="click-scroll-editor"
        /> */}

        {/* Optional: Visual guide */}
        <div className='pointer-events-none absolute top-2 right-2 text-xs text-gray-400 opacity-50'>
          💡 Click anywhere to scroll & position cursor
        </div>
      </div>
    </div>
  );
};

// CSS styles remain the same
export const editorStyles = `
.click-scroll-enabled {
  position: relative;
}

.click-scroll-enabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(
    45deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.02) 50%, 
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.click-scroll-enabled:hover::before {
  opacity: 1;
}

.ProseMirror p, 
.ProseMirror h1, 
.ProseMirror h2, 
.ProseMirror h3, 
.ProseMirror h4, 
.ProseMirror h5, 
.ProseMirror h6,
.ProseMirror blockquote,
.ProseMirror li {
  transition: background-color 0.3s ease;
  border-radius: 4px;
}

.ProseMirror p:hover,
.ProseMirror h1:hover,
.ProseMirror h2:hover,
.ProseMirror h3:hover,
.ProseMirror h4:hover,
.ProseMirror h5:hover,
.ProseMirror h6:hover,
.ProseMirror blockquote:hover,
.ProseMirror li:hover {
  background-color: rgba(59, 130, 246, 0.05);
}
`;

export { useOptimizedEditorWithScroll, useTipTapClickScroll, BlogEditor };
