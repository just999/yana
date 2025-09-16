import { getTransactionByUserId } from '@/actions/transaction-actions';

type TransactionListProps = unknown;

const TransactionList = async () => {
  const trans = await getTransactionByUserId();
  console.log('🚀 ~ TransactionList ~ trans:', trans.data);

  return <div>TransactionList</div>;
};

export default TransactionList;
