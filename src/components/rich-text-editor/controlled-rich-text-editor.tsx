'use client';

import { forwardRef } from 'react';

import { RichTextEditorProps, RichTextEditorRef } from '@/lib/types';
import { Control, Controller, useFormContext } from 'react-hook-form';

import { RichTextEditor } from './rich-text-editor';

// export interface ControlledRichTextEditorProps<TFieldValues extends FieldValues>
//   extends Omit<RichTextEditorProps, 'value' | 'onChange' | 'name'> {
//   name: Path<TFieldValues>;
//   rules?: object;
//   defaultValue?: string;
//   onReset?: () => void;
//   // onImageFilesChange?: (files: File[]) => void;
// }

// interface RichTextEditorProps {
//   value?: string;
//   onChange?: (value: string) => void;
//   onBlur?: () => void;
//   placeholder?: string;
//   error?: string;
//   name?: string;
//   control: Control<any>;
//   className?: string;
//   rules?: {
//     required: string;
//   };
// }

// export interface RichTextEditorRef {
//   focus: () => void;
//   getContent: () => string;
//   setContent: (content: string) => void;
// }

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
      // onImageFilesChange,
      ...field
      // ...props
    },
    ref
  ) => {
    // const { control } = useFormContext();

    return (
      // <Controller
      //   name={name!}
      //   control={control}
      //   rules={rules}
      //   // defaultValue={value}
      //   render={({ field, fieldState }) => (
      //     <RichTextEditor
      //       {...props}
      //       {...field}
      //       ref={ref}
      //       name={name}
      //       placeholder={placeholder}
      //       value={value as string}
      //       error={fieldState.error?.message || error}
      //       className={className}
      //       // onReset={onReset}
      //       // onImageFilesChange={onImageFilesChange}
      //     />
      //   )}
      // />

      <RichTextEditor
        // {...props}
        {...field}
        ref={ref}
        name={name}
        placeholder={placeholder}
        value={value as string}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        className={className}
        // onReset={onReset}
        // onImageFilesChange={onImageFilesChange}
      />
    );
  }
);

ControlledRichTextEditor.displayName = 'ControlledRichTextEditor';
