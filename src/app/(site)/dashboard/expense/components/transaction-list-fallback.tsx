// import { Skeleton } from '@/components/ui';

// export default function TransactionListFallback() {
//   return (
//     <div className='space-y-8'>
//       <div className='space-y-4'>
//         <TransactionSummaryItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//       </div>

//       <div className='space-y-4'>
//         <TransactionSummaryItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//         <TransactionItemSkeleton />
//       </div>
//     </div>
//   );
// }

// function TransactionItemSkeleton() {
//   return (
//     <div className='flex w-full items-center space-x-4'>
//       <div className='flex grow items-center'>
//         <Skeleton />
//       </div>
//       <div className='hidden min-w-[150px] items-center md:flex'>
//         <Skeleton />
//       </div>
//       <div className='min-w-[70px] text-right'>
//         <Skeleton />
//       </div>
//       <div className='flex min-w-[50px] justify-end'>
//         <Skeleton />
//       </div>
//     </div>
//   );
// }

// function TransactionSummaryItemSkeleton() {
//   return (
//     <div className='flex space-x-4'>
//       <div className='grow'>
//         <Skeleton />
//       </div>

//       <div className='min-w-[70px]'>
//         <Skeleton />
//       </div>
//       <div className='min-w-[50px]'></div>
//     </div>
//   );
// }

import { Skeleton } from '@/components/ui';

export default function TransactionListFallback() {
  return (
    <div className='h-screen space-y-8 border-2 border-red-500 p-4'>
      <div className='font-bold text-red-500'>SKELETON TEST</div>
      <Skeleton className='h-4 w-full bg-gray-300' />
      <Skeleton className='h-6 w-3/4 bg-gray-300' />
      <Skeleton className='h-8 w-1/2 bg-gray-300' />

      {/* Your existing skeleton structure */}
      <div className='space-y-4'>
        <TransactionSummaryItemSkeleton />
        <TransactionItemSkeleton />
        <TransactionItemSkeleton />
      </div>
    </div>
  );
}

function TransactionItemSkeleton() {
  return (
    <div className='flex w-full animate-pulse items-center space-x-4 rounded-lg px-2 py-3'>
      {/* Category/Icon placeholder */}
      <div className='flex-shrink-0'>
        <Skeleton className='h-10 w-10 rounded-full' />
      </div>

      {/* Main content */}
      <div className='min-w-0 flex-grow'>
        <Skeleton className='mb-1 h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>

      {/* Date (hidden on mobile) */}
      <div className='hidden min-w-[150px] items-center md:flex'>
        <Skeleton className='h-3 w-[100px]' />
      </div>

      {/* Amount */}
      <div className='min-w-[70px] text-right'>
        <Skeleton className='ml-auto h-4 w-[60px]' />
      </div>

      {/* Action button */}
      <div className='flex min-w-[50px] justify-end'>
        <Skeleton className='h-6 w-6 rounded' />
      </div>
    </div>
  );
}

function TransactionSummaryItemSkeleton() {
  return (
    <div className='flex space-x-4 rounded-t-lg border-b border-gray-100 bg-gray-50/50 px-2 py-4'>
      <div className='grow'>
        <Skeleton className='mb-2 h-5 w-[120px]' />
        <Skeleton className='h-3 w-[80px]' />
      </div>

      <div className='min-w-[70px] text-right'>
        <Skeleton className='ml-auto h-6 w-[80px]' />
      </div>

      <div className='min-w-[50px]'>
        {/* Empty space to align with action column */}
      </div>
    </div>
  );
}
