import { RefObject, useCallback, useState } from 'react';

import { debounce } from '@/components/rich-text-editor/editor-helper';

export const useEditorFormatting = (
  editorRef: RefObject<HTMLElement | null> | undefined,
  updateContent: () => void,
  detectActiveStyles: () => void
) => {
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');

  // const toggleInlineStyle = useCallback(
  //   (tag: string, className?: string) => {
  //     const selection = window.getSelection();
  //     const editor = editorRef?.current;
  //     if (!selection || !editor || selection.rangeCount === 0) return;

  //     const range = selection.getRangeAt(0);

  //     // Handle collapsed selection (cursor only)
  //     if (range.collapsed) {
  //       // Check if we're inside the target tag
  //       let parentElement =
  //         range.startContainer.nodeType === Node.TEXT_NODE
  //           ? range.startContainer.parentElement
  //           : (range.startContainer as Element);

  //       let foundTag = null;
  //       while (parentElement && parentElement !== editor) {
  //         if (parentElement.tagName?.toLowerCase() === tag.toLowerCase()) {
  //           foundTag = parentElement;
  //           break;
  //         }
  //         parentElement = parentElement.parentElement;
  //       }

  //       if (foundTag) {
  //         // Remove the tag
  //         const textContent = foundTag.textContent || '';
  //         const textNode = document.createTextNode(textContent);
  //         foundTag.parentNode?.replaceChild(textNode, foundTag);

  //         // Position cursor
  //         const newRange = document.createRange();
  //         newRange.setStart(
  //           textNode,
  //           Math.min(range.startOffset, textContent.length)
  //         );
  //         newRange.collapse(true);
  //         selection.removeAllRanges();
  //         selection.addRange(newRange);
  //       } else {
  //         // Add the tag for future typing
  //         document.execCommand(
  //           tag.toLowerCase() === 'b'
  //             ? 'bold'
  //             : tag.toLowerCase() === 'i'
  //               ? 'italic'
  //               : tag.toLowerCase() === 'u'
  //                 ? 'underline'
  //                 : tag,
  //           false,
  //           undefined
  //         );
  //       }

  //       updateContent();
  //       setTimeout(detectActiveStyles, 50);
  //       return;
  //     }

  //     try {
  //       // Handle text selection
  //       const selectedText = range.toString();
  //       if (!selectedText.trim()) return;

  //       // Check if selection is entirely within a tag of this type
  //       const startContainer = range.startContainer;
  //       const endContainer = range.endContainer;

  //       let commonParent = range.commonAncestorContainer;
  //       if (commonParent.nodeType === Node.TEXT_NODE) {
  //         commonParent = commonParent.parentElement!;
  //       }

  //       // Check if the entire selection is within the same tag
  //       let existingTag: HTMLElement | null = null;
  //       let current = commonParent as HTMLElement;

  //       while (current && current !== editor) {
  //         if (current.tagName?.toLowerCase() === tag.toLowerCase()) {
  //           existingTag = current;
  //           break;
  //         }
  //         current = current.parentElement!;
  //       }

  //       if (
  //         existingTag &&
  //         existingTag.contains(startContainer) &&
  //         existingTag.contains(endContainer)
  //       ) {
  //         // Remove the tag - unwrap the content
  //         const parent = existingTag.parentNode!;
  //         while (existingTag.firstChild) {
  //           parent.insertBefore(existingTag.firstChild, existingTag);
  //         }
  //         parent.removeChild(existingTag);

  //         // Restore selection
  //         const newRange = document.createRange();
  //         newRange.setStart(startContainer, range.startOffset);
  //         newRange.setEnd(endContainer, range.endOffset);
  //         selection.removeAllRanges();
  //         selection.addRange(newRange);
  //       } else {
  //         // Add the tag - wrap selected content
  //         const contents = range.extractContents();
  //         const newElement = document.createElement(tag);
  //         newElement.appendChild(contents);
  //         range.insertNode(newElement);

  //         // Select the newly created element's content
  //         const newRange = document.createRange();
  //         newRange.selectNodeContents(newElement);
  //         selection.removeAllRanges();
  //         selection.addRange(newRange);
  //       }
  //     } catch (error) {
  //       console.error('Error toggling inline style:', error);
  //       // Fallback to execCommand
  //       document.execCommand(
  //         tag.toLowerCase() === 'b'
  //           ? 'bold'
  //           : tag.toLowerCase() === 'i'
  //             ? 'italic'
  //             : tag.toLowerCase() === 'u'
  //               ? 'underline'
  //               : tag,
  //         false,
  //         undefined
  //       );
  //     }

  //     updateContent();
  //     setTimeout(detectActiveStyles, 50);
  //   },
  //   [editorRef, updateContent, detectActiveStyles]
  // );

  const insertInlineStyleAtCursor = useCallback(
    (tag: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Create a marker element to maintain cursor position
      const marker = document.createElement('span');
      marker.id = 'cursor-marker-' + Date.now();
      marker.innerHTML = '&#8203;'; // Zero-width space

      // Insert marker at cursor position
      range.insertNode(marker);

      // Create the styling element
      const styleElement = document.createElement(tag);
      styleElement.innerHTML = '&#8203;'; // Zero-width space to make it editable

      // Replace marker with style element
      marker.parentNode?.replaceChild(styleElement, marker);

      // Position cursor inside the style element
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

      // Handle collapsed selection (cursor only)
      if (range.collapsed) {
        // Check if we're inside the target tag
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
          // Check if we should remove the entire tag or split it
          const cursorOffset = range.startOffset;
          const textContent = foundTag.textContent || '';

          // If cursor is at the beginning or end, we can safely unwrap
          const isAtStart = cursorOffset === 0;
          const isAtEnd = cursorOffset >= textContent.length;

          if (isAtStart || isAtEnd || textContent.length <= 1) {
            // Remove the entire tag
            const parent = foundTag.parentNode!;
            while (foundTag.firstChild) {
              parent.insertBefore(foundTag.firstChild, foundTag);
            }
            parent.removeChild(foundTag);

            // Position cursor in the unwrapped text
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
            // Split the styled element at cursor position
            const beforeText = textContent.substring(0, cursorOffset);
            const afterText = textContent.substring(cursorOffset);

            const parent = foundTag.parentNode!;

            // Create before element if there's content
            if (beforeText) {
              const beforeElement = document.createElement(tag);
              beforeElement.textContent = beforeText;
              parent.insertBefore(beforeElement, foundTag);
            }

            // Create a text node for the cursor position (unstyled)
            const cursorNode = document.createTextNode('');
            parent.insertBefore(cursorNode, foundTag);

            // Create after element if there's content
            if (afterText) {
              const afterElement = document.createElement(tag);
              afterElement.textContent = afterText;
              parent.insertBefore(afterElement, foundTag);
            }

            // Remove the original element
            parent.removeChild(foundTag);

            // Position cursor at the split point
            const newRange = document.createRange();
            newRange.setStart(cursorNode, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } else {
          // Insert style element for future typing
          insertInlineStyleAtCursor(tag);
        }

        updateContent();
        setTimeout(detectActiveStyles, 50);
        return;
      }

      try {
        // Handle text selection
        const selectedText = range.toString();
        if (!selectedText.trim()) return;

        // Check if selection is entirely within a tag of this type
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        let commonParent = range.commonAncestorContainer;
        if (commonParent.nodeType === Node.TEXT_NODE) {
          commonParent = commonParent.parentElement!;
        }

        // Check if the entire selection is within the same tag
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
          // Handle partial unwrapping within a styled element
          const isFullSelection =
            range.startOffset === 0 &&
            range.endOffset === existingTag.textContent!.length;

          if (isFullSelection) {
            // If selecting all content, unwrap the entire element
            const parent = existingTag.parentNode!;
            while (existingTag.firstChild) {
              parent.insertBefore(existingTag.firstChild, existingTag);
            }
            parent.removeChild(existingTag);

            // Restore selection
            const newRange = document.createRange();
            newRange.setStart(startContainer, range.startOffset);
            newRange.setEnd(endContainer, range.endOffset);
            selection.removeAllRanges();
            selection.addRange(newRange);
          } else {
            // Partial selection - split the styled element
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

            // Create fragments for before and after content
            const beforeFragment = document.createDocumentFragment();
            const afterFragment = document.createDocumentFragment();

            // Create styled elements for before and after if they have content
            if (beforeContent.textContent?.trim()) {
              const beforeElement = document.createElement(tag);
              beforeElement.appendChild(beforeContent);
              beforeFragment.appendChild(beforeElement);
            }

            // Add unstyled selected content
            const unStyledContent = document.createDocumentFragment();
            // Remove styling from selected content
            const tempDiv = document.createElement('div');
            // tempDiv.className = 'editor-paragraph';
            // tempDiv.classList.add('editor-paragraph');
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

            // Replace the original element with the new structure
            parent.insertBefore(beforeFragment, existingTag);
            parent.insertBefore(unStyledContent, existingTag);
            parent.insertBefore(afterFragment, existingTag);
            parent.removeChild(existingTag);

            // Set selection on the unstyled content
            const newRange = document.createRange();
            if (unStyledContent.firstChild) {
              newRange.selectNodeContents(unStyledContent.firstChild);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        } else {
          // Add the tag - wrap selected content
          const contents = range.extractContents();

          // Clean up any existing similar tags within the selection
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

          // Create new styled element
          const newElement = document.createElement(tag);
          while (tempDiv.firstChild) {
            newElement.appendChild(tempDiv.firstChild);
          }

          range.insertNode(newElement);

          // Select the newly created element's content
          const newRange = document.createRange();
          newRange.selectNodeContents(newElement);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error('Error toggling inline style:', error);

        // Fallback: simple wrap/unwrap
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

      updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles, insertInlineStyleAtCursor]
  );

  // Alternative: Using modern styling approach with CSS classes
  const toggleInlineStyleWithClasses = useCallback(
    (styleClass: string, tag: string = 'span') => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        // Handle cursor position
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
          // Remove the class or unwrap if no other classes
          if (foundElement.classList.length === 1) {
            // Unwrap the element
            const parent = foundElement.parentNode!;
            while (foundElement.firstChild) {
              parent.insertBefore(foundElement.firstChild, foundElement);
            }
            parent.removeChild(foundElement);
          } else {
            foundElement.classList.remove(styleClass);
          }
        } else {
          // Create new styled element
          const styleElement = document.createElement(tag);
          styleElement.classList.add(styleClass);
          styleElement.innerHTML = '&#8203;'; // Zero-width space

          range.insertNode(styleElement);

          const newRange = document.createRange();
          newRange.setStart(styleElement.firstChild!, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Handle selection
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

      updateContent();
      setTimeout(detectActiveStyles, 50);
    },
    [editorRef, updateContent, detectActiveStyles]
  );

  // Usage examples:
  // const toggleBold = () => toggleInlineStyle('strong'); // or 'b'
  // const toggleItalic = () => toggleInlineStyle('em'); // or 'i'
  // const toggleUnderline = () => toggleInlineStyle('u');

  // // Alternative with CSS classes:
  // const toggleBoldWithClass = () => toggleInlineStyleWithClasses('font-bold');
  // const toggleItalicWithClass = () => toggleInlineStyleWithClasses('italic');

  // // You can also create a mapping for common styles:
  // const STYLE_MAPPINGS = {
  //   'b': 'strong',
  //   'i': 'em',
  //   'u': 'u'
  // };

  // const modernToggleStyle = (tag: string) => {
  //   const modernTag = STYLE_MAPPINGS[tag as keyof typeof STYLE_MAPPINGS] || tag;
  //   toggleInlineStyle(modernTag);
  // };

  // Alternative: Using modern styling approach with CSS classes
  // const toggleInlineStyleWithClasses = useCallback(
  //   (styleClass: string, tag: string = 'span') => {
  //     const selection = window.getSelection();
  //     const editor = editorRef?.current;
  //     if (!selection || !editor || selection.rangeCount === 0) return;

  //     const range = selection.getRangeAt(0);

  //     if (range.collapsed) {
  //       // Handle cursor position
  //       let parentElement =
  //         range.startContainer.nodeType === Node.TEXT_NODE
  //           ? range.startContainer.parentElement
  //           : (range.startContainer as Element);

  //       let foundElement: HTMLElement | null = null;
  //       while (parentElement && parentElement !== editor) {
  //         if (parentElement.classList.contains(styleClass)) {
  //           foundElement = parentElement as HTMLElement;
  //           break;
  //         }
  //         parentElement = parentElement.parentElement;
  //       }

  //       if (foundElement) {
  //         // Remove the class or unwrap if no other classes
  //         if (foundElement.classList.length === 1) {
  //           // Unwrap the element
  //           const parent = foundElement.parentNode!;
  //           while (foundElement.firstChild) {
  //             parent.insertBefore(foundElement.firstChild, foundElement);
  //           }
  //           parent.removeChild(foundElement);
  //         } else {
  //           foundElement.classList.remove(styleClass);
  //         }
  //       } else {
  //         // Create new styled element
  //         const styleElement = document.createElement(tag);
  //         styleElement.classList.add(styleClass);
  //         styleElement.innerHTML = '&#8203;'; // Zero-width space

  //         range.insertNode(styleElement);

  //         const newRange = document.createRange();
  //         newRange.setStart(styleElement.firstChild!, 1);
  //         newRange.collapse(true);
  //         selection.removeAllRanges();
  //         selection.addRange(newRange);
  //       }
  //     } else {
  //       // Handle selection
  //       const contents = range.extractContents();
  //       const wrapper = document.createElement(tag);
  //       wrapper.classList.add(styleClass);
  //       wrapper.appendChild(contents);

  //       range.insertNode(wrapper);

  //       const newRange = document.createRange();
  //       newRange.selectNodeContents(wrapper);
  //       selection.removeAllRanges();
  //       selection.addRange(newRange);
  //     }

  //     updateContent();
  //     setTimeout(detectActiveStyles, 50);
  //   },
  //   [editorRef, updateContent, detectActiveStyles]
  // );

  // // Usage examples:
  // const toggleBold = () => toggleInlineStyle('strong'); // or 'b'
  // const toggleItalic = () => toggleInlineStyle('em'); // or 'i'
  // const toggleUnderline = () => toggleInlineStyle('u');

  // // Alternative with CSS classes:
  // const toggleBoldWithClass = () => toggleInlineStyleWithClasses('font-bold');
  // const toggleItalicWithClass = () => toggleInlineStyleWithClasses('italic');

  // // You can also create a mapping for common styles:
  // const STYLE_MAPPINGS = {
  //   b: 'strong',
  //   i: 'em',
  //   u: 'u',
  // };

  // const modernToggleStyle = (tag: string) => {
  //   const modernTag = STYLE_MAPPINGS[tag as keyof typeof STYLE_MAPPINGS] || tag;
  //   toggleInlineStyle(modernTag);
  // };

  // const toggleBlockStyle = useCallback(
  //   (tagName: string, className?: string) => {
  //     const selection = window.getSelection();
  //     const editor = editorRef?.current;
  //     if (!selection || !editor || selection.rangeCount === 0) return;

  //     let targetElement: HTMLElement | null = null;

  //     const range = selection.getRangeAt(0);
  //     let node = range.commonAncestorContainer;

  //     if (node.nodeType === Node.TEXT_NODE) {
  //       node = node.parentNode as Node;
  //     }

  //     while (node && node !== editor) {
  //       if (
  //         node instanceof HTMLElement &&
  //         ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(
  //           node.tagName.toLowerCase()
  //         )
  //       ) {
  //         targetElement = node;
  //         break;
  //       }
  //       node = node.parentNode as Node;
  //     }

  //     if (!targetElement) return;

  //     try {
  //       const currentTag = targetElement.tagName.toLowerCase();
  //       if (className && !tagName) {
  //         if (targetElement.classList.contains(className)) {
  //           targetElement.classList.remove(className);
  //         } else {
  //           const alignmentClasses = [
  //             'text-left',
  //             'text-center',
  //             'text-right',
  //             'text-justify',
  //           ];
  //           alignmentClasses.forEach((cls) =>
  //             targetElement.classList.remove(cls)
  //           );
  //           targetElement.classList.add(className);
  //         }
  //         updateContent();
  //         setTimeout(detectActiveStyles, 50);
  //         return;
  //       }

  //       const newTag = currentTag === tagName.toLowerCase() ? 'p' : tagName;
  //       const newElement = document.createElement(newTag);
  //       newElement.innerHTML = targetElement.innerHTML;

  //       if (targetElement.className) {
  //         newElement.className = targetElement.className;
  //       }

  //       if (className) {
  //         if (className.startsWith('text-')) {
  //           const alignmentClasses = [
  //             'text-left',
  //             'text-center',
  //             'text-right',
  //             'text-justify',
  //           ];
  //           alignmentClasses.forEach((cls) => newElement.classList.remove(cls));
  //         }
  //         newElement.classList.add(className);
  //       }

  //       targetElement.parentNode?.replaceChild(newElement, targetElement);

  //       const newRange = document.createRange();
  //       const walker = document.createTreeWalker(
  //         newElement,
  //         NodeFilter.SHOW_TEXT,
  //         null
  //       );
  //       let found = false;

  //       while (walker.nextNode()) {
  //         if (
  //           walker.currentNode.textContent === range.startContainer.textContent
  //         ) {
  //           newRange.setStart(walker.currentNode, range.startOffset);
  //           newRange.setEnd(
  //             walker.currentNode,
  //             range.startContainer === range.endContainer
  //               ? range.endOffset
  //               : walker.currentNode.textContent?.length || 0
  //           );
  //           found = true;
  //           break;
  //         }
  //       }

  //       if (!found) {
  //         newRange.selectNodeContents(newElement);
  //       }

  //       selection.removeAllRanges();
  //       selection.addRange(newRange);
  //     } catch (error) {
  //       console.error('Error toggling block style:', error);
  //     }

  //     updateContent();
  //     setTimeout(detectActiveStyles, 50);
  //   },
  //   [editorRef, updateContent, detectActiveStyles]
  // );

  // const toggleBlockStyle = useCallback(
  //   (tagName: string, className?: string) => {
  //     const selection = window.getSelection();
  //     const editor = editorRef?.current;
  //     if (!selection || !editor || selection.rangeCount === 0) return;

  //     let targetElement: HTMLElement | null = null;

  //     const range = selection.getRangeAt(0);
  //     let node = range.commonAncestorContainer;

  //     // Navigate up to find the target block element
  //     if (node.nodeType === Node.TEXT_NODE) {
  //       node = node.parentNode as Node;
  //     }

  //     while (node && node !== editor) {
  //       if (
  //         node instanceof HTMLElement &&
  //         ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(
  //           node.tagName.toLowerCase()
  //         )
  //       ) {
  //         targetElement = node;
  //         break;
  //       }
  //       node = node.parentNode as Node;
  //     }

  //     if (!targetElement) {
  //       console.warn('No target element found for block style toggle');
  //       return;
  //     }

  //     // Store the original selection info before manipulation
  //     const originalText = range.toString();
  //     const startOffset = range.startOffset;
  //     const endOffset = range.endOffset;

  //     try {
  //       const currentTag = targetElement.tagName.toLowerCase();

  //       // Handle className-only changes (like text alignment)
  //       if (className && !tagName) {
  //         if (targetElement.classList.contains(className)) {
  //           targetElement.classList.remove(className);
  //         } else {
  //           const alignmentClasses = [
  //             'text-left',
  //             'text-center',
  //             'text-right',
  //             'text-justify',
  //           ];
  //           alignmentClasses.forEach((cls) =>
  //             targetElement!.classList.remove(cls)
  //           );
  //           targetElement.classList.add(className);
  //         }
  //         updateContent();
  //         setTimeout(detectActiveStyles, 50);
  //         return;
  //       }

  //       // Handle tag changes (like h1, h2, p)
  //       const newTag = currentTag === tagName.toLowerCase() ? 'p' : tagName;
  //       const newElement = document.createElement(newTag);

  //       // Copy content
  //       newElement.innerHTML = targetElement.innerHTML;

  //       // Handle classes
  //       if (targetElement.className) {
  //         newElement.className = targetElement.className;
  //       }

  //       // Add editor-paragraph class if it's a paragraph
  //       if (
  //         newTag === 'p' &&
  //         !newElement.classList.contains('editor-paragraph')
  //       ) {
  //         newElement.classList.add('editor-paragraph');
  //       }

  //       if (className) {
  //         if (className.startsWith('text-')) {
  //           const alignmentClasses = [
  //             'text-left',
  //             'text-center',
  //             'text-right',
  //             'text-justify',
  //           ];
  //           alignmentClasses.forEach((cls) => newElement.classList.remove(cls));
  //         }
  //         newElement.classList.add(className);
  //       }

  //       // Replace the element
  //       targetElement.parentNode?.replaceChild(newElement, targetElement);

  //       // Restore selection more reliably
  //       setTimeout(() => {
  //         try {
  //           const newSelection = window.getSelection();
  //           if (!newSelection) return;

  //           const newRange = document.createRange();

  //           if (originalText) {
  //             // Try to find the same text content
  //             const walker = document.createTreeWalker(
  //               newElement,
  //               NodeFilter.SHOW_TEXT,
  //               null
  //             );

  //             let textNode: Node | null = null;
  //             while (walker.nextNode()) {
  //               const node = walker.currentNode;
  //               if (
  //                 node.textContent &&
  //                 node.textContent.includes(originalText)
  //               ) {
  //                 textNode = node;
  //                 break;
  //               }
  //             }

  //             if (textNode) {
  //               const textContent = textNode.textContent || '';
  //               const textStart = Math.min(startOffset, textContent.length);
  //               const textEnd = Math.min(endOffset, textContent.length);

  //               newRange.setStart(textNode, textStart);
  //               newRange.setEnd(textNode, textEnd);
  //             } else {
  //               // Fallback: select the entire element
  //               newRange.selectNodeContents(newElement);
  //             }
  //           } else {
  //             // No text selected, just position cursor
  //             const firstTextNode = newElement.firstChild;
  //             if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
  //               newRange.setStart(
  //                 firstTextNode,
  //                 Math.min(startOffset, firstTextNode.textContent?.length || 0)
  //               );
  //               newRange.collapse(true);
  //             } else {
  //               newRange.setStart(newElement, 0);
  //               newRange.collapse(true);
  //             }
  //           }

  //           newSelection.removeAllRanges();
  //           newSelection.addRange(newRange);
  //         } catch (selectionError) {
  //           console.warn('Could not restore selection:', selectionError);
  //           // Final fallback - just focus the editor
  //           if (editor) {
  //             editor.focus();
  //           }
  //         }
  //       }, 0);
  //     } catch (error) {
  //       console.error('Error toggling block style:', error);
  //     }

  //     updateContent();
  //     setTimeout(detectActiveStyles, 50);
  //   },
  //   [editorRef, updateContent, detectActiveStyles]
  // );

  // const toggleBlockStyle = useCallback(
  //   (tagName: string, className?: string) => {
  //     const selection = window.getSelection();
  //     const editor = editorRef?.current;
  //     if (!selection || !editor) return;

  //     // Save selection
  //     const range = selection.getRangeAt(0);
  //     const selectedText = range.toString();

  //     // Find target paragraph
  //     let targetElement = range.startContainer;
  //     while (targetElement && targetElement.nodeType !== Node.ELEMENT_NODE) {
  //       targetElement = targetElement.parentNode as Node;
  //     }
  //     while (
  //       targetElement &&
  //       !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(
  //         (targetElement as Element).tagName
  //       )
  //     ) {
  //       targetElement = targetElement.parentNode as Node;
  //       if (targetElement === editor) break;
  //     }

  //     if (!targetElement || targetElement === editor) return;

  //     const element = targetElement as HTMLElement;
  //     const currentTag = element.tagName.toLowerCase();
  //     const newTag = currentTag === tagName.toLowerCase() ? 'p' : tagName;

  //     // Change the tag name
  //     const newElement = document.createElement(newTag);
  //     newElement.innerHTML = element.innerHTML;
  //     newElement.className = element.className;

  //     if (newTag === 'p') {
  //       newElement.classList.add('editor-paragraph');
  //     }

  //     element.parentNode?.replaceChild(newElement, element);

  //     // Restore focus
  //     editor.focus();

  //     updateContent();
  //     detectActiveStyles();
  //   },
  //   [editorRef, updateContent, detectActiveStyles]
  // );

  const toggleBlockStyle = useCallback(
    (tagName: string, className?: string) => {
      const selection = window.getSelection();
      const editor = editorRef?.current;
      if (!selection || !editor || selection.rangeCount === 0) return;

      let targetElement: HTMLElement | null = null;

      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;

      // Navigate up to find the target block element
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

      // Store the original selection info before manipulation
      const originalText = range.toString();
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      try {
        const currentTag = targetElement.tagName.toLowerCase();

        // Handle className-only changes (like text alignment)
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
          updateContent();
          setTimeout(detectActiveStyles, 50);
          return;
        }

        // Handle tag changes (like h1, h2, p)
        // If tagName is empty/undefined, keep the current tag
        const newTag = !tagName
          ? currentTag
          : currentTag === tagName.toLowerCase()
            ? 'p'
            : tagName;
        const newElement = document.createElement(newTag);

        // Copy content
        newElement.innerHTML = targetElement.innerHTML;

        // Handle classes
        if (targetElement.className) {
          newElement.className = targetElement.className;
        }

        // Add editor-paragraph class if it's a paragraph
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

        // Replace the element
        targetElement.parentNode?.replaceChild(newElement, targetElement);

        // Restore selection more reliably
        setTimeout(() => {
          try {
            const newSelection = window.getSelection();
            if (!newSelection) return;

            const newRange = document.createRange();

            if (originalText) {
              // Try to find the same text content
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
                // Fallback: select the entire element
                newRange.selectNodeContents(newElement);
              }
            } else {
              // No text selected, just position cursor
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
            // Final fallback - just focus the editor
            if (editor) {
              editor.focus();
            }
          }
        }, 0);
      } catch (error) {
        console.error('Error toggling block style:', error);
      }

      updateContent();
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

      // Find the current block element or list item
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

        // Save selection info
        const textContent = targetElement.textContent || '';
        const startOffset = range.startOffset;

        if (isInList && isCurrentListType) {
          // Remove from list - convert back to paragraph
          const newP = document.createElement('p');
          newP.innerHTML = targetElement.innerHTML;

          // If this is the only item in the list, replace the entire list
          const listItems = currentList!.querySelectorAll('li');
          if (listItems.length === 1) {
            currentList!.parentNode?.replaceChild(newP, currentList!);
          } else {
            // Replace just this list item with a paragraph after the list
            currentList!.parentNode?.insertBefore(
              newP,
              currentList!.nextSibling
            );
            targetElement.remove();
          }

          targetElement = newP;
        } else if (isInList && !isCurrentListType) {
          // Change list type
          const newList = document.createElement(listType);
          newList.innerHTML = currentList!.innerHTML;
          currentList!.parentNode?.replaceChild(newList, currentList!);
        } else {
          // Convert to list item
          const newList = document.createElement(listType);
          const newLi = document.createElement('li');
          newLi.innerHTML = targetElement.innerHTML;
          newList.appendChild(newLi);

          targetElement.parentNode?.replaceChild(newList, targetElement);
          targetElement = newLi;
        }

        // Restore cursor position
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

      updateContent();
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

      updateContent();
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
      // if (inlineStyles.includes(tag.toLowerCase()) && !className) {
      //   toggleInlineStyle(tag);
      // } else if (blockStyles.includes(tag.toLowerCase()) || className) {
      //   toggleBlockStyle(tag, className);
      // } else {
      //   toggleInlineStyle(tag);
      // }
      if (listStyles.includes(tag.toLowerCase())) {
        toggleListStyle(tag.toLowerCase() as 'ul' | 'ol');
      } else if (alignmentClasses.includes(className || '')) {
        toggleAlignment(className as string);
      } else if (inlineStyles.includes(tag.toLowerCase()) && !className) {
        toggleInlineStyle(tag);
      } else if (blockStyles.includes(tag.toLowerCase()) || className) {
        // Fix: Don't pass empty tag names
        const validTag =
          tag && blockStyles.includes(tag.toLowerCase()) ? tag : undefined;
        toggleBlockStyle(validTag as string, className);
      } else {
        toggleInlineStyleWithClasses(tag);
      }

      updateContent();
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
      // if (range.collapsed) {
      //   const expandedRange = expandSelectionToWord(range);
      //   if (!expandedRange.collapsed) {
      //     range = expandedRange;
      //     selection.removeAllRanges();
      //     selection.addRange(range);
      //   } else {
      //     setCurrentTextColor(color);
      //     return;
      //   }
      // }

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
      updateContent();
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
        updateContent();
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
