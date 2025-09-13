// utils/jsonToHtml.ts
import { generateHTML } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import StarterKit from '@tiptap/starter-kit';
import javascript from 'highlight.js/lib/languages/javascript';
import html from 'highlight.js/lib/languages/xml';
import { createLowlight } from 'lowlight';

import css from 'highlight.js/lib/languages/css';

// Initialize lowlight
const lowlight = createLowlight();
lowlight.register('html', html);
lowlight.register('javascript', javascript);
lowlight.register('css', css);

// Define extensions
const extensions = [
  StarterKit,
  CodeBlockLowlight.configure({
    lowlight,
  }),
];

export function jsonToHtml(jsonContent: any): string {
  try {
    return generateHTML(jsonContent, extensions);
  } catch (error) {
    console.error('Error converting JSON to HTML:', error);
    return '';
  }
}
