import { mergeAttributes, Node, NodeViewRendererProps } from '@tiptap/core';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import ImageResize from 'tiptap-extension-resize-image';

// Define types for the node view props
interface CustomNodeViewRendererProps extends NodeViewRendererProps {
  HTMLAttributes: Record<string, any>;
}

export const CustomImageResize = ImageResize.extend({
  name: 'customImageResize',

  addAttributes() {
    // Use a type assertion to access parent method
    const parentAttributes = (this as any).parent?.() || {};

    return {
      ...parentAttributes,
      // Add custom attributes to the main image element
      'data-image-id': {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-image-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes['data-image-id']) {
            return {};
          }
          return {
            'data-image-id': attributes['data-image-id'],
          };
        },
      },
      // Add classes for different resize states
      'data-resize-state': {
        default: 'idle',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-resize-state') || 'idle',
        renderHTML: (attributes: Record<string, any>) => ({
          'data-resize-state': attributes['data-resize-state'],
        }),
      },
    };
  },

  addNodeView() {
    return ({
      node,
      HTMLAttributes,
      getPos,
      editor,
    }: CustomNodeViewRendererProps) => {
      const container = document.createElement('div');
      const img = document.createElement('img');

      // Add classes to main container
      container.className = 'image-resize-container relative inline-block';
      container.setAttribute('data-type', 'resizableImage');

      // Set up the image
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'max-w-full h-auto';

      // Apply custom attributes
      Object.keys(HTMLAttributes).forEach((key) => {
        if (key.startsWith('data-') || key === 'class') {
          container.setAttribute(key, HTMLAttributes[key]);
        }
      });

      container.appendChild(img);

      // Create resize handles with custom classes
      const createResizeHandle = (position: string, cursor: string) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${position} absolute w-2 h-2 bg-blue-500 border border-white rounded-sm opacity-0 transition-opacity duration-200`;
        handle.style.cursor = cursor;

        // Position-specific classes
        switch (position) {
          case 'nw':
            handle.classList.add('-top-1', '-left-1');
            break;
          case 'n':
            handle.classList.add('-top-1', 'left-1/2', '-translate-x-1/2');
            break;
          case 'ne':
            handle.classList.add('-top-1', '-right-1');
            break;
          case 'e':
            handle.classList.add('top-1/2', '-translate-y-1/2', '-right-1');
            break;
          case 'se':
            handle.classList.add('-bottom-1', '-right-1');
            break;
          case 's':
            handle.classList.add('-bottom-1', 'left-1/2', '-translate-x-1/2');
            break;
          case 'sw':
            handle.classList.add('-bottom-1', '-left-1');
            break;
          case 'w':
            handle.classList.add('top-1/2', '-translate-y-1/2', '-left-1');
            break;
        }

        // Add resize functionality
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          // Add your resize logic here
          container.setAttribute('data-resize-state', 'resizing');
          handle.classList.add('opacity-100');
        });

        return handle;
      };

      // Create all resize handles
      const handles = [
        createResizeHandle('nw', 'nw-resize'),
        createResizeHandle('n', 'n-resize'),
        createResizeHandle('ne', 'ne-resize'),
        createResizeHandle('e', 'e-resize'),
        createResizeHandle('se', 'se-resize'),
        createResizeHandle('s', 's-resize'),
        createResizeHandle('sw', 'sw-resize'),
        createResizeHandle('w', 'w-resize'),
      ];

      handles.forEach((handle) => container.appendChild(handle));

      // Create alignment toolbar
      const alignmentToolbar = document.createElement('div');
      alignmentToolbar.className =
        'alignment-toolbar absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity duration-200';
      alignmentToolbar.style.cssText = `
        width: 66px;
        height: 25px;
        z-index: 999;
        background-color: rgba(255, 255, 255, 1);
        border-radius: 3px;
        border: 1px solid #6C6C6C;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 6px;
      `;

      // Add alignment buttons
      const leftAlignBtn = document.createElement('img');
      leftAlignBtn.src =
        'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg';
      leftAlignBtn.className =
        'w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity';

      const rightAlignBtn = document.createElement('img');
      rightAlignBtn.src =
        'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg';
      rightAlignBtn.className =
        'w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity';

      alignmentToolbar.appendChild(leftAlignBtn);
      alignmentToolbar.appendChild(rightAlignBtn);
      container.appendChild(alignmentToolbar);

      // Show/hide handles and toolbar on hover
      container.addEventListener('mouseenter', () => {
        handles.forEach((handle) => handle.classList.remove('opacity-0'));
        alignmentToolbar.classList.remove('opacity-0');
        container.setAttribute('data-resize-state', 'hover');
      });

      container.addEventListener('mouseleave', () => {
        if (container.getAttribute('data-resize-state') !== 'resizing') {
          handles.forEach((handle) => handle.classList.add('opacity-0'));
          alignmentToolbar.classList.add('opacity-0');
          container.setAttribute('data-resize-state', 'idle');
        }
      });

      return {
        dom: container,
        contentDOM: null,
        update: (updatedNode: ProsemirrorNode) => {
          if (updatedNode.type.name !== node.type.name) return false;

          // Update image attributes
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';

          return true;
        },
        destroy: () => {
          container.remove();
        },
      };
    };
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'resizableImage',
          class: 'image-resize-container relative inline-block',
        },
        HTMLAttributes
      ),
      [
        'img',
        mergeAttributes(
          {
            class: 'max-w-full h-auto',
            draggable: false,
          },
          HTMLAttributes
        ),
      ],
    ];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="resizableImage"]',
        getAttrs: (element: HTMLElement) => {
          const img = element.querySelector('img');
          return img ? { src: img.src, alt: img.alt } : false;
        },
      },
    ];
  },
});
