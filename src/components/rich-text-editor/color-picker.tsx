'use client';

import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  currentColor: string;
  showPicker: boolean;
  onTogglePicker: (toggle: boolean) => void;
  onColorChange: (color: string) => void;
}

const COLOR_PALETTE = [
  '#ffffff',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8C471',
  '#82E0AA',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  showPicker,
  onTogglePicker,
  onColorChange,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState('#000');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTogglePicker(!showPicker);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onColorChange(e.target.value);
  };

  const handlePickerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate hex color format
    if (value.match(/^#[0-9A-Fa-f]{6}$/) || value.match(/^#[0-9A-Fa-f]{3}$/)) {
      onColorChange(value);
    } else if (value === '') {
      onColorChange('#000000');
    }
  };

  return (
    <div className='relative' ref={colorPickerRef}>
      <button
        type='button'
        title='Text Color'
        // onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleClick}
        // onClick={(toggle) => onTogglePicker(!toggle)}
        className={`flex cursor-pointer items-center gap-1 rounded p-2 transition-colors duration-150 ${
          showPicker
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }`}
      >
        <Palette size={16} />
        <div
          className='h-3 w-3 rounded border border-gray-400'
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {showPicker && (
        <div
          className='absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border bg-white p-3 shadow-lg'
          onClick={handlePickerClick}
        >
          <div className='mb-2 grid grid-cols-6 gap-1'>
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                className={cn(
                  'h-4 w-4 cursor-pointer rounded-full border-2 border-gray-300 transition-colors hover:border-gray-500',
                  currentColor === 'color'
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-gray-500'
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                title={color}
              />
            ))}
          </div>

          <div className='space-y-2'>
            <div>
              <label
                htmlFor='palette'
                className='mb-1 block text-xs text-gray-600'
              >
                Color Picker
              </label>
              <input
                type='color'
                name='palette'
                value={currentColor}
                // onChange={handleColorInputChange}
                // onClick={handleColorInputClick}
                onInput={() => handleColorInputChange}
                className='h-10 w-full cursor-pointer rounded border'
                title='Custom color'
              />
            </div>

            <div>
              <label className='mb-1 block text-xs text-gray-600'>
                Hex Value
              </label>
              <input
                type='text'
                value={currentColor}
                onChange={handleTextInputChange}
                className='w-full rounded border p-2 font-mono text-sm dark:bg-gray-300'
                placeholder='#ddd'
              />
            </div>

            <button
              onClick={() => onTogglePicker(false)}
              className='mt-3 w-full rounded bg-gray-100 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
