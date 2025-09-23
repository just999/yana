'use client';

import { Skeleton } from '../ui';

type HeaderSkeletonProps = unknown;

const HeaderSkeleton = () => (
  <header className='fixed inset-x-0 top-0 z-50 bg-white px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900'>
    <nav className='container mx-auto flex max-w-5xl items-center justify-between'>
      <div className='flex h-12 w-full items-center justify-between p-2'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-8 w-8 rounded bg-gray-300 dark:bg-gray-600' />
          <Skeleton className='hidden h-6 w-24 rounded bg-gray-300 lg:block dark:bg-gray-600' />
        </div>
        <div className='flex items-center gap-4'>
          <div className='hidden gap-2 md:flex'>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className='h-6 w-16 rounded bg-gray-300 dark:bg-gray-600'
              />
            ))}
          </div>
          <Skeleton className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600' />
        </div>
      </div>
    </nav>
  </header>
);

export default HeaderSkeleton;
