'use client';

import { Skeleton } from '../ui';

type AvatarSkeletonProps = unknown;

const AvatarSkeleton = () => {
  const AvatarTriggerSkeleton = () => (
    <div className='group relative h-14 w-14 cursor-pointer rounded-full border'>
      <Skeleton className='h-full w-full rounded-full' />
    </div>
  );

  // Dialog Content Skeleton
  const AvatarDialogSkeleton = () => (
    <div className='rounded-lg border bg-white/5 p-6 backdrop-blur-xl sm:max-w-[425px]'>
      {/* Header */}
      <div className='mb-4 space-y-2'>
        <Skeleton className='h-6 w-48' />
        <Skeleton className='h-4 w-64' />
      </div>

      {/* Dropzone Area */}
      <div className='mb-6'>
        <Skeleton className='mb-2 h-32 w-full rounded-lg' />
        <div className='flex justify-center gap-2'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-3 w-20' />
        </div>
      </div>

      {/* Buttons */}
      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-24' />
      </div>
    </div>
  );
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' />
      <AvatarDialogSkeleton />
    </div>
  );
};

export default AvatarSkeleton;
