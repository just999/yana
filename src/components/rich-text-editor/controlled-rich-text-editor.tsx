'use client';

import { forwardRef } from 'react';

import { RichTextEditorProps, RichTextEditorRef } from '@/lib/types';
import { Control, Controller, useFormContext } from 'react-hook-form';

import { RichTextEditor } from './rich-text-editor';

export const ControlledRichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    {
      value = '',
      onChange,
      onBlur,
      placeholder = 'Type your text here and select words to format them...',
      error,
      name = '',
      className,
      rules,

      ...field
    },
    ref
  ) => {
    return (
      <RichTextEditor
        {...field}
        ref={ref}
        name={name}
        placeholder={placeholder}
        value={value as string}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        className={className}
      />
    );
  }
);

ControlledRichTextEditor.displayName = 'ControlledRichTextEditor';
