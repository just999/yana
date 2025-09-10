// // // 'use client';

// // // import DOMPurify from 'dompurify';
// // // import { Dot, Ellipsis } from 'lucide-react';

// // // type BlogContentProps = {
// // //   content: string;
// // // };

// // // const BlogContent = ({ content }: BlogContentProps) => {
// // //   const contentValue = DOMPurify.sanitize(content, {
// // //     ALLOWED_TAGS: [
// // //       'img',
// // //       'div',
// // //       'span',
// // //       'p',
// // //       'a',
// // //       'br',
// // //       'strong',
// // //       'em',
// // //       'ul',
// // //       'li',
// // //       'ol',
// // //       'h1',
// // //       'h2',
// // //       'h3',
// // //       'h4',
// // //       'h5',
// // //       'h6',
// // //     ],
// // //     ALLOWED_ATTR: [
// // //       'src',
// // //       'alt',
// // //       'data-image-id',
// // //       'style',
// // //       'class',
// // //       'width',
// // //       'height',
// // //     ],
// // //     ALLOWED_URI_REGEXP: /^data:image\/|^blob:|^https?:\/\//,
// // //   });
// // //   return (
// // //     <div className='flex flex-col items-center justify-center py-8'>
// // //       <div
// // //         className='prose prose-sm max-w-none px-8 py-0 text-justify dark:text-stone-700'
// // //         dangerouslySetInnerHTML={{
// // //           __html: contentValue,
// // //         }}
// // //       />
// // //       <span className='mx-auto flex w-full justify-center text-center'>
// // //         <Ellipsis size={24} className='text-black' />
// // //       </span>
// // //     </div>
// // //   );
// // // };

// // // export default BlogContent;

// // 'use client';

// // import { useEffect, useState } from 'react';

// // import DOMPurify from 'dompurify';
// // import { Dot, Ellipsis } from 'lucide-react';

// // type BlogContentProps = {
// //   content: string;
// // };

// // const BlogContent = ({ content }: BlogContentProps) => {
// //   const [isClient, setIsClient] = useState(false);

// //   const [mounted, setMounted] = useState(false);

// //   useEffect(() => {
// //     setIsClient(true);
// //     setMounted(true);
// //   }, []);

// //   const contentValue = DOMPurify.sanitize(content, {
// //     ALLOWED_TAGS: [
// //       'img',
// //       'div',
// //       'span',
// //       'p',
// //       'a',
// //       'br',
// //       'strong',
// //       'em',
// //       'ul',
// //       'li',
// //       'ol',
// //       'h1',
// //       'h2',
// //       'h3',
// //       'h4',
// //       'h5',
// //       'h6',
// //       'table',
// //       'tbody',
// //       'thead',
// //       'tr',
// //       'td',
// //       'th',
// //       'colgroup',
// //       'col',
// //       'caption',
// //     ],
// //     ALLOWED_ATTR: [
// //       'src',
// //       'alt',
// //       'data-image-id',
// //       'style',
// //       'class',
// //       'width',
// //       'height',
// //       'colspan',
// //       'rowspan',
// //       'scope',
// //       'min-width', // min-width for your col styles
// //     ],
// //     ALLOWED_URI_REGEXP: /^data:image\/|^blob:|^https?:\/\//,
// //     // Allow style attributes on table elements
// //     ALLOW_ARIA_ATTR: false,
// //     ALLOW_DATA_ATTR: false,
// //   });

// //   if (!isClient || !mounted) {
// //     return null;
// //   }

// //   return (
// //     <div className='flex flex-col items-center justify-center py-8'>
// //       <div
// //         className='prose prose-sm max-w-none px-8 py-0 text-justify dark:text-stone-700'
// //         dangerouslySetInnerHTML={{
// //           __html: contentValue,
// //         }}
// //       />
// //       <span className='mx-auto flex w-full justify-center text-center'>
// //         <Ellipsis size={24} className='text-black' />
// //       </span>
// //     </div>
// //   );
// // };

// // export default BlogContent;

// 'use client';

// import { useEffect, useState } from 'react';

// import { useEditorExtensions } from '@/hooks/use-editor-extensions';
// import { editorStateAtom } from '@/lib/jotai/editor-atoms';
// // Your extensions hook
// import { EditorContent, useEditor } from '@tiptap/react';
// import { useAtomValue } from 'jotai';
// import { Ellipsis } from 'lucide-react';

