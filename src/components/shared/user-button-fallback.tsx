'use client';

import { cn } from '@/lib/utils';

import { Skeleton } from '../ui';

type UserButtonFallbackProps = {
  className?: string;
};

const UserButtonFallback = ({ className }: UserButtonFallbackProps) => {
  console.log('user button fallback triggered!!');
  return (
    <div
      className={cn(
        'border-accent-500 dark:bg-accent-100 h-8 w-3/5 space-y-5 border-2 p-4 pt-16 lg:w-5/6',
        className
      )}
    >
      <Skeleton className='h-4 w-full bg-blue-300' />
    </div>
  );
};

export default UserButtonFallback;
