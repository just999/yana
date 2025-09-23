'use client';

import { useFormatCurrency } from '@/hooks/use-format-currency';
import { categoriesByType, expenseCat } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { Transaction, TransType } from '@prisma/client';
import {
  EllipsisIcon,
  HandCoins,
  Landmark,
  PiggyBank,
  Wallet,
} from 'lucide-react';

import { Badge } from '../ui';
import ExpenseUpdateDropdown from './expense-update-dropdown';
import { bgColorClasses, colorClasses } from './trend';

interface TransactionItemProps extends Transaction {
  onRemoved?: () => void;
  i: number;
}

export const typeMap = {
  INCOME: {
    icon: HandCoins,
    colors: colorClasses['INCOME'],
    bg: bgColorClasses['INCOME'],
  },
  EXPENSE: {
    icon: Wallet,
    // colors: 'text-red-500 dark:text-red-400',
    colors: colorClasses['EXPENSE'],
    bg: bgColorClasses['EXPENSE'],
  },
  SAVING: {
    icon: Landmark,
    // colors: 'text-indigo-500 dark:text-indigo-400',
    colors: colorClasses['SAVING'],
    bg: bgColorClasses['SAVING'],
  },
  INVESTMENT: {
    icon: PiggyBank,
    // colors: 'text-amber-500 dark:text-amber-400',
    colors: colorClasses['INVESTMENT'],
    bg: bgColorClasses['INVESTMENT'],
  },
};

const TransactionItem = ({ onRemoved, i, ...tr }: TransactionItemProps) => {
  const IconComponent = typeMap[tr.type].icon;
  const colors = typeMap[tr.type].colors;
  const formattedAmount = useFormatCurrency(tr.amount || 0);
  const bgColors = typeMap[tr.type].bg;

  // Debug logging to understand the issue

  // Safe category retrieval with detailed error handling
  const categoryItem = expenseCat.find((t) => t.title === tr.category);

  const createCategoryLookupMap = () => {
    const lookupMap = new Map();

    Object.entries(categoriesByType).forEach(
      ([transactionType, categories]) => {
        categories.forEach((category) => {
          lookupMap.set(category.title, {
            ...category,
            transactionType,
          });
        });
      }
    );

    return lookupMap;
  };

  // Create the lookup map once
  const categoryLookup = createCategoryLookupMap();

  // Fast lookup function
  const getCategoryFromLookup = (categoryTitle: string) => {
    return categoryLookup.get(categoryTitle);
  };

  const categoryData = tr.category
    ? getCategoryFromLookup(tr.category)
    : undefined;
  const CategoryIcon = categoryData?.icon;

  const getBadgeVariant = (type: TransType) => {
    const variants = {
      INCOME:
        'bg-green-800/10 text-green-100 border-b-4 border-green-400/30 hover:bg-green-900/20',
      EXPENSE:
        'bg-red-800/10 text-red-100 border-b-4 border-red-400/30 hover:bg-red-900/20',
      SAVING:
        'bg-indigo-800/10 text-indigo-100 border-b-4 border-indigo-400/30 hover:bg-indigo-900/20',
      INVESTMENT:
        'bg-amber-800/10 text-amber-100 border-b-4 border-amber-400/30 hover:bg-amber-900/20',
    };
    return variants[type] || variants.EXPENSE;
  };

  return (
    <div className={cn('flex w-full items-center px-2 text-[10px]', bgColors)}>
      <div className='mr-4 flex grow items-center'>
        {i + 1}{' '}
        <IconComponent className={cn(colors, 'mr-2 hidden h-4 w-4 sm:block')} />
        <span>{tr.description}</span>
      </div>
      <div className='hidden min-w-[150px] items-center md:flex'>
        {tr.category && (
          <Badge
            variant='outline'
            className={cn(
              'text-[10px] font-light transition-colors',
              getBadgeVariant(tr.type)
            )}
          >
            {CategoryIcon && <CategoryIcon className='mr-1 inline h-3 w-3' />}
            {tr.category}
          </Badge>
        )}
      </div>
      <div className='min-w-[70px] text-center'>
        {formattedAmount.prefix} {formattedAmount.value}{' '}
      </div>
      <div className='flex min-w-[50px] justify-end'>
        {/* <EllipsisIcon className='size-4' />{' '} */}
        <ExpenseUpdateDropdown transaction={tr} onRemoved={onRemoved} />
      </div>
    </div>
  );
};

export default TransactionItem;
