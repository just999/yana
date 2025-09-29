// // components/RenderedContent.tsx
// import { useEffect, useMemo } from 'react';

// import { toHtml } from 'hast-util-to-html';
// import plaintext from 'highlight.js/lib/languages/plaintext';
// import html from 'highlight.js/lib/languages/xml';
// import { all, createLowlight } from 'lowlight';

// interface RenderedContentProps {
//   content: string;
// }

// export default function RenderedContent({ content }: RenderedContentProps) {
//   const lowlight = useMemo(() => {
//     if (typeof window === 'undefined') {
//       return null;
//     }
//     const lowlightInstance = createLowlight(all);

//     // Register additional languages
//     lowlightInstance.register('html', html);
//     lowlightInstance.register('plaintext', plaintext);

//     return lowlightInstance;
//   }, []);

//   useEffect(() => {
//     if (!lowlight) return;

//     // Apply syntax highlighting to code blocks after render
//     const codeBlocks = document.querySelectorAll('pre code');
//     codeBlocks.forEach((block) => {
//       const language = block.className.replace('language-', '');
//       const code = block.textContent || '';

//       // Clear existing content
//       block.innerHTML = '';

//       // Apply highlighting and convert HAST to HTML
//       const result = lowlight.highlight(language, code);
//       const htmlContent = toHtml(result);
//       block.innerHTML = htmlContent;
//     });
//   }, [content, lowlight]);

//   return (
//     <div
//       className='prose max-w-none'
//       dangerouslySetInnerHTML={{ __html: content }}
//     />
//   );
// }

// components/RenderedContent.tsx
// components/RenderedContent.tsx
// components/RenderedContent.tsx
// import { useEffect, useMemo } from 'react';

// import plaintext from 'highlight.js/lib/languages/plaintext';
// import html from 'highlight.js/lib/languages/xml';
// import { all, createLowlight } from 'lowlight';

// interface RenderedContentProps {
//   content: string;
// }

// export default function RenderedContent({ content }: RenderedContentProps) {
//   const lowlight = useMemo(() => {
//     if (typeof window === 'undefined') {
//       return null;
//     }
//     const lowlightInstance = createLowlight(all);

//     // Register additional languages
//     lowlightInstance.register('html', html);
//     lowlightInstance.register('plaintext', plaintext);

//     return lowlightInstance;
//   }, []);

//   useEffect(() => {
//     if (!lowlight) return;

//     const codeBlocks = document.querySelectorAll('pre code');
//     codeBlocks.forEach((block) => {
//       const language = block.className.replace('language-', '');
//       const code = block.textContent || '';

//       try {
//         // Type assertion to handle the inconsistent types
//         const result = lowlight.highlight(language, code) as unknown as {
//           value: string;
//         };
//         block.innerHTML = result.value;
//       } catch (error) {
//         console.error('Error highlighting code:', error);
//         block.textContent = code;
//       }
//     });
//   }, [content, lowlight]);

//   return (
//     <div
//       className='prose max-w-none'
//       dangerouslySetInnerHTML={{ __html: content }}
//     />
//   );
// }

// components/RenderedContent.tsx
import { useEffect, useMemo, useState } from 'react';

import { useEditorExtensions } from '@/hooks/use-editor-extensions';
import type { JSONContent } from '@tiptap/react';
import plaintext from 'highlight.js/lib/languages/plaintext';
import html from 'highlight.js/lib/languages/xml';
import { all, createLowlight } from 'lowlight';

interface RenderedContentProps {
  content: string;
}

// Simple HAST to HTML converter
function hastToHtml(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }

  if (node.type === 'element') {
    const tagName = node.tagName;
    const attributes = node.properties
      ? Object.entries(node.properties)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')
      : '';

    const children = node.children
      ? node.children.map((child: any) => hastToHtml(child)).join('')
      : '';

    return attributes
      ? `<${tagName} ${attributes}>${children}</${tagName}>`
      : `<${tagName}>${children}</${tagName}>`;
  }

  if (node.type === 'root') {
    return node.children.map((child: any) => hastToHtml(child)).join('');
  }

  return '';
}

export default function RenderedContent({ content }: RenderedContentProps) {
  const [data, setData] = useState('');
  // const lowlight = useMemo(() => {
  //   if (typeof window === 'undefined') {
  //     return null;
  //   }
  //   const lowlightInstance = createLowlight(all);

  //   // Register additional languages
  //   lowlightInstance.register('html', html);
  //   lowlightInstance.register('plaintext', plaintext);

  //   return lowlightInstance;
  // }, []);

  const { extensions, lowlight } = useEditorExtensions();

  useEffect(() => {
    if (!lowlight) return;

    // Apply syntax highlighting to code blocks after render
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const language = block.className.replace('language-', '');
      const code = block.textContent || '';

      try {
        // Get HAST tree and convert to HTML manually
        const hastTree = lowlight.highlight(language, content);
        const htmlContent = hastToHtml(hastTree);
        setData(htmlContent);
        block.innerHTML = htmlContent;
      } catch (error) {
        console.error('Error highlighting code:', error);
        // Fallback: keep original code if highlighting fails
        block.textContent = code;
      }
    });
  }, [content, lowlight, setData]);

  return (
    <div
      className='prose max-w-none'
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}
