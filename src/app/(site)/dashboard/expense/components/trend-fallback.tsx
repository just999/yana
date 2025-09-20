// import { Skeleton } from '@/components/ui';

// export default function TrendFallback() {
//   return (
//     <div className='bg-accent w-3/5 space-y-5 lg:w-5/6'>
//       <div>
//         <Skeleton />
//       </div>
//       <div className='bg-accent mb-2'>
//         <Skeleton />
//       </div>
//       <div className='bg-accent flex space-x-2'>
//         <Skeleton />
//         <Skeleton />
//       </div>
//     </div>
//   );
// }
'use client';

import { Skeleton } from '@/components/ui';

export default function TrendFallback() {
  return (
    <div className='w-3/5 space-y-5 border-2 border-red-500 bg-red-100 p-4 lg:w-5/6'>
      <div className='font-bold text-red-600'>SKELETON TEST</div>
      <div>
        <Skeleton className='h-4 w-full bg-blue-300' />
      </div>
      <div className='mb-2'>
        <Skeleton className='h-6 w-3/4 bg-green-300' />
      </div>
      <div className='flex space-x-2'>
        <Skeleton className='h-3 w-1/3 bg-yellow-300' />
        <h2 className='z-10 flex h-screen items-center justify-center text-7xl text-neutral-900'>
          TEST
        </h2>
        <Skeleton className='h-3 w-1/4 bg-purple-300' />
      </div>
    </div>
  );
}
