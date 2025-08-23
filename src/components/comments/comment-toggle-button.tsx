'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Icon } from 'lucide-react';

import { Button } from '../ui';

type CommentToggleButtonProps = {
  text: string;
  startOpen: boolean;
  onDataSend: (data: boolean) => void;
  commentCount: number;
  icon: React.ReactElement;
  renderedChildren?: React.ReactElement[] | [];
  openIcon?: React.ReactElement; // Icon when open
  closedIcon?: React.ReactElement; // Icon when closed
};

const CommentToggleButton = ({
  text,
  startOpen,
  onDataSend,
  commentCount,
  icon,
  openIcon,
  closedIcon,
  renderedChildren,
}: CommentToggleButtonProps) => {
  const [open, setOpen] = useState(startOpen);
  const [height, setHeight] = useState(startOpen ? 'auto' : '0px');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (open) {
        // Get the natural height when opening
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(`${scrollHeight}px`);

        // Set to auto after animation completes for dynamic content
        const timer = setTimeout(() => {
          setHeight('auto');
        }, 300); // Match transition duration

        return () => clearTimeout(timer);
      } else {
        // First set to px value, then to 0 for smooth closing
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(`${scrollHeight}px`);

        // Force a reflow then animate to 0
        requestAnimationFrame(() => {
          setHeight('0px');
        });
      }
    }
  }, [open]);

  const handleSubmit = () => {
    onDataSend(!open);
    setOpen(!open);
  };

  // Determine which icon to show
  const getIcon = () => {
    if (openIcon && closedIcon) {
      return open ? openIcon : closedIcon;
    }
    if (icon) {
      return icon; // Fallback to single icon prop
    }
    // Default icons
    return open ? (
      <ChevronDown className='transition-transform duration-200' />
    ) : (
      <ChevronRight className='transition-transform duration-200' />
    );
  };

  return (
    <>
      <Button
        variant={'ghost'}
        onClick={handleSubmit}
        type='button'
        size={'sm'}
        className={cn('text-xs text-[12px] text-blue-700')}
      >
        {/* <Icon /> {open ? 'toggle' : 'replay form opened'} */}
        {/* {Icon} {commentCount} {commentCount === 1 ? 'reply' : 'replies'} */}
        <span className='flex items-center gap-1'>
          {getIcon()}
          <span>
            {commentCount} {commentCount === 1 ? 'reply' : 'replies'}
          </span>
        </span>
      </Button>
      <div
        ref={contentRef}
        className={`overflow-hidden pl-12 transition-all duration-300 ease-in-out ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} `}
        style={{ height }}
      >
        <div className='dark:bg-accent/50 ml-6 space-y-4 rounded-lg p-1'>
          {renderedChildren}
        </div>
      </div>
    </>
  );
};

export default CommentToggleButton;
