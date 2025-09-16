import ExpenseForm from '@/components/expense/expense-form';
import type { Metadata } from 'next';

type AddExpensePageProps = unknown;

export const metadata: Metadata = {
  title: 'add transaction',
  description: 'add transaction',
};

const AddExpensePage = () => {
  return (
    <div className='mb-8 text-4xl font-semibold'>
      <ExpenseForm />
    </div>
  );
};

export default AddExpensePage;
