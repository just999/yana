'use client';

import { Skeleton } from '@/components/ui';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BlogPageSkeleton() {
  return (
    <section className='container mx-auto px-4 py-12 md:px-6'>
      <div className='w-full'>
        {/* Back Button Skeleton */}
        <div className='mb-4'>
          <Skeleton className='h-8 w-16' />
        </div>

        {/* Header Section Skeleton */}
        <div className='flex flex-col items-center pb-2'>
          <Skeleton className='h-8 w-48 sm:h-9 sm:w-56' /> {/* Title */}
          <Skeleton className='mt-2 h-4 w-80' /> {/* Subtitle */}
        </div>

        {/* Blog Cards Grid Skeleton */}
        <div className='xs:grid-cols-1 sm:justify-content grid justify-items-stretch gap-6 sm:justify-self-start md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, index) => (
            <Card key={index} className='overflow-hidden'>
              <CardHeader className='p-0'>
                {/* Blog Image Skeleton */}
                <Skeleton className='aspect-video w-full' />
              </CardHeader>
              <CardContent className='p-4'>
                {/* Title Skeleton */}
                <Skeleton className='mb-2 h-5 w-full' />
                <Skeleton className='mb-2 h-5 w-3/4' />

                {/* Description Skeleton */}
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-2/3' />
                </div>

                {/* Metadata Skeleton */}
                <div className='mt-4 flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-6 w-6 rounded-full' /> {/* Avatar */}
                    <Skeleton className='h-3 w-20' /> {/* Author name */}
                  </div>
                  <Skeleton className='h-3 w-16' /> {/* Date */}
                </div>

                {/* Tags Skeleton */}
                <div className='mt-3 flex flex-wrap gap-1'>
                  <Skeleton className='h-5 w-12 rounded-full' />
                  <Skeleton className='h-5 w-16 rounded-full' />
                  <Skeleton className='h-5 w-10 rounded-full' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
