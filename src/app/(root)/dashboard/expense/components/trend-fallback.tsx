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
// 'use client';

// import { Skeleton } from '@/components/ui';

// export default function TrendFallback() {
//   return (
//     <div className='border-accent-500 dark:bg-accent-100 w-3/5 space-y-5 border-2 p-4 pt-16 lg:w-5/6'>
//       {/* <div className='text-accent-600 font-bold'>SKELETON TEST</div> */}
//       <div>
//         <Skeleton className='h-4 w-full bg-blue-300' />
//       </div>
//       <div className='mb-2'>
//         <Skeleton className='h-6 w-3/4 bg-green-300' />
//       </div>
//       <div className='flex space-x-2'>
//         <Skeleton className='h-3 w-1/3 bg-yellow-300' />
//         <h2 className='z-10 flex h-screen items-center justify-center text-7xl text-neutral-900'>
//           TEST
//         </h2>
//         <Skeleton className='h-3 w-1/4 bg-purple-300' />
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { Skeleton } from '@/components/ui';

// export default function TrendFallback() {
//   return (
//     <div className='mx-auto flex w-full max-w-xl flex-col space-y-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
//       {/* Header with icon and title */}
//       <div className='flex items-center space-x-3'>
//         <Skeleton className='h-8 w-8 rounded-full' /> {/* Icon */}
//         <Skeleton className='h-5 w-20' /> {/* Title */}
//       </div>
//       {/* Main value */}
//       <Skeleton className='h-8 w-24' /> {/* Large number */}
//       {/* Progress bar section */}
//       <div className='space-y-2'>
//         <Skeleton className='h-2 w-full rounded-full' /> {/* Progress bar */}
//         <div className='flex justify-between text-xs'>
//           <Skeleton className='h-3 w-12' />
//           <Skeleton className='h-3 w-12' />
//         </div>
//       </div>
//       {/* Percentage change */}
//       <Skeleton className='h-4 w-16 self-end' /> {/* Change indicator */}
//     </div>
//   );
// }

'use client';

import { Skeleton } from '@/components/ui';

export default function TrendFallback() {
  return (
    <div className='w-full rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800'>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-1/3 rounded' />
        <Skeleton className='h-6 w-1/2 rounded' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <Skeleton className='h-3 w-3/4 rounded' />
        </div>
      </div>
    </div>
  );
}
