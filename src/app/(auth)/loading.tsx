'use client';

import { Skeleton } from '@/components/ui';

export default function RegisterFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Name Field with specific grid layout */}
      <div className='grid w-[398px] grid-cols-2 gap-4'>
        <div className='w-[398px] space-y-3'>
          <Skeleton className='h-5 w-20' /> {/* Name label */}
          <Skeleton className='h-10 w-full rounded-md' /> {/* Name input */}
        </div>
      </div>
      {/* Email Field with icon */}
      <div className='space-y-3'>
        <Skeleton className='h-5 w-14' /> {/* Email label */}
        <div className='relative'>
          <Skeleton className='h-10 w-full rounded-md' /> {/* Email input */}
          <Skeleton className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 rounded' />{' '}
          {/* Mail icon */}
        </div>
      </div>
      {/* Password Fields */}
      <div className='space-y-4'>
        {/* Password */}
        <div className='space-y-3'>
          <Skeleton className='h-5 w-20' /> {/* Password label */}
          <div className='relative'>
            <Skeleton className='h-10 w-full rounded-md' />{' '}
            {/* Password input */}
            <Skeleton className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 rounded' />{' '}
            {/* Eye icon */}
          </div>
        </div>

        {/* Confirm Password */}
        <div className='space-y-3'>
          <Skeleton className='h-5 w-36' /> {/* Confirm password label */}
          <div className='relative'>
            <Skeleton className='h-10 w-full rounded-md' />{' '}
            {/* Confirm password input */}
            <Skeleton className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 rounded' />{' '}
            {/* Eye icon */}
          </div>
        </div>
      </div>
      {/* Avatar Upload - Dropzone */}
      <div className='space-y-3'>
        <Skeleton className='h-5 w-20' /> {/* Avatar label */}
        <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors'>
          <Skeleton className='mx-auto h-8 w-8 rounded' /> {/* Camera icon */}
          <Skeleton className='mx-auto mt-3 h-4 w-56' /> {/* Drop text */}
          <Skeleton className='mx-auto mt-2 h-3 w-40' /> {/* File size info */}
        </div>
      </div>
      {/* Checkbox Sections */}
      <div className='space-y-4'>
        {/* Anonymous Checkbox */}
        <div className='space-y-3'>
          <Skeleton className='h-5 w-32' /> {/* Account Privacy label */}
          <div className='flex items-center space-x-3'>
            <Skeleton className='h-5 w-5 rounded' /> {/* Checkbox */}
            <Skeleton className='h-4 w-72' /> {/* Checkbox label */}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className='flex items-center space-x-3'>
          <Skeleton className='h-5 w-5 rounded' /> {/* Checkbox */}
          <Skeleton className='h-4 w-80' /> {/* Terms text */}
        </div>
      </div>
      {/* Action Section */}
      <div className='space-y-4'>
        <Skeleton className='h-11 w-full rounded-md' /> {/* Submit button */}
        {/* Login Link */}
        <div className='text-center'>
          <Skeleton className='mx-auto h-4 w-72' />{' '}
          {/* Already have account text */}
        </div>
      </div>
      {/* Error Message Slot */}
      <Skeleton className='mx-auto h-5 w-full max-w-xs' />{' '}
      {/* Error message space */}
    </div>
  );
}
