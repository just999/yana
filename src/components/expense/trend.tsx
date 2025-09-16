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

const Trend = ({ type, amount, prevAmount }: TrendProps) => {
  const calcPercentageChange = (amount: number, prevAmount: number) => {
    if (!amount || !prevAmount) return 0;

    return ((amount - prevAmount) / prevAmount) * 100;
  };

  const percentageChange = useMemo(() => {
    if (!amount || !prevAmount) return 0;
    return +calcPercentageChange(amount, prevAmount).toFixed(0);
  }, [amount, prevAmount]);

  // const formatCurrency = (amount: number) =>
  //   new Intl.NumberFormat('id-ID', {
  //     style: 'currency',
  //     currency: 'IDR',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(amount);

  // const formatted = formatCurrency(amount || 0);

  // const match = formatted.match(/^(\D+)([\d.,]+)/);
  // const prefix = match?.[1] ?? '';
  // const value = match?.[2] ?? '';

  // console.log('Amount type:', typeof amount, 'Value:', amount);

  const { prefix, value } = useFormatCurrency(amount as number);

  return (
    <div>
      <div className={cn('text-xs font-semibold', colorClasses[type])}>
        {type}
      </div>
      <div
        className={cn(
          'mb-2 text-sm font-normal text-black dark:text-amber-100',
          ptSans.className
        )}
      >
        <span className={cn('font-mono font-normal text-emerald-100')}>
          {prefix}
        </span>
        <span>{value}</span>
      </div>
      <div className='flex items-center space-x-1 text-xs text-nowrap'>
        {percentageChange <= 0 && (
          <ArrowDownLeft
            size={12}
            className='stroke-2 text-red-700 dark:text-red-700'
          />
        )}
        {percentageChange > 0 && (
          <ArrowUpRight
            size={12}
            className='text-emerald-700 dark:text-emerald-700'
          />
        )}
        {percentageChange} % vs last period
      </div>
    </div>
  );
};

export default Trend;
