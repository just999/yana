import { RefObject } from 'react';

interface EditorContentProps {
  editorRef: RefObject<HTMLDivElement | null> | undefined;
  className: string;
  placeholder: string;
  error?: string;
  name?: string;
  onInput: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onMouseDown: () => void;
  children?: React.ReactNode;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  className,
  placeholder,
  error,
  name,
  onInput,
  onKeyUp,
  onKeyDown,
  onMouseUp,
  onFocus,
  onBlur,
  onMouseDown,
  children,
}) => {
  return <div className='editor-content'>{children}</div>;
};
