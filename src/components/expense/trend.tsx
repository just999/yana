'use client';

import { useMemo } from 'react';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { cn, ptSans } from '@/lib/utils';
import type { TransType } from '@prisma/client';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ListMinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react';

import { typeMap } from './transaction-item';

type TrendProps = {
  type: TransType;
  amount?: number;
  prevAmount?: number;
  className?: string;
};

export const colorClasses = {
  INCOME:
    'text-teal-700 decoration-current decoration-2 font-bold dark:text-green-300',
  EXPENSE:
    'text-red-700 decoration-current font-bold  decoration-2 dark:text-red-300',
  INVESTMENT:
    'text-amber-700 decoration-current font-bold  decoration-2 dark:text-amber-300',
  SAVING:
    'text-indigo-700 decoration-current font-bold  decoration-2 dark:text-indigo-300',
};
export const bgColorClasses = {
  INCOME:
    'bg-emerald-700/10 border-b-4 border-emerald-600  border border-emerald-800/5',
  EXPENSE: 'bg-pink-700/10  border border-red-800/5',
  INVESTMENT: 'bg-amber-700/10  border border-amber-800/5',
  SAVING: 'bg-indigo-700/10  border border-indigo-800/5',
};
export const bgColor = {
  INCOME:
    'dark:bg-emerald-500/30 bg-emerald-200/80 rounded-lg border border-emerald-800/5  backdrop-blur-xl ',
  EXPENSE:
    'dark:bg-rose-500/30 bg-red-200/80 rounded-lg border border-red-800/5  backdrop-blur-xl',
  INVESTMENT:
    'dark:bg-amber-500/30 bg-amber-200/80 rounded-lg border border-amber-800/5c',
  SAVING:
    'dark:bg-indigo-500/30 bg-indigo-200/80 rounded-lg border border-indigo-800/5 backdrop-blur-xl',
};

const Trend = ({ type, amount, prevAmount, className }: TrendProps) => {
  const calcPercentageChange = (amount: number, prevAmount: number) => {
    if (!amount || !prevAmount) return 0;

    return ((amount - prevAmount) / prevAmount) * 100;
  };

  const percentageChange = useMemo(() => {
    if (!amount || !prevAmount) return 0;
    return +calcPercentageChange(amount, prevAmount).toFixed(0);
  }, [amount, prevAmount]);

  const { prefix, value } = useFormatCurrency(amount as number);

  return (
    <div
      className={cn(
        'w-full rounded-lg bg-white/20 px-2 py-2 shadow-xl/30 backdrop-blur-lg',
        className,
        bgColor[type]
      )}
    >
      <div
        className={cn('text-xs font-semibold underline', colorClasses[type])}
      >
        {type}
      </div>
      {+value > 0 ? (
        <div
          className={cn(
            'my-2 text-sm font-normal text-black dark:text-amber-100',
            ptSans.className
          )}
        >
          <span className={cn('font-mono font-normal dark:text-emerald-100')}>
            {prefix}
          </span>
          <span>{value}</span>
        </div>
      ) : (
        <div className={cn('my-2 flex w-full justify-center px-2 text-center')}>
          <div
            className={cn(
              'w-fit rounded-[50px] border-black px-2 text-center text-xs shadow-[20px_20px_60px_#0a0606,-20px_-20px_60px_#565252]',
              bgColorClasses[type]
            )}
          >
            No Activity
          </div>
        </div>
      )}
      {+value > 0 ? (
        <div className='flex items-center justify-center gap-2 space-x-1 text-xs text-nowrap'>
          {percentageChange <= 0 && (
            <TrendingDownIcon
              size={24}
              className='svg stroke-2 text-pink-500 dark:text-pink-700'
            />
          )}
          {percentageChange > 0 && (
            <TrendingUpIcon
              size={24}
              className='text-emerald-700 dark:text-emerald-700'
            />
          )}
          {percentageChange} % vs last period
        </div>
      ) : (
        <div className='flex items-center justify-center gap-2 space-x-1 text-xs text-nowrap'>
          <ListMinusIcon /> no data
        </div>
      )}
    </div>
  );
};

export default Trend;
