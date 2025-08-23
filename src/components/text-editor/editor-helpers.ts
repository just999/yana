// utils/rangeUtils.ts

import { isInlineElement } from '../rich-text-editor/editor-helper';

export function expandSelectionToWord(range: Range): Range {
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
}

// !FIND PARENT ELEMENT
export function findParentElement(
  node: Node | null,
  tagName: string,
  boundaryElement?: HTMLElement | null
): HTMLElement | null {
  while (node && node !== boundaryElement) {
    if (
      node instanceof HTMLElement &&
      node.tagName.toLowerCase() === tagName.toLowerCase()
    ) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

// !2. Add function to normalize editor content structure
// export function normalizeEditorContent(editor: HTMLElement | null): void {
//   if (!editor) return;

//   const selection = window.getSelection();
//   const savedRange =
//     selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

//   const childNodes = Array.from(editor.childNodes);
//   let hasChanges = false;

//   childNodes.forEach((node) => {
//     if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
//       const p = document.createElement('p');
//       editor.insertBefore(p, node);
//       p.appendChild(node);
//       hasChanges = true;
//     } else if (
//       node.nodeType === Node.ELEMENT_NODE &&
//       isInlineElement(node as Element)
//     ) {
//       const p = document.createElement('p');
//       editor.insertBefore(p, node);
//       p.appendChild(node);
//       hasChanges = true;
//     }
//   });

//   if (hasChanges && savedRange) {
//     try {
//       selection?.removeAllRanges();
//       selection?.addRange(savedRange);
//     } catch (e) {
//       const lastP = editor.querySelector('p:last-child');
//       if (lastP) {
//         const range = document.createRange();
//         range.selectNodeContents(lastP);
//         range.collapse(false);
//         selection?.removeAllRanges();
//         selection?.addRange(range);
//       }
//     }
//   }
// }

export function normalizeEditorContent(editor: HTMLElement | null): void {
  if (!editor) return;

  const selection = window.getSelection();
  const savedRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  // Process nodes from end to beginning to avoid index shifting issues
  const childNodes = Array.from(editor.childNodes);
  let hasChanges = false;

  // Reverse iteration to avoid issues with DOM manipulation affecting indices
  for (let i = childNodes.length - 1; i >= 0; i--) {
    const node = childNodes[i];

    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      // Create wrapper paragraph
      const p = document.createElement('p');
      p.classList.add('editor-paragraph');
      p.className = 'editor-paragraph';

      // Insert the paragraph at the EXACT position of the text node
      editor.insertBefore(p, node);

      // Move the text node into the paragraph
      p.appendChild(node);
      hasChanges = true;
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      isInlineElement(node as Element) &&
      node.nodeName !== 'IMG' // Don't wrap images in paragraphs
    ) {
      // Create wrapper paragraph for inline elements (except images)
      console.log('Creating paragraph with class "editor-paragraph"');
      const p = document.createElement('p');
      p.className = 'editor-paragraph';
      p.classList.add('editor-paragraph');
      console.log('Paragraph class:', p.className);
      // Insert the paragraph at the EXACT position of the inline element
      editor.insertBefore(p, node);

      // Move the inline element into the paragraph
      p.appendChild(node);
      hasChanges = true;
    } else if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      // Remove empty text nodes (whitespace only)
      node.remove();
      hasChanges = true;
    }
  }

  // Group consecutive inline elements (including images) with text into paragraphs
  const newChildNodes = Array.from(editor.childNodes);
  let currentInlineGroup: Node[] = [];

  for (let i = 0; i < newChildNodes.length; i++) {
    const node = newChildNodes[i];

    if (shouldGroupInParagraph(node)) {
      currentInlineGroup.push(node);
    } else {
      // If we have accumulated inline elements, wrap them in a paragraph
      if (currentInlineGroup.length > 0) {
        wrapInParagraph(editor, currentInlineGroup);
        currentInlineGroup = [];
        hasChanges = true;
      }
    }
  }

  // Handle remaining inline group
  if (currentInlineGroup.length > 0) {
    wrapInParagraph(editor, currentInlineGroup);
    hasChanges = true;
  }

  // Ensure there's always at least one paragraph for editing
  if (editor.children.length === 0) {
    const p = document.createElement('p');
    p.className = 'editor-paragraph';
    p.classList.add('editor-paragraph');
    p.innerHTML = '<br>';
    editor.appendChild(p);
    hasChanges = true;
  }

  // Ensure the last element allows for continued editing
  const lastChild = editor.lastElementChild;
  if (lastChild && lastChild.tagName !== 'P') {
    const p = document.createElement('p');
    p.className = 'editor-paragraph';
    p.classList.add('editor-paragraph');
    p.innerHTML = '<br>';
    editor.appendChild(p);
    hasChanges = true;
  }

  if (hasChanges && savedRange) {
    try {
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    } catch (e) {
      const lastP = editor.querySelector('p:last-child');
      if (lastP) {
        const range = document.createRange();
        range.selectNodeContents(lastP);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }
}

// Helper function to determine if a node should be grouped in a paragraph
function shouldGroupInParagraph(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    return true;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    // Include images and other inline elements
    return (
      element.tagName === 'IMG' ||
      element.tagName === 'SPAN' ||
      element.tagName === 'STRONG' ||
      element.tagName === 'EM' ||
      element.tagName === 'A' ||
      isInlineElement(element)
    );
  }
  return false;
}

// Helper function to wrap a group of nodes in a paragraph
function wrapInParagraph(editor: HTMLElement, nodes: Node[]): void {
  if (nodes.length === 0) return;

  const p = document.createElement('p');
  p.className = 'editor-paragraph';
  p.classList.add('editor-paragraph');
  const firstNode = nodes[0];

  // Add a data attribute as backup
  p.setAttribute('data-paragraph-type', 'editor');

  // Insert paragraph before the first node
  editor.insertBefore(p, firstNode);

  // Move all nodes into the paragraph
  nodes.forEach((node) => {
    p.appendChild(node);
  });
}
