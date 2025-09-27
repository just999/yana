import { Suspense } from 'react';

import { getTransactionByRange } from '@/actions/expense-actions';
import { Button, Separator } from '@/components/ui';
import { PAGE_SIZE, tranTypes } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { type RangeTime } from './components/range';
import { RangeButton } from './components/range-button';
import TransactionListFallback from './components/transaction-list-fallback';
import TransactionListWrapper from './components/transaction-list-wrapper';
import Trend from './components/trend';
import TrendFallback from './components/trend-fallback';

type ExpensePageProps = {
  searchParams: Promise<{ range: string }>;
};

const ExpensePage = async ({ searchParams }: ExpensePageProps) => {
  const range = ((await searchParams).range as RangeTime) || 'today';

  const transactions = (await getTransactionByRange(range)).data;

  return (
    <div className='xs:min-w-xl mx-auto max-w-[430px] px-0 sm:px-6 lg:w-full lg:px-8 2xl:max-w-5xl'>
      <div className='expense space-y-8 rounded-lg px-1 py-2 shadow-[20px_20px_60px_#bababa,-20px_-20px_60px_#ffffff] lg:min-w-5xl xl:min-w-xs dark:shadow-[19px_19px_86px_#0c0a0a,-19px_-19px_86px_#3e3c3c]'>
        <section className='xs:grid-cols-1 mx-auto mb-4 grid w-full max-w-xl grid-cols-1 gap-8'>
          <h1 className='px-4 text-2xl font-semibold underline'>Summary</h1>
        </section>
        <section className='m-auto flex w-full flex-col'>
          <span className='flex w-full items-end justify-between'>
            <h2 className='px-4 font-mono text-lg'>Trend</h2>
            <span className='text-end'>
              <RangeButton defaultRange={range} />
            </span>
          </span>
          <Separator
            className='my-2 h-1 border-t-gray-300 border-b-gray-300'
            decorative
          />
          <div
            className={cn(
              'xs:grid-cols-2 mb-4 grid auto-rows-min grid-cols-2 gap-2 space-x-8 rounded-xl bg-fuchsia-900/30 p-1'
            )}
          >
            {tranTypes.map((type) => (
              <Suspense key={type} fallback={<TrendFallback />}>
                <Trend type={type} range={range} />
              </Suspense>
            ))}
          </div>
        </section>
        <section className='mx-auto mb-0 flex items-center justify-between px-2'>
          <h1 className='text-2xl font-semibold'>Transactions</h1>
          <Button asChild variant={'ghost'} size='sm' className='shadow-xl/30'>
            <Link
              href={'/dashboard/expense/add'}
              className='flex items-center space-x-1'
            >
              <PlusCircle className='h-4 w-4' /> <div>Add</div>
            </Link>
          </Button>
        </section>
        <Suspense fallback={<TransactionListFallback />}>
          <TransactionListWrapper range={range} offset={0} limit={PAGE_SIZE} />
        </Suspense>
      </div>
    </div>
  );
};

export default ExpensePage;
