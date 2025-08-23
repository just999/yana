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

export function normalizeEditorContent(editor: HTMLElement | null): void {
  if (!editor) return;

  const selection = window.getSelection();
  const savedRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const childNodes = Array.from(editor.childNodes);
  let hasChanges = false;

  for (let i = childNodes.length - 1; i >= 0; i--) {
    const node = childNodes[i];

    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const p = document.createElement('p');
      p.classList.add('editor-paragraph');
      p.className = 'editor-paragraph';

      editor.insertBefore(p, node);

      p.appendChild(node);
      hasChanges = true;
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      isInlineElement(node as Element) &&
      node.nodeName !== 'IMG'
    ) {
      console.log('Creating paragraph with class "editor-paragraph"');
      const p = document.createElement('p');
      p.className = 'editor-paragraph';
      p.classList.add('editor-paragraph');
      console.log('Paragraph class:', p.className);

      editor.insertBefore(p, node);

      p.appendChild(node);
      hasChanges = true;
    } else if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      node.remove();
      hasChanges = true;
    }
  }

  const newChildNodes = Array.from(editor.childNodes);
  let currentInlineGroup: Node[] = [];

  for (let i = 0; i < newChildNodes.length; i++) {
    const node = newChildNodes[i];

    if (shouldGroupInParagraph(node)) {
      currentInlineGroup.push(node);
    } else {
      if (currentInlineGroup.length > 0) {
        wrapInParagraph(editor, currentInlineGroup);
        currentInlineGroup = [];
        hasChanges = true;
      }
    }
  }

  if (currentInlineGroup.length > 0) {
    wrapInParagraph(editor, currentInlineGroup);
    hasChanges = true;
  }

  if (editor.children.length === 0) {
    const p = document.createElement('p');
    p.className = 'editor-paragraph';
    p.classList.add('editor-paragraph');
    p.innerHTML = '<br>';
    editor.appendChild(p);
    hasChanges = true;
  }

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

function shouldGroupInParagraph(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    return true;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;

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

function wrapInParagraph(editor: HTMLElement, nodes: Node[]): void {
  if (nodes.length === 0) return;

  const p = document.createElement('p');
  p.className = 'editor-paragraph';
  p.classList.add('editor-paragraph');
  const firstNode = nodes[0];

  p.setAttribute('data-paragraph-type', 'editor');

  editor.insertBefore(p, firstNode);

  nodes.forEach((node) => {
    p.appendChild(node);
  });
}
