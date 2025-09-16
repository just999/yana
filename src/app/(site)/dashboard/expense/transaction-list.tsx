import { getTransactionByUserId } from '@/actions/transaction-actions';
import TransactionItem from '@/components/expense/transaction-item';

type TransactionListProps = unknown;

const TransactionList = async () => {
  const trans = await getTransactionByUserId();

  return (
    <section className='space-y-4'>
      {trans.data?.map((tran) => (
        <div key={tran.id}>
          <TransactionItem
            type={tran.type}
            description={tran.description}
            amount={tran.amount || 0}
            category={tran.category || ''}
          />
        </div>
      ))}
    </section>
  );
};

export default TransactionList;
