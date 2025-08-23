'use client';

import React, { forwardRef, useCallback, useEffect } from 'react';

import { Button } from '@/components/ui';
import { useEditorFormatting } from '@/hooks/use-editor-formatting';
import { useEditorImages } from '@/hooks/use-editor-images';
import { useEditorKeyboard } from '@/hooks/use-editor-keyboard';
import { useEditorSelection } from '@/hooks/use-editor-selection';
import { useListsState } from '@/hooks/use-lists-state';
import { useRichTextEditor } from '@/hooks/use-rich-text-editor';
import { blogDefaultValue } from '@/lib/constants';
import {
  blogAtom,
  imageAtoms,
  imageCountAtoms,
  imageUrlAtoms,
  initializedAtom,
} from '@/lib/jotai/blog-atoms';
import { ExtendedRichTextEditorProps, RichTextEditorRef } from '@/lib/types';
import { cn, extractImageUrls } from '@/lib/utils';
import { useAtom } from 'jotai';

import { debounce } from './editor-helper';
import { ImagePreview } from './image-preview';
import { Toolbar } from './toolbar';

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  ExtendedRichTextEditorProps
>(
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
      routeConfig = '',
      maxImages = 8,
      updateContent,
      editorRef,
      fileToImageIdMap,
    },
    ref
  ) => {
    const [isInitialized, setIsInitialized] = useAtom(initializedAtom);
    const [images, setImages] = useAtom(imageAtoms);

    const [imageCount, setImageCount] = useAtom(imageCountAtoms);
    const [formData, setFormData] = useAtom(blogAtom);
    const [imgUrl, setImgUrl] = useAtom(imageUrlAtoms);

    useEffect(() => {
      if (type === 'create' && !isInitialized) {
        setFormData(blogDefaultValue);
        setImages([]);
        setIsInitialized(true);
      }
    }, [type, isInitialized, setFormData, setImages, setIsInitialized]);

    const { showColorPicker, setShowColorPicker } = useRichTextEditor(
      value,
      onChange,
      placeholder
    );

    const {
      isTextSelected,
      setIsTextSelected,
      savedSelectionRef,
      hasSelection,
      detectActiveStyles,
      saveSelection,
      handleSelectionChange,
      handleEditorFocus,
      handleEditorBlur,
    } = useEditorSelection(editorRef, onBlur);

    const {
      currentTextColor,
      toggleInlineStyle,
      toggleBlockStyle,
      toggleStyle,
      applyTextColor,
      toggleTextAlignment,
      applyInlineFormat,
    } = useEditorFormatting(editorRef, updateContent, detectActiveStyles);

    const {
      previews,
      fileInputRef,
      handleImageUpload,
      handleImageButtonClick,
      handleFileInputChange,
      getRootProps,
      getInputProps,
      removeImageById,
      updateImageUrl,
      pendingImages,
    } = useEditorImages(
      editorRef as React.RefObject<HTMLDivElement>,
      maxImages,
      typeof routeConfig === 'string' ? routeConfig : routeConfig.toString(),
      updateContent
    );

    const {
      activeListTypeRef,
      updateListState,
      updateToolbarAppearance,
      toggleList,
      isTypingModeRef,
      handleEditorInputWithLists,
      typingStyles,
      setActiveStyles,
      activeStyles,
      setTypingStyles,
      skipNextInputHandler,
    } = useListsState(editorRef, updateContent, detectActiveStyles);

    // const imageInsertion = editorRef
    //   ? useImageInsertion(editorRef, updateContent)
    //   : null;
    // const { pendingImages } = imageInsertion || {
    //   updateImageUrl: () => {},
    //   pendingImages: [],
    //   removeImageById: () => {},
    // };

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => editorRef?.current?.focus(),
        getContent: () => editorRef?.current?.innerHTML || '',
        setContent: (content: string) => {
          if (editorRef?.current) {
            editorRef.current.innerHTML = content;
            updateContent();
          }
        },
        getDOMElement: () => editorRef?.current || null,
      }),
      [editorRef, updateContent]
    );

    useEffect(() => {
      if (editorRef?.current && !isInitialized) {
        editorRef.current.innerHTML = value || `<p>${placeholder}</p>`;
        setIsInitialized(true);
      }
    }, [value, placeholder, isInitialized, editorRef, setIsInitialized]);

    useEffect(() => {
      if (
        editorRef?.current &&
        isInitialized &&
        value !== editorRef.current.innerHTML
      ) {
        editorRef.current.innerHTML = value || `<p>${placeholder}</p>`;
      }
    }, [value, placeholder, isInitialized, editorRef]);

    useEffect(() => {
      setImageCount(imgUrl.length);
    }, [imgUrl, setImageCount]);

    useEffect(() => {
      const urls = extractImageUrls(formData.content);

      setImages(
        urls.map((url, i) => ({
          src: url.src,
          id: url.src.split('/').pop() || `image-${i}`,
        }))
      );
    }, [formData, setImages, type]);

    const debouncedDetectActiveStyles = useCallback(
      () => debounce(detectActiveStyles, 50),
      [detectActiveStyles]
    );

    useEffect(() => {
      const editor = editorRef?.current;
      if (!editor) return;

      const debouncedFn = debouncedDetectActiveStyles(); // Get the debounced function
      const handleSelectionChange = () => debouncedFn();

      document.addEventListener('selectionchange', handleSelectionChange);
      editor.addEventListener('mouseup', handleSelectionChange);
      editor.addEventListener('keyup', handleSelectionChange);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        editor.removeEventListener('mouseup', handleSelectionChange);
        editor.removeEventListener('keyup', handleSelectionChange);
        debouncedFn.cancel();
      };
    }, [editorRef, debouncedDetectActiveStyles]);

    const isStyleActive = useCallback(
      (style: string) => activeStyles.has(style),
      [activeStyles]
    );
    const handleColorChange = useCallback(
      (color: string) => {
        applyTextColor(color);
        setShowColorPicker(false);
      },
      [applyTextColor, setShowColorPicker]
    );

    const {
      handleKeyDown,
      handleEditorKeyUp,
      handleKeyDownWithLists,
      handleEditorMouseUpWithLists,
    } = useEditorKeyboard(
      editorRef,
      toggleStyle,
      isTypingModeRef,
      setTypingStyles,
      activeListTypeRef,
      detectActiveStyles,
      handleSelectionChange,
      updateToolbarAppearance,
      setIsTextSelected,
      updateListState,
      skipNextInputHandler
    );

    const setEditorRef = useCallback(
      (node: HTMLDivElement | null | undefined) => {
        if (node) {
          const divElement = node as HTMLDivElement;
          // Set initial content when the ref is first assigned
          if (formData.content && !divElement.innerHTML) {
            divElement.innerHTML = formData.content;
          }
        }
        if (editorRef) {
          editorRef.current = node as HTMLDivElement;
        }
      },
      [editorRef, formData.content]
    );

    return (
      <div className={cn('flex w-full flex-col justify-center', className)}>
        <Toolbar
          activeStyles={activeStyles}
          currentTextColor={currentTextColor}
          showColorPicker={showColorPicker}
          onToggleStyle={toggleStyle}
          onToggleTextAlignment={toggleTextAlignment}
          onToggleColorPicker={() => setShowColorPicker(!showColorPicker)}
          onColorChange={handleColorChange}
          onImageUpload={handleImageButtonClick}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          onToggleList={toggleList}
          isStyleActive={isStyleActive}
        />

        <section>
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

        <div className='relative overflow-y-auto rounded-lg'>
          <div
            ref={setEditorRef}
            contentEditable
            // dangerouslySetInnerHTML={{ __html: formData.content || '' }}
            className={cn(
              'editor min-h-32 rounded-b border border-t-0 bg-stone-600/50 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
              '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
              '[&_li]:my-1 [&_li]:ml-0',
              '[&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]',
              error ? 'border-red-500' : ''
            )}
            onInput={handleEditorInputWithLists}
            onKeyUp={handleEditorKeyUp}
            onKeyDown={handleKeyDownWithLists}
            onMouseUp={handleEditorMouseUpWithLists}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
            onMouseDown={saveSelection}
            suppressContentEditableWarning
            data-name={name}
            role='textbox'
            aria-label='content'
            aria-describedby={error ? 'editor-error' : undefined}
          />
          {!formData.content && pendingImages.length === 0 && (
            <div className='text-muted-foreground pointer-events-none absolute top-2 left-2'>
              Start writing your content here...
            </div>
          )}
        </div>
        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
        <div className='mt-2 text-xs text-gray-500'>
          <div>
            <strong>Active Styles:</strong>{' '}
            {activeStyles.size > 0
              ? Array.from(activeStyles).join(', ')
              : 'None'}
          </div>
          {imageCount > 0 && (
            <div className='-mt-1'>
              <strong>Images:</strong> {images.length}
            </div>
          )}
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export * from '@/lib/types';
export { ColorPicker } from './color-picker';
export { EditorContent } from './editor-content';
export { Toolbar } from './toolbar';
export { ToolbarButton } from './toolbar-button';
