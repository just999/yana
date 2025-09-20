import { getTransactionById } from '@/actions/expense-actions';
import ExpenseForm from '@/components/expense/expense-form';

type ExpenseEditPageProps = {
  params: Promise<{ id: string }>;
};

const ExpenseEditPage = async ({ params }: ExpenseEditPageProps) => {
  const id = (await params).id;
  const trans = (await getTransactionById(id)).data;
  return <ExpenseForm formType='update' expenseId={id} trans={trans} />;
};

export default ExpenseEditPage;
