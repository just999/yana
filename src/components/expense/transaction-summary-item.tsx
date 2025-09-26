'use client';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import type { RangeType } from '@/lib/types';
import { cn, inter } from '@/lib/utils';
import { Calendar, ScaleIcon } from 'lucide-react';

import { Badge } from '../ui';

type TransactionSummaryItemProps = {
  date: string;
  amount: number;
  range?: RangeType;
};

const TransactionSummaryItem = ({
  date,
  amount,
}: TransactionSummaryItemProps) => {
  const { prefix, value } = useFormatCurrency(amount);
  return (
    <div className={cn('flex w-full items-center px-2 text-[10px]')}>
      <Calendar className={cn('mr-2 hidden h-4 w-4 sm:block')} />{' '}
      <div className='ml-2 flex grow'>{date}</div>
      <div className='hidden min-w-[150px] items-center md:flex'>
        <Badge
          variant='outline'
          className={cn(
            'border-b-4 border-indigo-400/30 text-[10px] font-bold text-black transition-colors hover:bg-indigo-900/20 dark:bg-indigo-800/10 dark:text-indigo-100',
            inter.className
          )}
        >
          <ScaleIcon className='mr-1 inline size-4 h-3 w-3 font-bold text-black' />
          Daily Balance
        </Badge>
      </div>
      <div className='min-w-[50px]'></div>
      <div
        className={cn(
          'min-w-[70px] rounded-xl bg-amber-800/20 px-2 text-center',
          amount < 0
            ? 'border-b-2 border-red-800 text-xs font-bold text-black dark:bg-pink-700/20 dark:text-fuchsia-300'
            : 'border-b-2 border-lime-800 font-bold text-black dark:bg-emerald-700/20 dark:text-lime-400'
        )}
      >
        <span className='text-[10px]'>{prefix} </span>
        <span className='text-[10px]'>{value}</span>
      </div>
    </div>
  );
};

export default TransactionSummaryItem;
