'use client';

import { forwardRef, useActionState, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { useEditorImages } from '@/hooks/use-editor-images';
import { blogAtom, imageAtoms } from '@/lib/jotai/blog-atoms';
import { editorContentAtom, setEditorAtom } from '@/lib/jotai/editor-atoms';
import type {
  ExtendedRichTextEditorProps,
  RichTextEditorRef,
} from '@/lib/types';
import Highlight from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ListKit, TaskItem, TaskList } from '@tiptap/extension-list';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAtom, useSetAtom } from 'jotai';
import { Loader2, Save } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import ImageResize from 'tiptap-extension-resize-image';

import { ImagePreview } from '../rich-text-editor/image-preview';
import { FontSizeExtension } from './extensions/font-size';
import { LineHeightExtension } from './extensions/line-height';
import { TableDeletionExtension } from './extensions/table-deletion';
import { Ruler } from './ruler';
import { Toolbar } from './toolbar';

interface EditorProps {
  initialContent?: string;
  initialTitle?: string;
  blogId?: string;
  // React Hook Form integration props
  onChange?: (content: string) => void;
  onBlur?: () => void;
  value?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
}

const Editor = forwardRef<RichTextEditorRef, ExtendedRichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      onBlur,
      placeholder = 'Type your text here and select words to format them...',
      error,
      name,
      type,
      className = '',
      routeConfig,
      maxImages = 8,
      updateContent,
      editorRef,
      fileToImageIdMap,
    },
    ref
  ) => {
    const setEditor = useSetAtom(setEditorAtom);
    const [title, setTitle] = useState(value);
    const [content, setContent] = useAtom(editorContentAtom);
    const [formData, setFormData] = useAtom(blogAtom);
    const [images, setImages] = useAtom(imageAtoms);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Use useActionState for save functionality - this handles the form submission
    // const [saveState, formAction, isPending] = useActionState<
    //   SaveDocumentState,
    //   FormData
    // >(createBlog, {
    //   success: false,
    //   message: '',
    //   error: '',
    //   documentId: undefined,
    // });

    const editor = useEditor({
      autofocus: true,
      onCreate({ editor }) {
        setEditor(editor);
        if (value) {
          editor.commands.setContent(value);
        }
      },
      onDestroy() {
        setEditor(null);
      },
      onUpdate({ editor }) {
        const newContent = editor.getHTML();
        setContent(newContent);
        setHasUnsavedChanges(true);
      },

      editorProps: {
        attributes: {
          class:
            'focus:outline-none print:border-0 dark:bg-accent/90 bg-white dark:text-gray-100 shadow-lg border-0 border-[#e8e8e8] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text',
        },
      },
      extensions: [
        Image.configure({
          HTMLAttributes: {
            class: 'editor-image',
          },
          allowBase64: true,
        }),
        TextStyleKit.configure({
          lineHeight: false,
          fontSize: false,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        StarterKit.configure({
          link: false,
        }),
        LineHeightExtension,
        FontSizeExtension,
        Link.configure({
          openOnClick: false,
          defaultProtocol: 'https',
        }),
        TaskList,
        ListKit.configure({
          bulletList: false,
          listItem: false,
          orderedList: false,
          taskList: false,
          taskItem: false,
          listKeymap: false,
        }),
        Highlight.configure({ multicolor: true }),
        TaskItem.configure({ nested: true }),
        Table.configure({
          resizable: true,
          allowTableNodeSelection: true,
          HTMLAttributes: {
            class: 'table-class',
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
        TableDeletionExtension,
        ImageResize.configure({
          inline: true,
          allowBase64: true,
        }),
      ],

      immediatelyRender: false,
    });

    // const {
    //   previews,
    //   fileInputRef,
    //   handleImageUpload,
    //   handleImageButtonClick,
    //   handleFileInputChange,
    //   getRootProps,
    //   getInputProps,
    //   removeImageById,
    //   updateImageUrl,
    //   pendingImages,
    // } = useEditorImages(
    //   editorRef as React.RefObject<HTMLDivElement>,
    //   maxImages,
    //   routeConfig,
    //   updateContent
    // );

    // Handle save state changes
    // useEffect(() => {
    //   if (saveState?.success) {
    //     setHasUnsavedChanges(false);
    //   }
    // }, [saveState]);

    // Keyboard shortcut for save (Ctrl+S / Cmd+S)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          const form = document.getElementById('save-form') as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // const SubmitButton = () => {
    //   const { pending } = useFormStatus();

    //   return (
    //     <Button
    //       size={'sm'}
    //       type='submit'
    //       disabled={pending}
    //       className='flex cursor-pointer items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50'
    //       variant={'ghost'}
    //     >
    //       <Save className='h-4 w-4' /> {pending ? 'Saving...' : 'Save'}
    //     </Button>
    //   );
    // };

    if (!editor) {
      return null;
    }

    return (
      <div className='size-full overflow-x-auto bg-[#F9FBFD]/90 px-4 dark:bg-stone-800/50 print:overflow-visible print:bg-white print:p-0'>
        {/* Document Header with Form */}
        {/* <div className='mx-auto w-[816px] py-4'> */}
        {/* <form id='save-form' action={formAction}> */}
        {/* <div className='mb-4 flex items-center justify-between'>
          <input
            type='text'
            name='title'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className='mr-4 flex-1 border-none bg-transparent text-xl font-semibold outline-none'
            placeholder='Document title...'
          /> */}

        {/* Hidden inputs for form data */}
        {/* <input type='hidden' name='content' value={content} />
          {documentId && (
            <input type='hidden' name='documentId' value={documentId} />
          )} */}

        {/* Save Button */}
        {/* <div className='flex items-center gap-2'> */}
        {/* {hasUnsavedChanges && !isPending && (
              <span className='text-sm text-gray-500'>Unsaved changes</span>
            )}

            {isPending && (
              <div className='flex items-center gap-1 text-sm text-gray-500'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Saving...
              </div>
            )} */}

        {/* {saveState?.success && !hasUnsavedChanges && !isPending && (
                <span className='text-sm text-green-600'>Saved</span>
              )} */}

        {/* <button
                type='submit'
                disabled={isPending}
                className='flex cursor-pointer items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50'
              >
                <Save className='h-4 w-4' />
                Save
              </button> */}

        {/* <SubmitButton /> */}
        {/* </div> */}
        {/* </div> */}
        {/* </form> */}

        {/* Error Message */}
        {/* {saveState?.error && (
          <div className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
            {saveState.message}
          </div>
        )} */}
        {/* </div> */}
        {/* <section>
          <ImagePreview
            content={formData.content}
            slug={formData.slug}
            removeImageById={removeImageById}
          />
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          {images.length > 0 && (
            <div className='flex w-full justify-center pt-1'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleImageButtonClick}
                className='w-fit rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
              >
                Add Images ({images.length} photos)
              </Button>
            </div>
          )}
        </section>
        <Toolbar />
        <Ruler /> */}
        <div className='py-.5 mx-auto flex w-[816px] min-w-max justify-center text-gray-700 print:w-full print:min-w-0 print:py-0'>
          <div ref={editorRef} className='editor-wrapper'>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;
