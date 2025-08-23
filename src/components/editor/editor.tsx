// 'use client';

// import { useState } from 'react';

// import { JSONContent } from '@tiptap/react';
// import hljs from 'highlight.js';
// import { EditorContent, EditorInstance, EditorRoot } from 'novel';

// import { defaultExtensions } from './extensions';
// import { slashCommand } from './slash-command';

// const extensions = [...defaultExtensions, slashCommand];

// export const defaultEditorContent = {
//   type: 'doc',
//   content: [
//     {
//       type: 'paragraph',
//       content: [],
//     },
//   ],
// };

// type EditorProps = {
//   initialValue?: JSONContent;
//   onChange: (content: string) => void;
// };

// const Editor = ({ initialValue, onChange }: EditorProps) => {
//   const [content, setContent] = useState<JSONContent | undefined>(undefined);

//   //Apply Codeblock Highlighting on the HTML from editor.getHTML()
//   const highlightCodeblocks = (content: string) => {
//     const doc = new DOMParser().parseFromString(content, 'text/html');
//     doc.querySelectorAll('pre code').forEach((el) => {
//       // @ts-expect-error:  Legacy API expects string but we're migrating to number type
//       // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
//       hljs.highlightElement(el);
//     });
//     return new XMLSerializer().serializeToString(doc);
//   };

//   return (
//     <div className='relative w-full max-w-screen-lg'>
//       <EditorRoot>
//         <EditorContent
//           initialContent={content}
//           extensions={extensions}
//           onUpdate={({ editor }) => {
//             const json = editor.getJSON();
//             setContent(json);
//           }}
//           onSelectionUpdate={({ editor }) => {
//             onChange(editor.getHTML());
//           }}
//         >
//           Editor content
//         </EditorContent>
//       </EditorRoot>
//     </div>
//   );
// };

// export default Editor;
