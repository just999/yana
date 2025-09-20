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
    <div className='flex flex-col'>
      <div className='flex min-h-[200vh] flex-col overflow-y-auto'>
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
