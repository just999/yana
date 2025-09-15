'use client';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { cn } from '@/lib/utils';
import {
  EllipsisIcon,
  HandCoins,
  Landmark,
  PiggyBank,
  Wallet,
} from 'lucide-react';

import { colorClasses } from './trend';

type TransactionItemProps = {
  type: 'Income' | 'Expense' | 'Investment' | 'Saving';
  category?: string;
  description: string;
  amount: number;
};

const TransactionItem = ({
  type,
  category,
  description,
  amount,
}: TransactionItemProps) => {
  const typeMap = {
    Income: {
      icon: HandCoins,
      colors: colorClasses['Income'],
    },
    Expense: {
      icon: Wallet,
      // colors: 'text-red-500 dark:text-red-400',
      colors: colorClasses['Expense'],
    },
    Saving: {
      icon: Landmark,
      // colors: 'text-indigo-500 dark:text-indigo-400',
      colors: colorClasses['Saving'],
    },
    Investment: {
      icon: PiggyBank,
      // colors: 'text-amber-500 dark:text-amber-400',
      colors: colorClasses['Investment'],
    },
  };

  const IconComponent = typeMap[type].icon;
  const colors = typeMap[type].colors;
  const formattedAmount = useFormatCurrency(amount);
  return (
    <div className='flex w-full items-center'>
      <div className='mr-4 flex grow items-center'>
        <IconComponent className={cn(colors, 'mr-2 hidden h-4 w-4 sm:block')} />
        <span>{description}</span>
      </div>
      <div className='hidden min-w-[150px] items-center md:flex'>
        {category && (
          <div className='rounded-md border-b-2 border-gray-300 bg-gray-700 px-2 text-xs font-light'>
            {category}
          </div>
        )}
      </div>
      <div className='min-w-[70px] text-right'>
        {formattedAmount.prefix} {formattedAmount.value}{' '}
      </div>
      <div className='flex min-w-[50px] justify-end'>
        <EllipsisIcon className='size-4' />{' '}
      </div>
    </div>
  );
};

export default TransactionItem;
