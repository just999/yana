'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getTransactionByRange,
  removeExpense,
} from '@/actions/expense-actions';
import TransactionItem from '@/components/expense/transaction-item';
import TransactionSummaryItem from '@/components/expense/transaction-summary-item';
import { Button, Separator } from '@/components/ui';
import { PAGE_SIZE } from '@/lib/constants';
import { groupAndSumTransactionsByDate } from '@/lib/utils';
import type { Transaction } from '@prisma/client';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { RangeTime } from './range';

type TransactionListProps = {
  range: RangeTime;
  initTrans: Transaction[];
};

const TransactionList = ({ range, initTrans }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initTrans);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const router = useRouter();
  const grouped = groupAndSumTransactionsByDate(transactions);

  useEffect(() => {
    setTransactions(initTrans);
    setHasMore(true);
    setAutoLoadEnabled(true);
    isLoadingRef.current = false;
  }, [range, initTrans]);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const nextTransactions = await getTransactionByRange(
        range,
        transactions.length,
        10 // Load more items per request
      );

      if (nextTransactions?.success && nextTransactions?.data) {
        const newTransactions = nextTransactions.data;

        if (newTransactions.length === 0) {
          setHasMore(false);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);

          if (nextTransactions.pagination) {
            setHasMore(nextTransactions.pagination.hasNextPage);
          } else {
            setHasMore(newTransactions.length >= 10);
          }
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [range, transactions.length, hasMore]);

  useEffect(() => {
    if (!autoLoadEnabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingRef.current) {
          loadMoreTransactions();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px', // Start loading 100px before the element is visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreTransactions, autoLoadEnabled, hasMore]);

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

  const handleManualLoad = async () => {
    setAutoLoadEnabled(false); // Disable auto-loading after manual click
    await loadMoreTransactions();
  };

  return (
    <div className='mx-auto min-h-screen max-w-xl space-y-8'>
      {Object.entries(grouped).map(([date, { transactions, amount }]) => (
        <div key={date}>
          <TransactionSummaryItem date={date} amount={amount} />
          <Separator />

          <section className='space-y-4'>
            {transactions.map((tr: Transaction) => (
              <TransactionItem
                key={tr.id}
                {...tr}
                onRemoved={() => handleRemoved(tr.id)}
              />
            ))}
          </section>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className='text-center text-gray-400 dark:text-gray-500'>
          No Transaction
        </div>
      )}
      {hasMore && (
        <div ref={loadMoreRef} className='flex justify-center py-4'>
          {autoLoadEnabled ? (
            <div className='flex items-center space-x-2 text-gray-500'>
              {loading && <Loader className='animate-spin' size={16} />}
              <div>{loading ? 'Loading more...' : 'Scroll to load more'}</div>
            </div>
          ) : (
            <Button
              variant='ghost'
              onClick={handleManualLoad}
              disabled={loading}
              className='min-w-[120px]'
            >
              <div className='flex items-center space-x-1'>
                {loading && <Loader className='animate-spin' size={16} />}
                <div>Load More</div>
              </div>
            </Button>
          )}

          {/* <Button variant='ghost' onClick={handleClick} disabled={loading}>
            <div className='flex items-center space-x-1'>
              {loading && <Loader className='animate-spin' />}
              <div>Load More</div>
            </div>
          </Button> */}
        </div>
      )}

      {!hasMore && transactions.length > 0 && (
        <div className='py-8 text-center text-gray-400 dark:text-gray-500'>
          No more transactions to load
        </div>
      )}
    </div>
  );
};

export default TransactionList;
