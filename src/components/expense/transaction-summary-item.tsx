'use client';

import { useFormatCurrency } from '@/hooks/use-format-currency';

type TransactionSummaryItemProps = {
  date: string;
  amount: number;
};

const TransactionSummaryItem = ({
  date,
  amount,
}: TransactionSummaryItemProps) => {
  const formattedAmount = useFormatCurrency(amount);
  return (
    <div className='flex pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400'>
      <div className='grow'>{date}</div>
      <div className='min-w-[70px] rounded-xl bg-amber-800/20 text-center font-semibold'>
        {formattedAmount.prefix} {formattedAmount.value}
      </div>
      <div className='min-w-[50px]'></div>
    </div>
  );
};

export default TransactionSummaryItem;
