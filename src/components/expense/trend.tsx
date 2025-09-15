'use client';

import { useMemo } from 'react';

import { cn, ptSans } from '@/lib/utils';

type TrendProps = {
  type: 'Income' | 'Expense' | 'Investment' | 'Saving';
  amount?: number;
  prevAmount?: number;
};

const Trend = ({ type, amount, prevAmount }: TrendProps) => {
  const colorClasses = {
    Income: 'text-green-700 dark:text-green-300',
    Expense: 'text-red-700 dark:text-red-300',
    Investment: 'text-indigo-700 dark:text-indigo-300',
    Saving: 'text-amber-700 dark:text-amber-300',
  };

  const calcPercentageChange = (amount: number, prevAmount: number) => {
    if (!amount || !prevAmount) return 0;

    return ((amount - prevAmount) / prevAmount) * 100;
  };
  console.log(
    '🚀 ~ calcPercentageChange ~ calcPercentageChange:',
    amount && prevAmount && calcPercentageChange(amount, prevAmount)
  );

  const percentageChange = useMemo(() => {
    if (!amount || !prevAmount) return 0;
    return calcPercentageChange(amount, prevAmount);
  }, [amount, prevAmount]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatted = formatCurrency(amount || 0);

  const match = formatted.match(/^(\D+)([\d.,]+)/);
  const prefix = match?.[1] ?? '';
  const value = match?.[2] ?? '';

  console.log('Amount type:', typeof amount, 'Value:', amount);

  return (
    <div>
      <div className={cn('text-sm font-semibold', colorClasses[type])}>
        {type}
      </div>
      <div
        className={cn(
          'mb-2 text-xs font-normal text-black dark:text-amber-100',
          ptSans.className
        )}
      >
        <span className={cn('font-mono font-normal text-emerald-100')}>
          {prefix}
        </span>
        <span>{value}</span>
      </div>
      <div className='text-xs text-nowrap'>
        {percentageChange} % vs last period
      </div>
    </div>
  );
};

export default Trend;
