'use client';

import type { RangeType } from '@/actions/expense-actions';
import { useFormatCurrency } from '@/hooks/use-format-currency';
import { cn } from '@/lib/utils';

type TransactionSummaryItemProps = {
  date: string;
  amount: number;
  range: RangeType;
};

const TransactionTotal = ({
  date,
  amount,
  range,
}: TransactionSummaryItemProps) => {
  const { prefix, value } = useFormatCurrency(amount);

  const rangeTime =
    range === 'w'
      ? '1 week'
      : range === 'm'
        ? '1 month'
        : range === 'today'
          ? 'today'
          : '1 year';
  return (
    <div className='flex pb-0 text-xs font-semibold text-gray-500 dark:text-gray-400'>
      <div className='ml-2 flex grow'>
        starting from: {date} ({rangeTime})
      </div>
      <div className='hidden min-w-[150px] items-center md:flex'></div>
      <div
        className={cn(
          'min-w-[70px] rounded-xl bg-amber-800/20 px-2 text-center font-semibold',
          amount < 0
            ? 'border-b-2 border-red-800 bg-pink-700/20 text-xs text-fuchsia-300'
            : 'border-b-2 border-lime-800 bg-emerald-700/20 text-lime-400'
        )}
      >
        <span className='text-[10px]'>Total: {prefix} </span>
        <span className='text-[10px]'>{value}</span>
      </div>
      {/* <div className='min-w-[50px]'></div> */}
    </div>
  );
};

export default TransactionTotal;
