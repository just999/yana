import { Suspense } from 'react';

import { Button, Separator } from '@/components/ui';
import { PAGE_SIZE, tranTypes } from '@/lib/constants';
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

  return (
    <div className='expense max-w-xl space-y-8 pt-0'>
      <section className='xs:grid-cols-2 mx-auto mb-8 grid w-full max-w-xl grid-cols-1 gap-8'>
        <h1 className='text-2xl font-semibold'>Summary</h1>
      </section>

      <section className='m-auto flex max-w-xl flex-col'>
        <span className='flex w-full items-end justify-between'>
          <h2 className='font-mono text-lg'>Trend</h2>

          <span className='text-end'>
            <RangeButton defaultRange={range} />
          </span>
        </span>
        <Separator
          className='my-2 h-1 border-t-gray-300 border-b-gray-300'
          decorative
        />
        <div className='xs:grid-cols-2 mb-4 grid grid-cols-1 gap-2 space-x-8 rounded-xl bg-fuchsia-700/20 p-2'>
          {tranTypes.map((type) => (
            <Suspense key={type} fallback={<TrendFallback />}>
              <Trend type={type} range={range} />
            </Suspense>
          ))}
        </div>
      </section>

      <section className='mx-auto mb-8 flex max-w-xl items-center justify-between'>
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
  );
};

export default ExpensePage;
