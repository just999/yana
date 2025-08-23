'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import {
  findParentElement,
  normalizeEditorContent,
} from '@/components/text-editor/editor-helpers';
import {
  activeStylesAtom,
  blogAtom,
  isEditorEmptyAtom,
  typingStylesAtom,
} from '@/lib/jotai/blog-atoms';
import { useAtom } from 'jotai';

export const useListsState = (
  editorRef: RefObject<HTMLDivElement | null> | undefined,
  updateContent: () => void,
  detectActiveStyles: () => void
) => {
  const [isEditorEmpty, setIsEditorEmpty] = useAtom(isEditorEmptyAtom);
  const [formData, setFormData] = useAtom(blogAtom);
  const activeListTypeRef = useRef<'ul' | 'ol' | null>(null);
  const isTypingModeRef = useRef(false);
  const skipNextInputHandler = useRef(false);
  const [activeStyles, setActiveStyles] = useAtom(activeStylesAtom);
  const [typingStyles, setTypingStyles] = useAtom(typingStylesAtom);

  useEffect(() => {
    const checkEmpty = () =>
      setIsEditorEmpty(editorRef?.current?.textContent?.trim() === '');
    const editor = editorRef?.current;
    if (editor) {
      editor.addEventListener('input', checkEmpty);

      return () => editor.removeEventListener('input', checkEmpty);
    }
  }, [editorRef]);

  const updateToolbarAppearance = useCallback(() => {
    const ulButton = document.querySelector(
      '[data-list-type="ul"]'
    ) as HTMLButtonElement;
    const olButton = document.querySelector(
      '[data-list-type="ol"]'
    ) as HTMLButtonElement;

    if (ulButton) {
      if (activeListTypeRef.current === 'ul') {
        ulButton.classList.add('bg-blue-500', 'text-white');
        ulButton.classList.remove('bg-gray-200', 'hover:bg-gray-300');
      } else {
        ulButton.classList.remove('bg-blue-500', 'text-white');
        ulButton.classList.add('bg-gray-200', 'hover:bg-gray-300');
      }
    }

    if (olButton) {
      if (activeListTypeRef.current === 'ol') {
        olButton.classList.add('bg-blue-500', 'text-white');
        olButton.classList.remove('bg-gray-200', 'hover:bg-gray-300');
      } else {
        olButton.classList.remove('bg-blue-500', 'text-white');
        olButton.classList.add('bg-gray-200', 'hover:bg-gray-300');
      }
    }
  }, []);

  const updateListState = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      activeListTypeRef.current = null;
      updateToolbarAppearance();
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    const currentList =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest('ul, ol')
        : (container as Element).closest('ul, ol');

    if (currentList) {
      activeListTypeRef.current = currentList.tagName.toLowerCase() as
        | 'ul'
        | 'ol';
    } else {
      activeListTypeRef.current = null;
    }

    updateToolbarAppearance();
  }, [updateToolbarAppearance]);

  const ensureParagraphStructure = useCallback((editor: HTMLDivElement) => {
    const childNodes = Array.from(editor.childNodes);
    let needsNormalization = false;

    childNodes.forEach((node) => {
      // If we find a text node at the root level, wrap it in a <p>
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        needsNormalization = true;
      }
      // If we find inline elements at root level, wrap them in <p>
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const isInlineElement = [
          'SPAN',
          'STRONG',
          'EM',
          'B',
          'I',
          'U',
        ].includes(element.tagName);
        if (isInlineElement) {
          needsNormalization = true;
        }
      }
    });

    if (needsNormalization) {
      // Store current selection
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }

      // Normalize content
      const content = editor.innerHTML;
      const tempDiv = document.createElement('div');
      tempDiv.className = 'editor-paragraph';
      tempDiv.classList.add('editor-paragraph');
      tempDiv.innerHTML = content;

      // Wrap loose text nodes and inline elements in paragraphs
      const normalizedContent = content
        .replace(/^([^<]+)(?=<)/g, '<p>$1</p>') // Text at beginning
        .replace(/>([^<]+)(?=<)/g, '><p>$1</p>') // Text between elements
        .replace(/>([^<]+)$/g, '><p>$1</p>') // Text at end
        .replace(/<p><\/p>/g, '<p><br></p>'); // Empty paragraphs should have <br>

      if (normalizedContent !== content) {
        editor.innerHTML = normalizedContent;

        // Restore selection if possible
        if (savedRange) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
          } catch (e) {
            // If restoring selection fails, place cursor at end
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      }
    }
  }, []);

  const handleEditorInput = useCallback(() => {
    if (skipNextInputHandler?.current) {
      console.log('Skipping input handler after Enter key');
      return;
    }
    console.log(
      'handleEditorInput called, current selection:',
      window.getSelection()?.getRangeAt(0)?.startContainer
    );
    const editor = editorRef?.current;
    if (!editor) return;

    // First, ensure proper paragraph structure
    ensureParagraphStructure(editor);

    if (isTypingModeRef.current && typingStyles.size > 0) {
      const selection = window.getSelection();
      let savedRange = null;
      console.log(
        'Selection after manipulation:',
        window.getSelection()?.toString()
      );
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
        const range = selection.getRangeAt(0);
        let node = range.startContainer;

        if (node.nodeType === Node.TEXT_NODE) {
          const textNode = node as Text;
          const neededStyles = Array.from(typingStyles).filter(
            (style) => !findParentElement(textNode, style, editorRef?.current)
          );

          if (neededStyles.length > 0) {
            let wrapper: Node = textNode;
            neededStyles.forEach((style) => {
              const element = document.createElement(style);
              const textNode = document.createTextNode('Test');
              editor.appendChild(textNode);
              wrapper.parentNode?.replaceChild(element, wrapper);
              element.appendChild(wrapper);
              wrapper = element;
            });

            const newRange = document.createRange();
            let textNodeInWrapper: ChildNode | null =
              wrapper instanceof Element
                ? wrapper.childNodes[wrapper.childNodes.length - 1]
                : (wrapper as ChildNode);
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
      console.log(editor.innerHTML);
      normalizeEditorContent(editorRef.current);

      // Restore cursor position after normalization
      if (savedRange && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        } catch (e) {
          // Fallback if range is no longer valid
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    setIsEditorEmpty(editor.textContent?.trim().length === 0);
    setFormData((prev: any) => ({ ...prev, content: editor.innerHTML }));
    updateContent();
    detectActiveStyles();
  }, [
    editorRef,
    ensureParagraphStructure,
    isTypingModeRef,
    typingStyles,
    normalizeEditorContent,
    setFormData,
    updateContent,
    detectActiveStyles,
    skipNextInputHandler,
  ]);

  const toggleList = useCallback(
    (e: React.MouseEvent, listType: 'ul' | 'ol') => {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection || !editorRef?.current || selection.rangeCount === 0)
        return;

      const range = selection.getRangeAt(0);
      const currentList =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement?.closest('ul, ol')
          : (range.commonAncestorContainer as Element).closest('ul, ol');

      if (currentList) {
        const fragment = document.createDocumentFragment();
        const items = currentList.querySelectorAll('li');
        items.forEach((item, index) => {
          const p = document.createElement('p');
          p.innerHTML = item.innerHTML;
          fragment.appendChild(p);
          if (index < items.length - 1)
            fragment.appendChild(document.createElement('br'));
        });
        currentList.parentNode?.replaceChild(fragment, currentList);
        activeListTypeRef.current = null;
      } else {
        const list = document.createElement(listType);
        const listItem = document.createElement('li');
        listItem.innerHTML = range.toString() || ' ';
        list.appendChild(listItem);
        range.deleteContents();
        range.insertNode(list);
        const newRange = document.createRange();
        newRange.setStart(listItem, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        activeListTypeRef.current = listType;
      }

      updateToolbarAppearance();
      handleEditorInput();
    },
    [editorRef, activeListTypeRef, updateToolbarAppearance, handleEditorInput]
  );

  const handleEditorInputWithLists = useCallback(() => {
    handleEditorInput();
    updateListState();
  }, [handleEditorInput, updateListState]);

  return {
    activeListTypeRef,
    updateListState,
    updateToolbarAppearance,
    toggleList,
    handleEditorInputWithLists,
    isTypingModeRef,
    typingStyles,
    setActiveStyles,
    activeStyles,
    setTypingStyles,
    skipNextInputHandler,
  };
};
