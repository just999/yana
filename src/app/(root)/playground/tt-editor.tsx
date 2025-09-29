'use client';

import { useMemo } from 'react';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import plaintext from 'highlight.js/lib/languages/plaintext';
import html from 'highlight.js/lib/languages/xml';
import { all, createLowlight } from 'lowlight';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TtEditor = ({ content, onChange }: RichTextEditorProps) => {
  const lowlight = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const lowlightInstance = createLowlight(all);

    // Register additional languages
    lowlightInstance.register('html', html);

    lowlightInstance.register('plaintext', plaintext);

    return lowlightInstance;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        dropcursor: false,
        codeBlock: false,
        paragraph: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  return (
    <div className='editor-container'>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TtEditor;
