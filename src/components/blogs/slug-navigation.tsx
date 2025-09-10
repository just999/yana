'use client';

import type { BlogProps } from '@/lib/jotai/blog-atoms';
import type { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui';

type SlugNavigationProps = {
  previousPost: PostProps | null;
  nextPost: PostProps | null;
  className?: string;
};

const SlugNavigation = ({
  previousPost,
  nextPost,
  className = '',
}: SlugNavigationProps) => {
  console.log('🚀 ~ SlugNavigation ~ nextPost:', nextPost);
  return (
    <nav
      className={`flex w-full items-center justify-between border-t border-gray-200 px-8 py-2 ${className}`}
    >
      {/* Left side - always present */}
      <Button
        className={cn(
          'w-fit shrink',
          previousPost ? 'dark:hover:shadow-sm/30' : 'cursor-not-allowed'
        )}
        size={'sm'}
        asChild
        variant={'ghost'}
      >
        {previousPost ? (
          <Link
            href={`/blogs/${previousPost.slug}`}
            className='flex items-center space-x-2 text-amber-600 transition-colors hover:text-amber-400'
          >
            <ChevronsLeft className='svg h-4 w-4' />
            <span className='text-xs font-medium'>Previous</span>
          </Link>
        ) : (
          <div className='text-muted flex items-center space-x-2'>
            <ChevronsLeft className='svg h-4 w-4' />
            <span className='text-sm font-medium'>Previous</span>
          </div>
        )}
      </Button>

      {/* Right side - always present */}
      <Button
        className={cn(
          'w-fit shrink',
          nextPost ? 'dark:hover:shadow-sm/30' : 'cursor-not-allowed'
        )}
        size={'sm'}
        asChild
        variant={'ghost'}
      >
        {nextPost ? (
          <Link
            href={`/blogs/${nextPost.slug}`}
            className='flex items-center space-x-2 text-amber-600 transition-colors hover:text-amber-400'
          >
            <span className='text-sm font-medium'>Next</span>
            <ChevronsRight className='h-4 w-4' />
          </Link>
        ) : (
          <div className='text-muted flex items-center space-x-2'>
            <span className='text-sm font-medium'>Next</span>
            <ChevronsRight className='h-4 w-4' />
          </div>
        )}
      </Button>
    </nav>
  );
};

export default SlugNavigation;
