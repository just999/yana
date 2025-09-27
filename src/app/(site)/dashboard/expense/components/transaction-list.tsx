'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getTransactionByRange,
  removeExpense,
  type TransactionResult,
} from '@/actions/expense-actions';
import TransactionItem from '@/components/expense/transaction-item';
import TransactionSummaryItem from '@/components/expense/transaction-summary-item';
import TransactionTotal from '@/components/expense/transaction-total';
import { Button, Separator } from '@/components/ui';
import { PAGE_SIZE } from '@/lib/constants';
import { groupAndSumTransactionsByDate } from '@/lib/utils';
import type { Transaction } from '@prisma/client';
import { ChevronDownIcon, EllipsisIcon, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { RangeTime } from './range';

type TransactionListProps = {
  range: RangeTime;
  initTrans: TransactionResult;
};

const TransactionList = ({ range, initTrans }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initTrans?.data || []
  );

  const [loading, setLoading] = useState(false);
  const [buttonHidden, setButtonHidden] = useState(
    !initTrans.pagination?.hasNextPage
  );
  const [hasMore, setHasMore] = useState(true);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState(50);
  const grouped = groupAndSumTransactionsByDate(transactions, range);

  useEffect(() => {
    if (transactions.length === 0) {
      return setMinHeight(50);
    }
    if (containerRef.current) {
      const height = containerRef.current.scrollHeight;
      // Add buffer for smooth experience
      setMinHeight(Math.max(height, 0));
    }
  }, [transactions.length]);

  // useEffect(() => {
  //   setTransactions(initTrans);
  //   setHasMore(true);
  //   setAutoLoadEnabled(true);
  //   isLoadingRef.current = false;
  // }, [range, initTrans]);

  // const loadMoreTransactions = useCallback(async () => {
  //   if (isLoadingRef.current || !hasMore) return;

  //   isLoadingRef.current = true;
  //   setLoading(true);

  //   try {
  //     const nextTransactions = await getTransactionByRange(
  //       range,
  //       transactions.length,
  //       10 // Load more items per request
  //     );

  //     if (nextTransactions?.success && nextTransactions?.data) {
  //       const newTransactions = nextTransactions.data;

  //       if (newTransactions.length === 0) {
  //         setHasMore(false);
  //       } else {
  //         setTransactions((prev) => [...prev, ...newTransactions]);

  //         if (nextTransactions.pagination) {
  //           setHasMore(nextTransactions.pagination.hasNextPage);
  //         } else {
  //           setHasMore(newTransactions.length >= 10);
  //         }
  //       }
  //     } else {
  //       setHasMore(false);
  //     }
  //   } catch (error) {
  //     console.error('Error loading more transactions:', error);
  //     setHasMore(false);
  //   } finally {
  //     setLoading(false);
  //     isLoadingRef.current = false;
  //   }
  // }, [range, transactions.length, hasMore]);

  // useEffect(() => {
  //   if (!autoLoadEnabled || !hasMore) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       const target = entries[0];
  //       if (target.isIntersecting && !isLoadingRef.current) {
  //         loadMoreTransactions();
  //       }
  //     },
  //     {
  //       threshold: 0.1,
  //       rootMargin: '100px 0px',
  //     }
  //   );

  //   const currentRef = loadMoreRef.current;
  //   if (currentRef) {
  //     observer.observe(currentRef);
  //   }

  //   return () => {
  //     if (currentRef) {
  //       observer.unobserve(currentRef);
  //     }
  //   };
  // }, [loadMoreTransactions, autoLoadEnabled, hasMore]);

  // const handleClick = async () => {
  //   setLoading(true);
  //   console.log('load more clicked');

  //   // Store scroll position before loading (use window scroll for larger content)
  //   const scrollTop = window.scrollY;

  //   try {
  //     const nextTransactions = await getTransactionByRange(
  //       range,
  //       transactions.length,
  //       PAGE_SIZE
  //     );

  //     if (nextTransactions?.success && nextTransactions?.data) {
  //       const newTransactions = nextTransactions.data;

  //       if (newTransactions.length === 0) {
  //         setButtonHidden(true);
  //         setHasMore(false);
  //       } else {
  //         setTransactions((prev) => [...prev, ...newTransactions]);

  //         // Use pagination info if available
  //         if (nextTransactions.pagination) {
  //           setHasMore(nextTransactions.pagination.hasNextPage);
  //           setButtonHidden(!nextTransactions.pagination.hasNextPage);
  //         } else {
  //           // Fallback: hide if we got fewer items than requested
  //           setButtonHidden(newTransactions.length < PAGE_SIZE);
  //         }
  //       }
  //     } else {
  //       setButtonHidden(true);
  //       setHasMore(false);
  //     }
  //   } catch (error) {
  //     console.error('Error loading more transactions:', error);
  //     setButtonHidden(true);
  //   } finally {
  //     setLoading(false);

  //     // Restore scroll position after content loads (use window scroll)
  //     setTimeout(() => {
  //       window.scrollTo({
  //         top: scrollTop,
  //         behavior: 'instant',
  //       });
  //     }, 50);
  //   }
  // };

  const handleClick = async () => {
    setLoading(true);
    let nextTransactions: TransactionResult | null = null;
    try {
      nextTransactions = await getTransactionByRange(
        range,
        transactions.length,
        PAGE_SIZE
      );
      if (nextTransactions.data)
        setButtonHidden(!nextTransactions.pagination?.hasNextPage);

      // setTransactions((prevTransactions) => [
      //   ...prevTransactions,
      //   ...(nextTransactions?.data || []),
      // ]);
      setTransactions((prevTransactions) => {
        const all = [...prevTransactions, ...(nextTransactions?.data || [])];
        const unique = Array.from(
          new Map(all.map((tx) => [tx.id, tx])).values()
        );
        return unique;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoved = async (id: string) => {
    setTransactions((prev) => [...prev].filter((t) => t.id !== id));

    const res = await removeExpense(id);

    if (res.error) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      router.refresh();
    }
  };

  // const handleManualLoad = async () => {
  //   setAutoLoadEnabled(false); // Disable auto-loading after manual click
  //   await loadMoreTransactions();
  // };

  const renderLoadMore = (
    <div className='flex w-full justify-center py-1'>
      {!buttonHidden ? (
        <Button
          variant='ghost'
          onClick={handleClick}
          disabled={loading}
          className='min-w-[120px] touch-manipulation shadow-lg' // Better touch target
          size='sm'
        >
          <div className='flex items-center gap-2'>
            {loading && <Loader className='h-4 w-4 animate-spin' />}
            <span className='flex items-center gap-2 font-mono text-xs font-normal text-sky-600 italic sm:text-base dark:text-sky-200'>
              {loading ? 'Loading...' : 'Load More'}{' '}
              <ChevronDownIcon size={18} className='size-5 stroke-2' />
            </span>
          </div>
        </Button>
      ) : (
        <div className='text-muted-foreground flex flex-col items-center gap-1'>
          <span className='text-xs sm:text-sm'>End of transactions</span>{' '}
          <EllipsisIcon className='size-6 stroke-black stroke-2 dark:stroke-white' />
        </div>
      )}
    </div>
  );

  return (
    // <div className='mx-auto min-h-screen max-w-xl space-y-8'>
    //   {Object.entries(grouped).map(([date, { transactions, amount }]) => (
    //     <div key={date}>
    //       <TransactionSummaryItem date={date} amount={amount} />
    //       <Separator />

    //       <section className='space-y-4'>
    //         {transactions.map((tr: Transaction) => (
    //           <TransactionItem
    //             key={tr.id}
    //             {...tr}
    //             onRemoved={() => handleRemoved(tr.id)}
    //           />
    //         ))}
    //       </section>
    //     </div>
    //   ))}

    //   {transactions.length === 0 && (
    //     <div className='text-center text-gray-400 dark:text-gray-500'>
    //       No Transaction
    //     </div>
    //   )}
    //   {hasMore && (
    //     <div ref={loadMoreRef} className='flex justify-center py-4'>
    //       {autoLoadEnabled ? (
    //         <div className='flex items-center space-x-2 text-gray-500'>
    //           {loading && <Loader className='animate-spin' size={16} />}
    //           <div>{loading ? 'Loading more...' : 'Scroll to load more'}</div>
    //         </div>
    //       ) : (
    //         <Button
    //           variant='ghost'
    //           onClick={handleManualLoad}
    //           disabled={loading}
    //           className='min-w-[120px]'
    //         >
    //           <div className='flex items-center space-x-1'>
    //             {loading && <Loader className='animate-spin' size={16} />}
    //             <div>Load More</div>
    //           </div>
    //         </Button>
    //       )}

    //       {/* <Button variant='ghost' onClick={handleClick} disabled={loading}>
    //         <div className='flex items-center space-x-1'>
    //           {loading && <Loader className='animate-spin' />}
    //           <div>Load More</div>
    //         </div>
    //       </Button> */}
    //     </div>
    //   )}

    //   {!hasMore && transactions.length > 0 && (
    //     <div className='py-8 text-center text-gray-400 dark:text-gray-500'>
    //       No more transactions to load
    //     </div>
    //   )}
    // </div>

    // <div
    //   className='mx-auto w-xl space-y-2'
    //   ref={containerRef}
    //   style={{ minHeight: `${minHeight}px` }}
    // >
    //   {Object.entries(grouped).map(([date, { total, days }]) => (
    //     <div key={date} className='flex flex-col gap-3'>
    //       <TransactionTotal date={date} amount={total} range={range} />
    //       <Separator className='data-[orientation=vertical]:h-0 data-[orientation=vertical]:w-0' />
    //       {Object.entries(days).map(([day, { transactions, amount }]) => (
    //         <div key={day} className='bg-accent/50 space-y-2 rounded-md pt-2'>
    //           <div className='text-muted-foreground text-xs font-semibold'>
    //             {/* {day}-${amount.toFixed(0)} */}
    //             <TransactionSummaryItem
    //               date={day}
    //               amount={+amount.toFixed(0)}
    //             />
    //           </div>
    //           <section className='bg-accent/40 space-y-1.5 rounded-lg border py-1 backdrop-blur-2xl'>
    //             {transactions.map((transaction, i) => (
    //               <div key={transaction.id} className=''>
    //                 <TransactionItem
    //                   {...transaction}
    //                   i={i}
    //                   onRemoved={() => handleRemoved(transaction.id)}
    //                 />
    //               </div>
    //             ))}
    //           </section>
    //         </div>
    //       ))}
    //     </div>
    //   ))}
    //   {transactions.length === 0 && (
    //     <div className='dark:text-accent-foreground/30 text-center text-gray-400'>
    //       No Transaction
    //     </div>
    //   )}
    //   {!buttonHidden ? (
    //     <div className='flex justify-center'>
    //       <Button variant='ghost' onClick={handleClick} disabled={loading}>
    //         <div className='flex items-center space-x-1'>
    //           {loading && <Loader className='animate-spin' />}
    //           <div>Load More</div>
    //         </div>
    //       </Button>
    //     </div>
    //   ) : (
    //     <div className='flex w-full justify-center'>
    //       <EllipsisIcon />
    //     </div>
    //   )}
    // </div>

    <div
      className='w-full space-y-3 overflow-x-hidden sm:space-y-4'
      ref={containerRef}
      style={{ minHeight: `${minHeight}px` }}
    >
      {Object.entries(grouped).map(([date, { total, days }]) => (
        <div key={date} className='flex flex-col gap-2 sm:gap-4'>
          <TransactionTotal date={date} amount={total} range={range} />
          <Separator className='mx-2 sm:mx-0' />

          {Object.entries(days).map(([day, { transactions, amount }]) => (
            <div
              key={day}
              className='space-y-2 rounded-sm bg-red-200/30 dark:bg-transparent'
            >
              {/* Summary Item - Mobile optimized */}
              <div className='px-2 sm:px-0'>
                <TransactionSummaryItem
                  date={day}
                  amount={+amount.toFixed(0)}
                  range={range}
                />
              </div>

              {/* Transactions Container - Mobile optimized */}
              <div className='bg-card/50 overflow-hidden backdrop-blur-sm'>
                <div className='divide-border/50 divide-y'>
                  {transactions.map((transaction, i) => (
                    <div
                      key={`${transaction.id}-${i}`}
                      className='hover:bg-accent/20 transition-colors'
                    >
                      <TransactionItem
                        {...transaction}
                        i={i}
                        onRemoved={() => handleRemoved(transaction.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Empty State - Mobile friendly */}
      {transactions.length === 0 ? (
        <div className='flex min-h-[100px] w-full items-center justify-center rounded-lg border border-dashed'>
          <div className='text-muted-foreground text-center'>
            <div className='text-sm sm:text-base'>No transactions found</div>
            <div className='text-muted-foreground/60 text-xs sm:text-[10px]'>
              Try adjusting your date range
            </div>
          </div>
        </div>
      ) : (
        renderLoadMore
      )}

      {/* Load More / End Indicator - Mobile optimized */}
      {/* <div className='flex w-full justify-center py-2'>
        {!buttonHidden ? (
          <Button
            variant='ghost'
            onClick={handleClick}
            disabled={loading}
            className='min-w-[120px] touch-manipulation shadow-lg'
            size='sm'
          >
            <div className='flex items-center gap-2'>
              {loading && <Loader className='h-4 w-4 animate-spin' />}
              <span className='flex items-center gap-2 font-mono text-xs font-normal text-sky-600 italic sm:text-base dark:text-sky-200'>
                {loading ? 'Loading...' : 'Load More'}{' '}
                <ChevronDownIcon size={18} className='size-5 stroke-2' />
              </span>
            </div>
          </Button>
        ) : (
          <div className='text-muted-foreground flex flex-col items-center gap-2'>
            <span className='text-xs sm:text-sm'>End of transactions</span>{' '}
            <EllipsisIcon className='size-6 stroke-black stroke-2 dark:stroke-white' />
          </div>
        )}
      </div> */}
    </div>
  );
};

export default TransactionList;
