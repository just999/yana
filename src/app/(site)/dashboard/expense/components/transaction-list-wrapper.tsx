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
  // // Server-side delay (no browser APIs)
  // await new Promise((resolve) => {
  //   // This runs on the server, so no setTimeout
  //   const start = Date.now();
  //   while (Date.now() - start < 2000) {
  //     // Block the event loop (only for testing!)
  //   }
  //   resolve(null);
  // });
  // if (process.env.NODE_ENV === 'development') {
  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  // }
  const trans = await getTransactionByRange(range, offset, limit);
  // console.log('🧪 trans:', JSON.stringify(trans.data?.length, null, 2));

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
