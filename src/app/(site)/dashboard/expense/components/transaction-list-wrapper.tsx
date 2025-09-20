import { getTransactionByRange } from '@/actions/expense-actions';

import type { RangeTime } from './range';
import TransactionList from './transaction-list';

type TransactionListWrapperProps = {
  range: RangeTime;
  offset: number;
  limit: number;
};

const TransactionListWrapper = async ({
  range,
  offset,
  limit,
}: TransactionListWrapperProps) => {
  const trans = await getTransactionByRange(range, offset, limit);
  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-hidden'>
        <TransactionList
          initTrans={trans.data || []}
          key={range}
          range={range}
        />
      </div>
    </div>
  );
};

export default TransactionListWrapper;
