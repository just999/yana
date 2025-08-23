'use client';

import React from 'react';

import { ToolbarButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from '../ui';

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  title,
  shortcut,
  icon: Icon,
  onClick,
  isActive,
  className,
}) => (
  <Button
    type='button'
    variant={'ghost'}
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      `cursor-pointer rounded p-2 transition-colors duration-150`,
      isActive
        ? 'bg-blue-500 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800',
      className
    )}
    aria-label={title}
  >
    <Icon size={16} />
  </Button>
);
