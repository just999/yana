// import '@tiptap/extension-text-style';

// import { Extension } from '@tiptap/react';

// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     fontSize: {
//       setFontSize: (size: string) => ReturnType;
//       unsetFontSize: () => ReturnType;
//     };
//   }
// }

// export const FontSizeExtension = Extension.create({
//   name: 'fontSize',
//   addOptions() {
//     return {
//       types: ['textStyle'],
//     };
//   },
//   addGlobalAttributes() {
//     return [
//       {
//         types: this.options.types,
//         attributes: {
//           fontSize: {
//             default: null,
//             parseHTML: (element) => element.style.fontSize,
//             renderHTML: (attributes) => {
//               if (!attributes.fontSize) {
//                 return {};
//               }

//               return {
//                 style: `font-size: ${attributes.fontSize}`,
//               };
//             },
//           },
//         },
//       },
//     ];
//   },
//   addCommands() {
//     return {
//       setFontSize:
//         (fontSize: string) =>
//         ({ chain }) => {
//           return chain().setMark('textStyle', { fontSize }).run();
//         },
//       unsetFontSize:
//         () =>
//         ({ chain }) => {
//           return chain()
//             .setMark('textStyle', { fontSize: null })
//             .removeEmptyTextStyle()
//             .run();
//         },
//     };
//   },
// });

import '@tiptap/extension-text-style';

import { Extension } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSizeExtension = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const fontSize = element.style.fontSize;
              if (!fontSize) return null;

              const numValue = parseFloat(fontSize.replace('px', ''));

              // Only allow specific font sizes
              const allowedSizes = [
                8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
              ];

              if (!allowedSizes.includes(Math.round(numValue))) {
                return null; // Don't capture weird sizes
              }

              return `${Math.round(numValue)}px`;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
