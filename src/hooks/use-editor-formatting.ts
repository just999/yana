import { RefObject, useCallback, useState } from 'react';

import { debounce } from '@/components/rich-text-editor/editor-helper';

export const useEditorFormatting = (
  editorRef: RefObject<HTMLElement | null> | undefined,
  detectActiveStyles: () => void,
  updateContent?: () => void
) => {
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');

  const insertInlineStyleAtCursor = useCallback(
    (tag: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      const marker = document.createElement('span');
      marker.id = 'cursor-marker-' + Date.now();
      marker.innerHTML = '&#8203;';

      range.insertNode(marker);

      const styleElement = document.createElement(tag);
      styleElement.innerHTML = '&#8203;';

      marker.parentNode?.replaceChild(styleElement, marker);

      const newRange = document.createRange();
      newRange.setStart(styleElement.firstChild!, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      return styleElement;
    },
    [editorRef]
  );

  const toggleInlineStyle = useCallback(
    (tag: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        let parentElement =
          range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : (range.startContainer as Element);

        let foundTag: HTMLElement | null = null;
        while (parentElement && parentElement !== editor) {
          if (parentElement.tagName?.toLowerCase() === tag.toLowerCase()) {
            foundTag = parentElement as HTMLElement;
            break;
          }
          parentElement = parentElement.parentElement;
        }

        if (foundTag) {
          const cursorOffset = range.startOffset;
          const textContent = foundTag.textContent || '';

          const isAtStart = cursorOffset === 0;
          const isAtEnd = cursorOffset >= textContent.length;

          if (isAtStart || isAtEnd || textContent.length <= 1) {
            const parent = foundTag.parentNode!;
            while (foundTag.firstChild) {
              parent.insertBefore(foundTag.firstChild, foundTag);
            }
            parent.removeChild(foundTag);

            const textNodes = parent.childNodes;
            let targetNode: Node | null = null;
            let accumulatedLength = 0;

            for (let i = 0; i < textNodes.length; i++) {
              const node = textNodes[i];
              const nodeLength = node.textContent?.length || 0;

              if (accumulatedLength + nodeLength >= cursorOffset) {
                targetNode = node;
                break;
              }
              accumulatedLength += nodeLength;
            }

            if (targetNode) {
              const newRange = document.createRange();
              const offsetInNode = cursorOffset - accumulatedLength;
              newRange.setStart(
                targetNode,
                Math.min(offsetInNode, targetNode.textContent!.length)
              );
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } else {
            const beforeText = textContent.substring(0, cursorOffset);
            const afterText = textContent.substring(cursorOffset);

            const parent = foundTag.parentNode!;

            if (beforeText) {
              const beforeElement = document.createElement(tag);
              beforeElement.textContent = beforeText;
              parent.insertBefore(beforeElement, foundTag);
            }

            const cursorNode = document.createTextNode('');
            parent.insertBefore(cursorNode, foundTag);

            if (afterText) {
              const afterElement = document.createElement(tag);
              afterElement.textContent = afterText;
              parent.insertBefore(afterElement, foundTag);
            }

            parent.removeChild(foundTag);

            const newRange = document.createRange();
            newRange.setStart(cursorNode, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } else {
          insertInlineStyleAtCursor(tag);
        }

        if (updateContent) updateContent();
        setTimeout(detectActiveStyles, 50);
        return;
      }

      try {
        const selectedText = range.toString();
        if (!selectedText.trim()) return;

        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        let commonParent = range.commonAncestorContainer;
        if (commonParent.nodeType === Node.TEXT_NODE) {
          commonParent = commonParent.parentElement!;
        }

        let existingTag: HTMLElement | null = null;
        let current = commonParent as HTMLElement;

        while (current && current !== editor) {
          if (current.tagName?.toLowerCase() === tag.toLowerCase()) {
            existingTag = current;
            break;
          }
          current = current.parentElement!;
        }

        if (
          existingTag &&
          existingTag.contains(startContainer) &&
          existingTag.contains(endContainer)
        ) {
          const isFullSelection =
            range.startOffset === 0 &&
            range.endOffset === existingTag.textContent!.length;

          if (isFullSelection) {
            const parent = existingTag.parentNode!;
            while (existingTag.firstChild) {
              parent.insertBefore(existingTag.firstChild, existingTag);
            }
            parent.removeChild(existingTag);

            const newRange = document.createRange();
            newRange.setStart(startContainer, range.startOffset);
            newRange.setEnd(endContainer, range.endOffset);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            const beforeRange = document.createRange();
            beforeRange.selectNodeContents(existingTag);
            beforeRange.setEnd(range.startContainer, range.startOffset);

            const afterRange = document.createRange();
            afterRange.selectNodeContents(existingTag);
            afterRange.setStart(range.endContainer, range.endOffset);

            const beforeContent = beforeRange.cloneContents();
            const selectedContent = range.cloneContents();
            const afterContent = afterRange.cloneContents();

            const parent = existingTag.parentNode!;

            const beforeFragment = document.createDocumentFragment();
            const afterFragment = document.createDocumentFragment();

            if (beforeContent.textContent?.trim()) {
              const beforeElement = document.createElement(tag);
              beforeElement.appendChild(beforeContent);
              beforeFragment.appendChild(beforeElement);
            }

            const unStyledContent = document.createDocumentFragment();

            const tempDiv = document.createElement('div');

            tempDiv.appendChild(selectedContent);
            const styledElements = tempDiv.querySelectorAll(tag.toLowerCase());
            styledElements.forEach((el) => {
              const textContent = el.textContent || '';
              el.parentNode?.replaceChild(
                document.createTextNode(textContent),
                el
              );
            });
            while (tempDiv.firstChild) {
              unStyledContent.appendChild(tempDiv.firstChild);
            }

            if (afterContent.textContent?.trim()) {
              const afterElement = document.createElement(tag);
              afterElement.appendChild(afterContent);
              afterFragment.appendChild(afterElement);
            }

            parent.insertBefore(beforeFragment, existingTag);
            parent.insertBefore(unStyledContent, existingTag);
            parent.insertBefore(afterFragment, existingTag);
            parent.removeChild(existingTag);

            const newRange = document.createRange();
            if (unStyledContent.firstChild) {
              newRange.selectNodeContents(unStyledContent.firstChild);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        } else {
          const contents = range.extractContents();

          const tempDiv = document.createElement('div');
          tempDiv.appendChild(contents);

          const existingTags = tempDiv.querySelectorAll(tag.toLowerCase());
          existingTags.forEach((existingTag) => {
            const parent = existingTag.parentNode!;
            while (existingTag.firstChild) {
              parent.insertBefore(existingTag.firstChild, existingTag);
            }
            parent.removeChild(existingTag);
          });

          const newElement = document.createElement(tag);
          while (tempDiv.firstChild) {
            newElement.appendChild(tempDiv.firstChild);
          }

          range.insertNode(newElement);

          const newRange = document.createRange();
          newRange.selectNodeContents(newElement);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error('Error toggling inline style:', error);

        try {
          const contents = range.extractContents();
          const wrapper = document.createElement(tag);
          wrapper.appendChild(contents);
          range.insertNode(wrapper);

          const newRange = document.createRange();
          newRange.selectNodeContents(wrapper);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles, insertInlineStyleAtCursor]
  );

  const toggleInlineStyleWithClasses = useCallback(
    (styleClass: string, tag: string = 'span') => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        let parentElement =
          range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : (range.startContainer as Element);

        let foundElement: HTMLElement | null = null;
        while (parentElement && parentElement !== editor) {
          if (parentElement.classList.contains(styleClass)) {
            foundElement = parentElement as HTMLElement;
            break;
          }
          parentElement = parentElement.parentElement;
        }

        if (foundElement) {
          if (foundElement.classList.length === 1) {
            const parent = foundElement.parentNode!;
            while (foundElement.firstChild) {
              parent.insertBefore(foundElement.firstChild, foundElement);
            }
            parent.removeChild(foundElement);
          } else {
            foundElement.classList.remove(styleClass);
          }
        } else {
          const styleElement = document.createElement(tag);
          styleElement.classList.add(styleClass);
          styleElement.innerHTML = '&#8203;';

          range.insertNode(styleElement);

          const newRange = document.createRange();
          newRange.setStart(styleElement.firstChild!, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        const contents = range.extractContents();
        const wrapper = document.createElement(tag);
        wrapper.classList.add(styleClass);
        wrapper.appendChild(contents);

        range.insertNode(wrapper);

        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles]
  );

  const toggleBlockStyle = useCallback(
    (tagName: string, className?: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      let targetElement: HTMLElement | null = null;

      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;

      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }

      while (node && node !== editor) {
        if (
          node instanceof HTMLElement &&
          ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(
            node.tagName.toLowerCase()
          )
        ) {
          targetElement = node;
          break;
        }
        node = node.parentNode as Node;
      }

      if (!targetElement) {
        console.warn('No target element found for block style toggle');
        return;
      }

      const originalText = range.toString();
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      try {
        const currentTag = targetElement.tagName.toLowerCase();

        if (className && (!tagName || tagName === '')) {
          if (targetElement.classList.contains(className)) {
            targetElement.classList.remove(className);
          } else {
            const alignmentClasses = [
              'text-left',
              'text-center',
              'text-right',
              'text-justify',
            ];
            alignmentClasses.forEach((cls) =>
              targetElement!.classList.remove(cls)
            );
            targetElement.classList.add(className);
          }
          if (updateContent) updateContent();
          setTimeout(detectActiveStyles, 50);
          return;
        }

        const newTag = !tagName
          ? currentTag
          : currentTag === tagName.toLowerCase()
            ? 'p'
            : tagName;
        const newElement = document.createElement(newTag);

        newElement.innerHTML = targetElement.innerHTML;

        if (targetElement.className) {
          newElement.className = targetElement.className;
        }

        if (
          newTag === 'p' &&
          !newElement.classList.contains('editor-paragraph')
        ) {
          newElement.classList.add('editor-paragraph');
        }

        if (className) {
          if (className.startsWith('text-')) {
            const alignmentClasses = [
              'text-left',
              'text-center',
              'text-right',
              'text-justify',
            ];
            alignmentClasses.forEach((cls) => newElement.classList.remove(cls));
          }
          newElement.classList.add(className);
        }

        targetElement.parentNode?.replaceChild(newElement, targetElement);

        setTimeout(() => {
          try {
            const newSelection = window.getSelection();
            if (!newSelection) return;

            const newRange = document.createRange();

            if (originalText) {
              const walker = document.createTreeWalker(
                newElement,
                NodeFilter.SHOW_TEXT,
                null
              );

              let textNode: Node | null = null;
              while (walker.nextNode()) {
                const node = walker.currentNode;
                if (
                  node.textContent &&
                  node.textContent.includes(originalText)
                ) {
                  textNode = node;
                  break;
                }
              }

              if (textNode) {
                const textContent = textNode.textContent || '';
                const textStart = Math.min(startOffset, textContent.length);
                const textEnd = Math.min(endOffset, textContent.length);

                newRange.setStart(textNode, textStart);
                newRange.setEnd(textNode, textEnd);
              } else {
                newRange.selectNodeContents(newElement);
              }
            } else {
              const firstTextNode = newElement.firstChild;
              if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
                newRange.setStart(
                  firstTextNode,
                  Math.min(startOffset, firstTextNode.textContent?.length || 0)
                );
                newRange.collapse(true);
              } else {
                newRange.setStart(newElement, 0);
                newRange.collapse(true);
              }
            }

            newSelection.removeAllRanges();
            newSelection.addRange(newRange);
          } catch (selectionError) {
            console.warn('Could not restore selection:', selectionError);

            if (editor) {
              editor.focus();
            }
          }
        }, 0);
      } catch (error) {
        console.error('Error toggling block style:', error);
      }

      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles]
  );

  const debouncedDetectActiveStyles = useCallback(
    debounce(detectActiveStyles, 50),
    [detectActiveStyles]
  );

  const toggleListStyle = useCallback(
    (listType: 'ul' | 'ol') => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let targetElement: HTMLElement | null = null;
      let node = range.commonAncestorContainer;

      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }

      while (node && node !== editor) {
        if (node instanceof HTMLElement) {
          const tagName = node.tagName.toLowerCase();
          if (
            ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li'].includes(
              tagName
            )
          ) {
            targetElement = node;
            break;
          }
        }
        node = node.parentNode as Node;
      }

      if (!targetElement) return;

      try {
        const isInList = targetElement.tagName.toLowerCase() === 'li';
        const currentList = isInList ? targetElement.parentElement : null;
        const isCurrentListType =
          currentList?.tagName.toLowerCase() === listType;

        const textContent = targetElement.textContent || '';
        const startOffset = range.startOffset;

        if (isInList && isCurrentListType) {
          const newP = document.createElement('p');
          newP.innerHTML = targetElement.innerHTML;

          const listItems = currentList!.querySelectorAll('li');
          if (listItems.length === 1) {
            currentList!.parentNode?.replaceChild(newP, currentList!);
          } else {
            currentList!.parentNode?.insertBefore(
              newP,
              currentList!.nextSibling
            );
            targetElement.remove();
          }

          targetElement = newP;
        } else if (isInList && !isCurrentListType) {
          const newList = document.createElement(listType);
          newList.innerHTML = currentList!.innerHTML;
          currentList!.parentNode?.replaceChild(newList, currentList!);
        } else {
          const newList = document.createElement(listType);
          const newLi = document.createElement('li');
          newLi.innerHTML = targetElement.innerHTML;
          newList.appendChild(newLi);

          targetElement.parentNode?.replaceChild(newList, targetElement);
          targetElement = newLi;
        }

        const newRange = document.createRange();
        const walker = document.createTreeWalker(
          targetElement,
          NodeFilter.SHOW_TEXT
        );

        let textNode = walker.nextNode();
        if (textNode) {
          newRange.setStart(
            textNode,
            Math.min(startOffset, textNode.textContent!.length)
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error('Error toggling list style:', error);
      }

      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles]
  );

  const toggleAlignment = useCallback(
    (alignmentClass: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      let targetElement: HTMLElement | null = null;
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;

      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }

      while (node && node !== editor) {
        if (
          node instanceof HTMLElement &&
          ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(
            node.tagName.toLowerCase()
          )
        ) {
          targetElement = node;
          break;
        }
        node = node.parentNode as Node;
      }

      if (!targetElement) return;

      const alignmentClasses = [
        'text-left',
        'text-center',
        'text-right',
        'text-justify',
      ];

      if (targetElement.classList.contains(alignmentClass)) {
        targetElement.classList.remove(alignmentClass);
      } else {
        alignmentClasses.forEach((cls) => targetElement!.classList.remove(cls));
        targetElement.classList.add(alignmentClass);
      }

      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles]
  );

  const toggleStyle = useCallback(
    (tag: string, className?: string) => {
      console.log('🔥 toggleStyle called with:', { tag, className });
      const inlineStyles = ['b', 'strong', 'i', 'em', 'u', 'span'];
      const blockStyles = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'];
      const listStyles = ['ul', 'ol'];
      const alignmentClasses = [
        'text-left',
        'text-center',
        'text-right',
        'text-justify',
      ];

      if (listStyles.includes(tag.toLowerCase())) {
        toggleListStyle(tag.toLowerCase() as 'ul' | 'ol');
      } else if (alignmentClasses.includes(className || '')) {
        toggleAlignment(className as string);
      } else if (inlineStyles.includes(tag.toLowerCase()) && !className) {
        toggleInlineStyle(tag);
      } else if (blockStyles.includes(tag.toLowerCase()) || className) {
        const validTag =
          tag && blockStyles.includes(tag.toLowerCase()) ? tag : undefined;
        toggleBlockStyle(validTag as string, className);
      } else {
        toggleInlineStyleWithClasses(tag);
      }

      if (updateContent) updateContent();
      debouncedDetectActiveStyles();
    },
    [
      toggleInlineStyle,
      toggleBlockStyle,
      toggleAlignment,
      updateContent,
      debouncedDetectActiveStyles,
      toggleListStyle,
    ]
  );

  const applyTextColor = useCallback(
    (color: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor) return;

      let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (!range) {
        editor.focus();
        return;
      }

      if (range.collapsed) {
        setCurrentTextColor(color);
        return;
      }

      try {
        const span = document.createElement('span');
        span.style.color = color;
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (error) {
        console.error('Error applying text color:', error);
      }

      setCurrentTextColor(color);
      if (updateContent) updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [setCurrentTextColor]
  );

  const toggleTextAlignment = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'justify') => {
      toggleBlockStyle('', `text-${alignment}`);
    },
    [toggleBlockStyle]
  );

  const applyInlineFormat = useCallback(
    (format: 'bold' | 'italic' | 'underline') => {
      const tagMap = { bold: 'strong', italic: 'em', underline: 'u' };
      try {
        document.execCommand(format, false, undefined);
        if (updateContent) updateContent();
        setTimeout(detectActiveStyles, 50);
      } catch (error) {
        console.error(`Error applying ${format}:`, error);
        toggleInlineStyle(tagMap[format]);
      }
    },
    [updateContent, detectActiveStyles, toggleInlineStyle]
  );

  return {
    currentTextColor,
    toggleInlineStyle,
    toggleBlockStyle,
    toggleStyle,
    applyTextColor,
    toggleTextAlignment,
    applyInlineFormat,
  };
};
