import { RefObject, useCallback, useRef, useState } from 'react';

import { ensureParagraphStructure } from '@/lib/utils';

export const useEditorKeyboard = (
  editorRef: RefObject<HTMLDivElement | null> | undefined,
  toggleStyle: (tag: string) => void,
  isTypingModeRef: RefObject<boolean>,
  setTypingStyles: (styles: Set<string>) => void,
  activeListTypeRef: RefObject<'ol' | 'ul' | null>,
  detectActiveStyles: () => void,
  handleSelectionChange: () => void,
  updateToolbarAppearance: () => void,
  setIsTextSelected: (isTextSelected: boolean) => void,
  updateListState: () => void,
  skipNextInputHandler: React.RefObject<Boolean>
) => {
  const [content, setContent] = useState('');

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const editor = editorRef?.current;
      if (!editor) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        skipNextInputHandler.current = true;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const currentP =
          range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement?.closest('p')
            : (range.startContainer as Element).closest('p');

        if (currentP) {
          const newP = document.createElement('p');
          newP.className = currentP.className;
          newP.innerHTML = '<br>'; // Use <br> instead

          currentP.parentNode?.insertBefore(newP, currentP.nextSibling);

          // Position cursor at the beginning of the paragraph
          const newRange = document.createRange();
          newRange.selectNodeContents(newP);
          newRange.collapse(true);

          selection.removeAllRanges();
          selection.addRange(newRange);

          // Ensure focus
          editorRef?.current?.focus();

          setTimeout(() => {
            skipNextInputHandler.current = false;
          }, 100);
        }
      }

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
    [editorRef, toggleStyle, isTypingModeRef, setTypingStyles]
  );

  const handleEditorMouseUp = useCallback(() => {
    isTypingModeRef.current = false;
    setTypingStyles(new Set());
    detectActiveStyles();
    setTimeout(() => {
      const selection = window.getSelection();
      if (
        !selection ||
        selection.rangeCount === 0 ||
        !editorRef?.current?.contains(
          selection.getRangeAt(0).commonAncestorContainer
        )
      ) {
        setIsTextSelected(false);
        return;
      }
      setIsTextSelected(!selection.getRangeAt(0).collapsed);
    }, 10);
  }, [editorRef, detectActiveStyles, setTypingStyles, setIsTextSelected]);

  const handleEditorKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      detectActiveStyles();

      if (e.key.includes('Arrow') || e.key === 'Home' || e.key === 'End') {
        setTimeout(() => {
          handleSelectionChange();
        }, 10);
      }
    },
    [detectActiveStyles, handleSelectionChange]
  );

  const handleKeyDownWithLists = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(e);
      if (e.key !== 'Enter') return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const currentLi =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement?.closest('li')
          : (range.commonAncestorContainer as Element).closest('li');

      if (currentLi) {
        e.preventDefault();
        if (currentLi.textContent?.trim() === '') {
          const list = currentLi.closest('ul, ol');
          if (list) {
            const fragment = document.createDocumentFragment();
            const items = list.querySelectorAll('li');
            items.forEach((item, index) => {
              const p = document.createElement('p');
              p.innerHTML = item.innerHTML;
              fragment.appendChild(p);
              if (index < items.length - 1)
                fragment.appendChild(document.createElement('br'));
            });
            list.parentNode?.replaceChild(fragment, list);
            activeListTypeRef.current = null;
            updateToolbarAppearance();
          }
        } else {
          const newLi = document.createElement('li');
          newLi.innerHTML = ' ';
          currentLi.parentNode?.insertBefore(newLi, currentLi.nextSibling);
          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    },
    [handleKeyDown, activeListTypeRef, updateToolbarAppearance]
  );

  const handleEditorMouseUpWithLists = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleEditorMouseUp();
      updateListState();
    },
    [handleEditorMouseUp, updateListState]
  );

  return {
    handleKeyDown,
    handleEditorKeyUp,
    handleKeyDownWithLists,
    handleEditorMouseUpWithLists,
    skipNextInputHandler,
  };
};
