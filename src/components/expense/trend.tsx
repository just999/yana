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
};

export const colorClasses = {
  INCOME: 'text-green-700 dark:text-green-300',
  EXPENSE: 'text-red-700 dark:text-red-300',
  INVESTMENT: 'text-amber-700 dark:text-amber-300',
  SAVING: 'text-indigo-700 dark:text-indigo-300',
};
export const bgColorClasses = {
  INCOME: 'bg-emerald-700/10 rounded-lg border border-emerald-800/5',
  EXPENSE: 'bg-pink-700/10 rounded-lg border border-red-800/5',
  INVESTMENT: 'bg-amber-700/10 rounded-lg border border-amber-800/5',
  SAVING: 'bg-indigo-700/10 rounded-lg border border-indigo-800/5',
};
export const bgColor = {
  INCOME:
    'bg-emerald-500/30 rounded-lg border border-emerald-800/5 backdrop-blur-xl ',
  EXPENSE:
    'bg-rose-500/30 rounded-lg border border-red-800/5  backdrop-blur-xl',
  INVESTMENT: 'bg-amber-500/30 rounded-lg border border-amber-800/5c',
  SAVING:
    'bg-indigo-500/30 rounded-lg border border-indigo-800/5 backdrop-blur-xl',
};

const Trend = ({ type, amount, prevAmount }: TrendProps) => {
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
      className={cn('w-full rounded-lg px-4 py-2 shadow-xl/30', bgColor[type])}
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
          <span className={cn('font-mono font-normal text-emerald-100')}>
            {prefix}
          </span>
          <span>{value}</span>
        </div>
      ) : (
        <div className='text-muted/80 my-2 rounded-lg bg-white/5 text-sm backdrop-blur-sm'>
          No Activity
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
