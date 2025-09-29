import ExpenseForm from '@/components/expense/expense-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'add transaction',
  description: 'add transaction',
};

const AddExpensePage = () => {
  return (
    <div className='bg-accent/50 mx-auto mb-8 max-w-md rounded-2xl p-1 text-4xl font-semibold lg:px-2 lg:py-4'>
      <ExpenseForm formType='create' />
    </div>
  );
};

export default AddExpensePage;
