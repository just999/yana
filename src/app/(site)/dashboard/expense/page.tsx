import TransactionList from './transaction-list';

type ExpensePageProps = unknown;

const ExpensePage = () => {
  return (
    <div className='expense'>
      <TransactionList />
    </div>
  );
};

export default ExpensePage;
