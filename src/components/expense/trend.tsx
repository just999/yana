'use client';

import { cn } from '@/lib/utils';

type TrendProps = {
  type: 'Income' | 'Expense' | 'Investment' | 'Saving';
  amount?: number;
  prevAmount?: number;
};

// const Trend = ({ type, amount, prevAmount }: TrendProps) => {
//   const colorClasses = {
//     Income: 'text-green-700 dark:text-green-300',
//     Expense: 'text-red-700 dark:text-red-300',
//     Investment: 'text-indigo-700 dark:text-indigo-300',
//     Saving: 'text-amber-700 dark:text-amber-300',
//   };

//   const calcPercentageChange = (amount: number, prevAmount: number) => {
//     if (prevAmount === 0) return 0;

//     return ((amount - prevAmount) / prevAmount) * 100;
//   };

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,

//     }).format(amount);

//     const formatted = formatCurrency(amount)

//     const [prefix, value] = formatCurrency.split(/(?=\d)/)

//   return (
//     <div>
//       <div className={cn('font-semibold', colorClasses[type])}>{type}</div>
//       <div className='mb-2 text-2xl font-semibold text-black dark:text-amber-100'>
//         {amount ? formatCurrency(amount) : formatCurrency(0)}
//       </div>
//     </div>
//   );
// };

const Trend = ({ type, amount, prevAmount }: TrendProps) => {
  const colorClasses = {
    Income: 'text-green-700 dark:text-green-300',
    Expense: 'text-red-700 dark:text-red-300',
    Investment: 'text-indigo-700 dark:text-indigo-300',
    Saving: 'text-amber-700 dark:text-amber-300',
  };

  const calcPercentageChange = (amount: number, prevAmount: number) => {
    if (prevAmount === 0) return 0;

    return ((amount - prevAmount) / prevAmount) * 100;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatted = formatCurrency(amount || 0);

  // Split at the first digit to separate prefix (Rp) from value
  const [prefix, value] = formatted.split(/(?=\d)/);

  return (
    <div>
      <div className={cn('font-semibold', colorClasses[type])}>{type}</div>
      <div className='mb-2 text-2xl font-semibold text-black dark:text-amber-100'>
        <span className='font-bold'>{prefix}</span>
        <span>{value}</span>
      </div>
    </div>
  );
};

export default Trend;
