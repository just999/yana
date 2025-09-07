import '@tiptap/extension-text-style';

import { Extension } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (size: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export interface LineHeightOptions {
  types: string[];
  defaultLineHeight: string;
  lineHeights: string[];
}
export const LineHeightExtension = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: 'normal',
      lineHeights: [
        '1',
        '1.15',
        '1.25',
        '1.5',
        '1.75',
        '2',
        '2.5',
        '3',
        'normal',
      ],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (
                !attributes.lineHeight ||
                attributes.lineHeight === this.options.defaultLineHeight
              ) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
            parseHTML: (element) => {
              const lineHeight = element.style.lineHeight;
              // Normalize the value - if it's empty, default, or 'normal', return null
              if (
                !lineHeight ||
                lineHeight === 'normal' ||
                lineHeight === this.options.defaultLineHeight
              ) {
                return null;
              }
              return lineHeight;
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ tr, state, dispatch, chain }) => {
          // Validate line height value
          if (!this.options.lineHeights.includes(lineHeight)) {
            console.warn(`Invalid line height: ${lineHeight}`);
            return false;
          }

          const { selection } = state;
          const { from, to } = selection;

          // Check if we have any valid nodes to modify
          let hasValidNodes = false;
          state.doc.nodesBetween(from, to, (node) => {
            if (this.options.types.includes(node.type.name)) {
              hasValidNodes = true;
            }
          });

          if (!hasValidNodes) {
            return false;
          }

          // Apply line height to valid nodes
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight,
              });
            }
          });

          if (dispatch) dispatch(tr);
          return true;
        },

      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          let hasChanges = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (
              this.options.types.includes(node.type.name) &&
              node.attrs.lineHeight !== this.options.defaultLineHeight
            ) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight: this.options.defaultLineHeight,
              });
              hasChanges = true;
            }
          });

          if (!hasChanges) {
            return false;
          }

          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },

  // Add keyboard shortcuts (optional)
  addKeyboardShortcuts() {
    return {
      // Ctrl/Cmd + Shift + L for line height menu (you can customize this)
      'Mod-Shift-l': () => {
        // You could trigger a line height selector here
        return true;
      },
    };
  },
});
