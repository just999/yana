// import loader from '@/assets/loader.gif';
// import Image from 'next/image';

// const LoadingPage = () => {
//   return (
//     <div
//       style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         width: '100vw',
//       }}
//     >
//       <Image
//         src={loader}
//         height={80}
//         width={80}
//         alt='Loading...'
//         style={{ width: '10%', height: 'auto' }}
//         priority
//       />
//     </div>
//   );
// };

// export default LoadingPage;

'use client';

import { Skeleton } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePageSkeleton() {
  return (
    <div className='container mx-auto max-w-6xl space-y-16 px-4'>
      {/* Hero Section Skeleton */}
      <section className='from-primary/10 to-background relative overflow-hidden rounded-md bg-gradient-to-b py-20 md:py-28'>
        <div className='px-4 md:px-6'>
          <div className='grid items-center gap-6 lg:grid-cols-2 lg:gap-12'>
            {/* Left Content */}
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32 rounded-lg' /> {/* Badge */}
              <Skeleton className='h-12 w-full max-w-md' /> {/* Title */}
              <Skeleton className='h-5 w-full max-w-lg' />{' '}
              {/* Description line 1 */}
              <Skeleton className='h-5 w-full max-w-md' />{' '}
              {/* Description line 2 */}
              <div className='flex flex-col gap-3 sm:flex-row'>
                <Skeleton className='h-10 w-32' /> {/* Read Stories button */}
                <Skeleton className='h-10 w-36' /> {/* Share Story button */}
              </div>
            </div>

            {/* Right Image */}
            <div className='relative h-[300px] overflow-hidden rounded-xl sm:h-[400px] lg:h-[500px]'>
              <Skeleton className='h-full w-full' /> {/* Image placeholder */}
            </div>
          </div>
        </div>
      </section>

      {/* Community Values Skeleton */}
      <section className='container px-4 py-12 md:px-6'>
        <Skeleton className='mx-auto mb-12 h-8 w-64' /> {/* Section title */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <Skeleton className='h-6 w-24' /> {/* Value title */}
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />{' '}
                    {/* Description line 1 */}
                    <Skeleton className='h-4 w-4/5' />{' '}
                    {/* Description line 2 */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Posts Skeleton */}
      <section className='space-y-8'>
        <Skeleton className='mx-auto h-8 w-48' /> {/* Featured title */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, index) => (
            <Card key={index} className='overflow-hidden'>
              <CardContent className='p-0'>
                <Skeleton className='aspect-video w-full' />{' '}
                {/* Featured image */}
                <div className='space-y-3 p-4'>
                  <Skeleton className='h-5 w-20 rounded-full' />{' '}
                  {/* Category */}
                  <Skeleton className='h-6 w-full' /> {/* Title */}
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' /> {/* Excerpt line 1 */}
                    <Skeleton className='h-4 w-3/4' /> {/* Excerpt line 2 */}
                  </div>
                  <div className='flex items-center justify-between pt-2'>
                    <div className='flex items-center space-x-2'>
                      <Skeleton className='h-6 w-6 rounded-full' />{' '}
                      {/* Author avatar */}
                      <Skeleton className='h-4 w-20' /> {/* Author name */}
                    </div>
                    <Skeleton className='h-3 w-16' /> {/* Date */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Resources Section Skeleton */}
      <section className='space-y-8'>
        <Skeleton className='mx-auto h-8 w-56' /> {/* Resources title */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Card key={index} className='text-center'>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <Skeleton className='mx-auto h-12 w-12 rounded-full' />{' '}
                  {/* Icon */}
                  <Skeleton className='mx-auto h-5 w-24' />{' '}
                  {/* Resource title */}
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />{' '}
                    {/* Description line 1 */}
                    <Skeleton className='mx-auto h-4 w-3/4' />{' '}
                    {/* Description line 2 */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Skeleton */}
      <section className='bg-primary text-primary-foreground w-full pt-16 pb-20'>
        <div className='container px-4 text-center md:px-6'>
          <Skeleton className='mx-auto mb-4 h-8 w-80 bg-white/20' />{' '}
          {/* CTA title */}
          <Skeleton className='mx-auto mb-8 h-5 w-96 max-w-full bg-white/20' />{' '}
          {/* CTA description */}
          <Skeleton className='mx-auto h-10 w-40 bg-white/20' />{' '}
          {/* CTA button */}
        </div>
      </section>
    </div>
  );
}
