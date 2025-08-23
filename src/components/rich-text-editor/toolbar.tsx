'use client';

import React from 'react';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Image,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';

import { ColorPicker } from './color-picker';
import { ToolbarButton } from './toolbar-button';

interface ToolbarProps {
  activeStyles: Set<string>;
  currentTextColor: string;
  showColorPicker: boolean;
  onToggleStyle: (style: string) => void;
  onToggleTextAlignment: (
    alignment: 'left' | 'center' | 'right' | 'justify'
  ) => void;
  onToggleColorPicker: (showColorPicker: boolean) => void;
  onColorChange: (color: string) => void;
  onImageUpload: (e: React.MouseEvent, isInline?: boolean) => void;
  getRootProps?: () => React.HTMLProps<HTMLElement>;
  getInputProps?: () => React.InputHTMLAttributes<HTMLInputElement>;
  onToggleList: (e: React.MouseEvent, listType: 'ul' | 'ol') => void;
  isStyleActive: (style: string) => boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeStyles,
  currentTextColor,
  showColorPicker,
  onToggleStyle,
  onToggleTextAlignment,
  onToggleColorPicker,
  onColorChange,
  onImageUpload,
  onToggleList,
  isStyleActive,
}) => {
  const handleImageClick = (e: React.MouseEvent) => {
    const isInline = e.shiftKey; // Hold Shift for inline image
    onImageUpload(e, isInline);
  };

  return (
    <div className='mb-2 flex gap-0 rounded-t border bg-gray-50'>
      <ToolbarButton
        title='Bold'
        shortcut='ctrl+B'
        icon={Bold}
        onClick={() => onToggleStyle('b')}
        isActive={activeStyles.has('bold')}
      />
      <ToolbarButton
        title='Italic (Ctrl+I)'
        icon={Italic}
        onClick={() => onToggleStyle('em')}
        isActive={activeStyles.has('italic')}
      />
      <ToolbarButton
        title='Underline (Ctrl+U)'
        icon={Underline}
        onClick={() => onToggleStyle('u')}
        isActive={activeStyles.has('underline')}
      />

      <div className='mx-1 w-px bg-gray-300' />

      <ToolbarButton
        title='Heading 1'
        icon={Heading1}
        onClick={() => onToggleStyle('h1')}
        isActive={activeStyles.has('h1')}
      />
      <ToolbarButton
        title='Heading 2'
        icon={Heading2}
        onClick={() => onToggleStyle('h2')}
        isActive={activeStyles.has('h2')}
      />

      <div className='mx-1 w-px bg-gray-300' />

      <ToolbarButton
        title='Align Center'
        icon={AlignCenter}
        onClick={() => onToggleTextAlignment('center')}
        isActive={activeStyles.has('center')}
      />
      <ToolbarButton
        title='Align Left'
        icon={AlignLeft}
        onClick={() => onToggleTextAlignment('left')}
        isActive={activeStyles.has('left')}
      />
      <ToolbarButton
        title='Align Justify'
        icon={AlignJustify}
        onClick={() => onToggleTextAlignment('justify')}
        isActive={activeStyles.has('justify')}
      />
      <ToolbarButton
        title='Align Right'
        icon={AlignRight}
        onClick={() => onToggleTextAlignment('right')}
        isActive={activeStyles.has('right')}
      />
      <ToolbarButton
        title='ordered-list'
        icon={ListOrdered}
        onClick={(e) => onToggleList(e, 'ol')}
        isActive={activeStyles.has('ol')}
      />
      <ToolbarButton
        title='List'
        icon={List}
        onClick={(e) => onToggleList(e, 'ul')}
        isActive={activeStyles.has('ul')}
      />

      <div className='mx-1 w-px bg-gray-300' />

      <ColorPicker
        currentColor={currentTextColor}
        showPicker={showColorPicker}
        onTogglePicker={(toggle) => onToggleColorPicker(!toggle)}
        onColorChange={(color: string) => onColorChange(color)}
      />

      <div className='mx-1 w-px bg-gray-300' />

      <ToolbarButton
        title='Insert Images'
        icon={Image}
        onClick={handleImageClick}
        isActive={activeStyles.has('images')}
      />
    </div>
  );
};
