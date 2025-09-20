'use client';

import { useMemo } from 'react';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { cn, ptSans } from '@/lib/utils';
import type { TransType } from '@prisma/client';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type TrendProps = {
  type: TransType;
  amount?: number;
  prevAmount?: number;
};

export const colorClasses = {
  INCOME: 'text-green-700 dark:text-green-300',
  EXPENSE: 'text-red-700 dark:text-red-300',
  INVESTMENT: 'text-indigo-700 dark:text-indigo-300',
  SAVING: 'text-amber-700 dark:text-amber-300',
};
export const bgColorClasses = {
  INCOME: 'bg-emerald-700/10 rounded-lg border border-emerald-800/5',
  EXPENSE: 'bg-pink-700/10 rounded-lg border border-red-800/5',
  INVESTMENT: 'bg-amber-700/10 rounded-lg border border-amber-800/5',
  SAVING: 'bg-indigo-700/10 rounded-lg border border-indigo-800/5',
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
    <div className='w-full rounded-lg bg-purple-800/20 px-4 py-2 shadow-xl/30'>
      <div
        className={cn('text-xs font-semibold underline', colorClasses[type])}
      >
        {type}
      </div>
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
      <div className='flex items-center justify-center space-x-1 text-xs text-nowrap'>
        {percentageChange <= 0 && (
          <ArrowDownLeft
            size={24}
            className='stroke-2 text-red-700 dark:text-red-700'
          />
        )}
        {percentageChange > 0 && (
          <ArrowUpRight
            size={24}
            className='text-emerald-700 dark:text-emerald-700'
          />
        )}
        {percentageChange} % vs last period
      </div>
    </div>
  );
};

export default Trend;