// type BlogContentProps = {
//   content: string;
// };

// const BlogContent = ({ content }: BlogContentProps) => {

//   const [mounted, setMounted] = useState(false);

//   const editorState = useAtomValue(editorStateAtom);

//   const { editor } = editorState;

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (mounted && editor && content) {
//       // Temporarily make editor read-only and set content
//       const wasEditable = editor.isEditable;
//       editor.setEditable(false);
//       editor.commands.setContent(content, { emitUpdate: false });

//       // Restore original editable state if needed
//       // editor.setEditable(wasEditable);
//     }
//   }, [editor, content, mounted]);

//   if (!mounted || !content) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className='flex flex-col items-center justify-center py-8'>
//       <div
//         className='prose prose-sm max-w-none px-8 py-0 text-justify dark:text-stone-700'
//         dangerouslySetInnerHTML={{
//           __html: content,
//         }}
//       />
//       {/* <EditorContent editor={editor} /> */}
//       <span className='mx-auto flex w-full justify-center text-center'>
//         <Ellipsis size={24} className='text-black' />
//       </span>
//     </div>
//   );
// };

// export default BlogContent;

// 'use client';

// import { useEffect, useMemo, useState } from 'react';

// import { useEditorExtensions } from '@/hooks/use-editor-extensions';
// import { editorStateAtom } from '@/lib/jotai/editor-atoms';
// import { Editor, generateHTML } from '@tiptap/core';
// import type { JSONContent } from '@tiptap/core';
// import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
// import Document from '@tiptap/extension-document';
// import Link from '@tiptap/extension-link';
// import Paragraph from '@tiptap/extension-paragraph';
// import StarterKit from '@tiptap/starter-kit';
// import bash from 'highlight.js/lib/languages/bash';
// import js from 'highlight.js/lib/languages/javascript';
// import javascript from 'highlight.js/lib/languages/javascript';
// import json from 'highlight.js/lib/languages/json';
// import python from 'highlight.js/lib/languages/python';
// import ts from 'highlight.js/lib/languages/typescript';
// import typescript from 'highlight.js/lib/languages/typescript';
// import html from 'highlight.js/lib/languages/xml';
// import { useAtomValue } from 'jotai';
// import { all, createLowlight } from 'lowlight';
// // import DOMPurify from 'dompurify';
// import { Ellipsis } from 'lucide-react';

// import css from 'highlight.js/lib/languages/css';

// type BlogContentProps = {
//   content: any | JSONContent;
// };

// const BlogContent = ({ content }: BlogContentProps) => {
//   const [mounted, setMounted] = useState(false);
//   const [htmlContent, setHtmlContent] = useState('');
//   const [sanitizedContent, setSanitizedContent] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   // const editorState = useAtomValue(editorStateAtom);
//   // const { editor } = editorState;

//   const extensions = useEditorExtensions();

//   // const convertJsonToHtml = (jsonContent: string): string => {
//   //   try {
//   //     // Parse JSON content
//   //     const parsedContent = JSON.parse(jsonContent);

//   //     // Create temporary editor
//   //     const tempEditor = new Editor({
//   //       extensions,
//   //       content: parsedContent,
//   //     });

//   //     // Get HTML
//   //     const html = tempEditor.getHTML();

//   //     // Destroy editor to prevent memory leaks
//   //     tempEditor.destroy();

//   //     return html;
//   //   } catch (error) {
//   //     console.error('Error converting JSON to HTML:', error);
//   //     // Fallback: treat as HTML or plain text
//   //     return content;
//   //   }
//   // };
//   const lowlight = createLowlight(all);

//   lowlight.register('html', html);
//   lowlight.register('css', css);
//   lowlight.register('js', js);
//   lowlight.register('ts', ts);
//   lowlight.register('javascript', javascript);
//   lowlight.register('typescript', typescript);
//   lowlight.register('python', python);
//   lowlight.register('html', html);
//   lowlight.register('json', json);
//   lowlight.register('bash', bash);

//   const editor = new Editor({
//     element: document.querySelector('#code-block-custom'),
//     extensions: [
//       StarterKit.configure({
//         link: false,
//         codeBlock: false,
//         paragraph: false,
//       }),
//       Document,
//       Paragraph.configure({
//         HTMLAttributes: {
//           class: 'paragraph-class',
//         },
//       }),
//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         defaultProtocol: 'https',
//       }),
//       CodeBlockLowlight.configure({
//         lowlight,
//       }),
//     ],
//     content,
//     editable: false,
//   });

//   // Only run on client side
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // useEffect(() => {
//   //   if (mounted && content) {
//   //     setIsLoading(true);

//   //     // Check if content is JSON or already HTML
//   //     const isJsonContent =
//   //       content.trim().startsWith('{') && content.trim().endsWith('}');

//   //     if (isJsonContent) {
//   //       const html = convertJsonToHtml(content);
//   //       setHtmlContent(html);
//   //     } else {
//   //       // Already HTML or plain text
//   //       setHtmlContent(content);
//   //     }

//   //     setIsLoading(false);
//   //   }
//   // }, [mounted, content]);

//   const jsonData = editor?.getJSON();

//   const parseJson = JSON.parse(content);

//   const output = useMemo(() => {
//     return generateHTML(parseJson, [
//       StarterKit.configure({
//         link: false,
//         codeBlock: false,
//         paragraph: false,
//       }),
//       Document,
//       Paragraph.configure({
//         HTMLAttributes: {
//           class: 'paragraph-class',
//         },
//       }),
//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         defaultProtocol: 'https',
//       }),
//       CodeBlockLowlight.configure({
//         lowlight,
//       }),
//     ]);
//   }, []);

//   if (!mounted || !isLoading) {
//     return (
//       <div className='flex flex-col items-center justify-center py-8'>
//         <div className='prose prose-sm max-w-none px-8 py-0'>
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='dark:bg-accent/90 flex flex-col items-center justify-center py-8'>
//       {/* <div
//         className='prose prose-sm max-w-none px-8 py-0 text-justify dark:text-stone-100'
//         dangerouslySetInnerHTML={{
//           __html: output,
//         }}
//       /> */}
//       <pre>
//         <code className='prose prose-sm max-w-none px-8 py-0 text-justify text-nowrap dark:text-stone-100'>
//           {output}
//         </code>
//       </pre>
//       <span className='mx-auto flex w-full justify-center text-center'>
//         <Ellipsis size={24} className='text-black' />
//       </span>
//     </div>
//   );
// };

// export default BlogContent;

'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  useEditorExtensions,
  useOptimizedEditor,
} from '@/hooks/use-editor-extensions';
import { useSlugNavigation } from '@/hooks/use-slug-navigation';
import {
  editorContentAtom,
  editorStateAtom,
  setEditorAtom,
} from '@/lib/jotai/editor-atoms';
import type { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
// import { generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Document } from '@tiptap/extension-document';
import { Link } from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { generateHTML } from '@tiptap/html';
import { StarterKit } from '@tiptap/starter-kit';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import bash from 'highlight.js/lib/languages/bash';
import js from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import ts from 'highlight.js/lib/languages/typescript';
// Import specific languages you want to support
import html from 'highlight.js/lib/languages/xml';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { all, createLowlight } from 'lowlight';
import { Ellipsis } from 'lucide-react';

import SlugNavigation from './slug-navigation';

import css from 'highlight.js/lib/languages/css';

type BlogContentProps = {
  slug: string;
  blogs: PostProps[];
  content: string; // Assuming content is a JSON string
};

const BlogContent = ({ content, blogs, slug }: BlogContentProps) => {
  const [mounted, setMounted] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const setEditor = useSetAtom(setEditorAtom);
  const [value, setValue] = useAtom(editorContentAtom);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { previousPost, nextPost, currentPost } = useSlugNavigation(
    blogs,
    slug
  );
  // Create lowlight instance with languages
  // const lowlight = useMemo(() => {
  //   if (typeof window === 'undefined') {
  //     return null;
  //   }
  //   const lowlightInstance = createLowlight(all);

  //   // Register additional languages
  //   lowlightInstance.register('html', html);
  //   lowlightInstance.register('css', css);
  //   lowlightInstance.register('js', js);
  //   lowlightInstance.register('javascript', js); // alias
  //   lowlightInstance.register('ts', ts);
  //   lowlightInstance.register('typescript', ts); // alias
  //   lowlightInstance.register('python', python);
  //   lowlightInstance.register('json', json);
  //   lowlightInstance.register('bash', bash);

  //   return lowlightInstance;
  // }, []);

  const editor = useOptimizedEditor({
    value,
    setContent: setValue,
    setHasUnsavedChanges,
    setEditor,
  });

  useEffect(() => {
    if (editor && content) {
      // Load the saved JSON content
      const parsedContent =
        typeof content === 'string' ? JSON.parse(content) : content;

      editor.commands.setContent(parsedContent);
    }
  }, [editor, content]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { extensions, lowlight } = useEditorExtensions();

  const parsed = JSON.parse(content);
  const codeNode = parsed.content.find(
    (node: any) => node.type === 'codeBlock'
  );

  const htmlFragments = parsed.content.map((node: any, index: number) => {
    try {
      if (node.type === 'codeBlock') {
        const code = node.content[0].text || '';
        const language = node.attrs.language || 'plaintext';
        const tree = lowlight?.highlight(language, code);
        const htmlRes = tree && toHtml(tree);
        return `<div class="${cn('hljs code-block-custom w-full m-auto', `language-${language}`)}" key="code-${index}"><div class="${cn(`code-${language}`)}">${htmlRes}</div>
        </div>`;
      }
    } catch (error) {
      console.error('Error highlighting code:', error);

      return `<pre class="code-block-custom w-full m-auto"><code class="language-${language}">${code}</code></pre>`;
    }

    const htmlData = generateHTML({ type: 'doc', content: [node] }, extensions);

    const hasTable = hasTag(htmlData, 'table');

    const tableClass = hasTable ? 'tableWrapper' : '';

    return `<div class="content-block-wrapper ${tableClass}" key="block-${index}">${htmlData}</div>`;
  });

  const code = codeNode ? codeNode.content[0].text : '';
  const language = codeNode ? codeNode.attrs.language : 'plaintext';
  // const tree = lowlight.highlight(language, code);
  // const htmlCont = convertToHTML(tree);

  const htmlCont = htmlFragments.join('');
  // Generate HTML when component mounts and content is available
  useEffect(() => {
    const processContent = async () => {
      if (mounted && content) {
        setIsLoading(true);

        try {
          // Dynamic import to ensure client-side only
          const { createLowlight, all } = await import('lowlight');
          const { toHtml } = await import('hast-util-to-html');

          const lowlight = createLowlight(all);
          // Register languages...

          // Process content...
        } catch (error) {
          console.error('Error processing content:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    processContent();
  }, [mounted, content]);

  if (!mounted || isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-8'>
        <div className='prose prose-sm max-w-none px-8 py-0'>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='dark:bg-accent/90 flex flex-col items-center justify-center py-8'>
      <div className='not-prose'>
        <div
          className={cn(
            'prose prose-sm max-w-none px-8 py-2 text-justify dark:bg-black/20 dark:text-stone-100'
          )}
          dangerouslySetInnerHTML={{
            __html: htmlCont,
          }}
        />
      </div>
      <SlugNavigation previousPost={previousPost} nextPost={nextPost} />
      <span className='mx-auto flex w-full justify-center text-center'>
        <Ellipsis size={24} className='text-black' />
      </span>
      {/* <pre>{JSON.stringify(htmlCont, null, 2)}</pre> */}
    </div>
  );
};

export default BlogContent;

interface ExtendedOptions {
  allowDangerousHtml?: boolean;
  useNamedReferences?: boolean;
  omitOptionalTags?: boolean;
}

export function convertToHTML(tree: Root): string {
  return toHtml(tree, {
    allowDangerousHtml: true, // allows raw HTML if present
    omitOptionalTags: false, // keeps tags like <li></li>
    quoteSmart: true, // uses shorter quotes when possible
    useNamedReferences: true, // uses &amp; instead of &#38;
  } as ExtendedOptions);
}

export function hasTag(htmlString: string, tagName: string) {
  if (
    typeof htmlString !== 'string' ||
    typeof tagName !== 'string' ||
    !tagName
  ) {
    return false;
  }

  if (typeof window === 'undefined') {
    const regex = new RegExp(`<${tagName}\\b`, 'i');
    return regex.test(htmlString);
  }
}
