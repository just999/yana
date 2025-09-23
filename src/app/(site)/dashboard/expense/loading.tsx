'use client';

import { Skeleton } from '@/components/ui';

export default function ExpensePageSkeleton() {
  return (
    <div className='expense max-w-xl space-y-8 pt-0'>
      {/* Summary Section Skeleton */}
      <section className='xs:grid-cols-2 mx-auto mb-8 grid w-full max-w-xl grid-cols-1 gap-8'>
        <Skeleton className='h-8 w-48' /> {/* Summary title */}
      </section>

      {/* Trend Section Skeleton */}
      <section className='m-auto flex max-w-xl flex-col'>
        <div className='flex w-full items-end justify-between'>
          <Skeleton className='h-6 w-20' /> {/* Trend title */}
          <Skeleton className='h-8 w-24' /> {/* RangeButton skeleton */}
        </div>

        <div className='my-2'>
          <Skeleton className='h-1 w-full' /> {/* Separator */}
        </div>

        {/* Trend Cards Grid */}
        <div className='xs:grid-cols-2 mb-4 grid grid-cols-1 gap-2 space-x-8 rounded-xl bg-gray-200/30 p-2 dark:bg-fuchsia-700/20'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='w-full rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800'
            >
              <div className='space-y-3'>
                {/* Type */}
                <Skeleton className='h-4 w-1/3 rounded' />
                {/* Amount */}
                <Skeleton className='h-6 w-1/2 rounded' />
                {/* Change indicator */}
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4 rounded-full' />
                  <Skeleton className='h-3 w-3/4 rounded' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions Header Skeleton */}
      <section className='mx-auto mb-2 flex max-w-xl items-center justify-between'>
        <Skeleton className='h-8 w-40' /> {/* Transactions title */}
        <Skeleton className='h-9 w-20' /> {/* Add button */}
      </section>

      {/* Transactions List Skeleton */}
      <div className='mx-auto max-w-xl space-y-4'>
        {/* Summary Item */}
        <div className='flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4 dark:bg-amber-300/30'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
          <Skeleton className='h-6 w-16' />
        </div>

        {/* Transaction Items */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className='flex items-center gap-4 rounded-lg border p-3'
          >
            {/* Icon */}
            <Skeleton className='h-10 w-10 rounded-full' />

            {/* Content */}
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-28' />
            </div>

            {/* Date */}
            <div className='hidden md:block'>
              <Skeleton className='h-3 w-20' />
            </div>

            {/* Amount */}
            <Skeleton className='h-5 w-16' />

            {/* Actions */}
            <Skeleton className='h-8 w-8 rounded' />
          </div>
        ))}
      </div>
    </div>
  );
}
