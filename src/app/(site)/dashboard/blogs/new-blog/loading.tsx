'use client';

import { Skeleton } from '@/components/ui';

export default function BlogEditorSkeleton() {
  return (
    <div className='container mx-auto w-full min-w-2xl p-6'>
      {/* Page Header */}
      <div className='mb-8'>
        <Skeleton className='h-9 w-72' />{' '}
        {/* Main title with underline effect */}
        <Skeleton className='mt-2 h-5 w-[480px]' /> {/* Description text */}
      </div>

      {/* Form Container */}
      <div className='space-y-6'>
        {/* First Row - Title, Slug, Category */}
        <div className='flex flex-col gap-6 sm:flex-row'>
          {/* Title Field */}
          <div className='flex-1'>
            <div className='flex items-baseline gap-3'>
              <Skeleton className='h-5 w-14' /> {/* "Title *" label */}
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-9 w-full' /> {/* Input field */}
                <Skeleton className='h-3 w-48' /> {/* Error message space */}
              </div>
            </div>
          </div>

          {/* Slug Field */}
          <div className='flex-1'>
            <div className='flex items-baseline gap-3'>
              <Skeleton className='h-5 w-14' /> {/* "Slug **" label */}
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-9 w-full' /> {/* Input field */}
                <div className='flex gap-2'>
                  <Skeleton className='h-3 w-32' /> {/* Error message */}
                  <Skeleton className='h-3 w-40' /> {/* Helper text */}
                </div>
              </div>
            </div>
          </div>

          {/* Category Field */}
          <div className='flex-1'>
            <div className='flex items-baseline gap-3'>
              <Skeleton className='h-5 w-20' /> {/* "Category" label */}
              <Skeleton className='h-9 w-full' /> {/* Select dropdown */}
            </div>
          </div>
        </div>

        {/* Excerpt Field */}
        <div className='flex items-baseline gap-3'>
          <Skeleton className='h-4 w-16' /> {/* "Excerpt *" label */}
          <Skeleton className='h-7 w-full' /> {/* Excerpt input */}
        </div>

        {/* Rich Text Editor Section */}
        <div>
          <Skeleton className='mb-3 h-5 w-16' /> {/* "Content *" label */}
          {/* Editor Container */}
          <div className='rounded-2xl bg-gray-100/50 p-4 dark:bg-stone-800/50'>
            {/* Image Preview Area */}
            <div className='mb-4 flex gap-2'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-16 rounded' />
              ))}
            </div>
            {/* Add Images Button */}
            <Skeleton className='mx-auto mb-4 h-8 w-44' />{' '}
            {/* Add Images button */}
            {/* Toolbar */}
            <div className='mb-4 flex flex-wrap gap-1'>
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-8 rounded' />
              ))}
            </div>
            {/* Editor Content */}
            <div className='min-h-screen space-y-3 rounded border bg-white p-4 dark:bg-gray-900'>
              <Skeleton className='h-6 w-3/4' /> {/* Heading line */}
              <Skeleton className='h-4 w-full' /> {/* Paragraph line 1 */}
              <Skeleton className='h-4 w-full' /> {/* Paragraph line 2 */}
              <Skeleton className='h-4 w-2/3' /> {/* Paragraph line 3 */}
              <Skeleton className='h-4 w-full' /> {/* Paragraph line 4 */}
            </div>
          </div>
        </div>

        {/* Anonymous Checkbox */}
        <div className='flex items-center gap-3'>
          <Skeleton className='h-5 w-5 rounded' /> {/* Checkbox */}
          <Skeleton className='h-5 w-24' /> {/* "Anonymous" label */}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4'>
          <Skeleton className='h-10 w-36 rounded-md' />{' '}
          {/* Create/Update button */}
          <Skeleton className='h-10 w-28 rounded-md' /> {/* Reset button */}
        </div>
      </div>

      {/* Content Preview Section */}
      <div className='mt-8'>
        <Skeleton className='mb-4 h-6 w-48' /> {/* "Content Preview" title */}
        <div className='rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>
      </div>
    </div>
  );
}
