'use client';

import {
  Button,
  InputCustom,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { transactionCat, transactionType } from '@/lib/helpers';
import { expenseSchema } from '@/lib/schemas/expense-schema';

type ExpenseFormProps = unknown;

const ExpenseForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useZodForm({
    schema: expenseSchema,
    mode: 'onTouched',
    defaultValues: {
      type: '',
      amount: 0,
      category: '',
      description: '',
    },
  });
  return (
    <form className='space-y-4'>
      <div className='grid grid-cols-1 gap-2'>
        <div className='flex flex-col gap-1'>
          <Label className='mb-1'>Type</Label>
          <Select name='type'>
            <SelectTrigger>
              <SelectValue placeholder='type transaction' />
            </SelectTrigger>
            <SelectContent>
              {transactionType.map((tr, i) => (
                <SelectItem key={tr.title} value={tr.title}>
                  {tr.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='mb-1'>Category</Label>
          <Select name='category'>
            <SelectTrigger>
              <SelectValue placeholder='type transaction' />
            </SelectTrigger>
            <SelectContent>
              {transactionCat.map((cat, i) => (
                <SelectItem key={cat.title} value={cat.title}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className='mb-1'>Amount</Label>
          <InputCustom name='amount' id='amount' />
        </div>
        <div>
          <Label className='mb-1'>Description</Label>
          <InputCustom name='description' id='description' />
        </div>
      </div>
      <div className='flex justify-end'>
        <Button type='submit' variant={'ghost'}>
          Submit
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
