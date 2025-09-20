'use client';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { cn } from '@/lib/utils';

type TransactionSummaryItemProps = {
  date: string;
  amount: number;
};

const TransactionSummaryItem = ({
  date,
  amount,
}: TransactionSummaryItemProps) => {
  const { prefix, value } = useFormatCurrency(amount);
  return (
    <div className='flex pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400'>
      <div className='ml-2 grow'>{date}</div>
      <div
        className={cn(
          'min-w-[70px] rounded-xl bg-amber-800/20 px-2 text-center font-semibold',
          amount < 0
            ? 'border-b-2 border-red-800 bg-pink-700/20 text-xs text-red-400'
            : 'border-b-2 border-lime-800 bg-emerald-700/20 text-lime-400'
        )}
      >
        <span className='text-[10px]'>{prefix} </span>
        <span>{value}</span>
      </div>
      <div className='min-w-[50px]'></div>
    </div>
  );
};

export default TransactionSummaryItem;
