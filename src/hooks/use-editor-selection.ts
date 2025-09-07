import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { activeStylesAtom } from '@/lib/jotai/blog-atoms';
import { useAtom } from 'jotai';

export const useEditorSelection = (
  editorRef: RefObject<HTMLDivElement | null> | undefined,
  onBlur?: () => void
) => {
  const [isTextSelected, setIsTextSelected] = useState(false);
  // const [activeStyles, setActiveStyles] = useState(new Set<string>());
  const [activeStyles, setActiveStyles] = useAtom(activeStylesAtom);
  const savedSelectionRef = useRef<Range | null>(null);
  const isUpdatingStyles = useRef<boolean>(false);

  // Helper function to check if text is selected
  const hasSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const editor = editorRef?.current;

    return (
      !range.collapsed &&
      editor &&
      editor.contains(range.commonAncestorContainer)
    );
  }, []);

  // Detect active styles
  const detectActiveStyles = useCallback(() => {
    if (isUpdatingStyles.current) return activeStyles;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      if (activeStyles.size > 0) {
        isUpdatingStyles.current = true;
        setActiveStyles(new Set());
        isUpdatingStyles.current = false;
      }
      return new Set<string>();
    }

    const range = selection.getRangeAt(0);
    const editor = editorRef?.current;
    if (!editor) return new Set<string>();

    const styles = new Set<string>();
    let currentNode =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentNode
        : range.startContainer;

    // Check inline styles
    let element = currentNode as HTMLElement | null;
    while (element && element !== editor) {
      if (element.tagName) {
        const tagName = element.tagName.toLowerCase();
        switch (tagName) {
          case 'strong':
          case 'b':
            styles.add('strong');
            styles.add('bold');
            break;
          case 'em':
          case 'i':
            styles.add('italic');
            styles.add('em');
            break;
          case 'u':
            styles.add('underline');
            styles.add('u');
            break;
          case 'span':
            const computedStyle = window.getComputedStyle(element);
            if (
              computedStyle.fontWeight === 'bold' ||
              computedStyle.fontWeight === '700'
            ) {
              styles.add('bold');
              styles.add('strong');
            }
            if (computedStyle.fontStyle === 'italic') {
              styles.add('italic');
              styles.add('em');
            }
            if (computedStyle.textDecoration.includes('underline')) {
              styles.add('underline');
              styles.add('u');
            }
            break;
        }
      }
      element = element.parentElement;
    }

    // Check block styles
    let blockElement = currentNode as HTMLElement | null;
    while (blockElement && blockElement !== editor) {
      if (blockElement.tagName) {
        const tagName = blockElement.tagName.toLowerCase();
        if (
          ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tagName)
        ) {
          styles.add(tagName);
          const classList = blockElement.classList;
          if (classList.contains('text-left')) styles.add('text-left');
          else if (classList.contains('text-center')) styles.add('text-center');
          else if (classList.contains('text-right')) styles.add('text-right');
          else if (classList.contains('text-justify'))
            styles.add('text-justify');
          break;
        }
      }
      blockElement = blockElement.parentElement;
    }

    if (
      activeStyles.size !== styles.size ||
      !Array.from(activeStyles).every((s) => styles.has(s))
    ) {
      isUpdatingStyles.current = true;
      setActiveStyles(styles);
      isUpdatingStyles.current = false;
    }

    return styles;
  }, [activeStyles, editorRef, setActiveStyles, isUpdatingStyles]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(detectActiveStyles, 100);
    };

    document.addEventListener('selectionchange', handler);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('selectionchange', handler);
    };
  }, [detectActiveStyles]);

  // Save selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, [savedSelectionRef]);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsTextSelected(false);
      return;
    }

    const editor = editorRef?.current;
    if (!editor) {
      setIsTextSelected(false);
      return;
    }

    // Check if the selection is within our editor
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      setIsTextSelected(false);
      return;
    }

    // Update active styles when selection changes
    detectActiveStyles();

    // You can also update UI state here based on whether text is selected
    const hasTextSelected = hasSelection() ?? false;
    setIsTextSelected(hasTextSelected);
    // Update your toolbar state, enable/disable buttons, etc.
  }, [detectActiveStyles, hasSelection]);

  const initializeEditor = useCallback(() => {
    const editor = editorRef?.current;
    if (!editor || editor.innerHTML.trim()) return;

    const p = document.createElement('p');
    p.innerHTML = '<br>';
    editor.appendChild(p);

    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [editorRef]);

  const handleEditorBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const handleEditorFocus = useCallback(() => {
    initializeEditor();
    detectActiveStyles();
  }, [initializeEditor, detectActiveStyles]);

  return {
    isTextSelected,
    setIsTextSelected,
    activeStyles,
    savedSelectionRef,
    hasSelection,
    detectActiveStyles,
    saveSelection,
    handleSelectionChange,
    handleEditorFocus,
    handleEditorBlur,
  };
};
