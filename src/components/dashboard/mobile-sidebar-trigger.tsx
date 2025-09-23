'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { PanelLeft } from 'lucide-react';

type Props = {
  className?: string;
};

export function MobileSafeSidebarTrigger({ className, ...props }: Props) {
  const { toggleSidebar, isMobile, state } = useSidebar();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent focus issues on mobile
    if (isMobile) {
      // Small delay to prevent rapid open/close
      setTimeout(() => {
        toggleSidebar();
      }, 10);
    } else {
      toggleSidebar();
    }
  };

  // Prevent scroll locking issues
  useEffect(() => {
    if (isMobile && state === 'expanded') {
      // Ensure body doesn't get scroll-locked on mobile
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
  }, [isMobile, state]);

  return (
    <Button
      ref={triggerRef}
      variant='ghost'
      size='icon'
      className={className}
      onClick={handleToggle}
      data-mobile-safe='true'
      {...props}
    >
      <PanelLeft />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  );
}
