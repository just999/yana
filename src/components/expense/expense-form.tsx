'use client';

import { useMemo, useReducer } from 'react';

import { addNewTransaction, editTransaction } from '@/actions/expense-actions';
import {
  Button,
  Calendar,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputCustom,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { tranTypes, type TranCat, type TranTypes } from '@/lib/constants';
import { categoriesByType, expenseCat, transactionType } from '@/lib/helpers';
import {
  expenseSchema,
  type ExpenseSchema,
} from '@/lib/schemas/expense-schema';
import type { FormType } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { Transaction } from '@prisma/client';
import { format } from 'date-fns';
import { CalendarIcon, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

// Solution 1: Make type field optional in your schema and interfaces
// interface ExpenseSchema {
//   type?: TranTypes;
//   amount: number;
//   date: string;
//   category?: string;
//   description?: string;
// }

interface ExpenseFormInput {
  type: TranTypes | undefined;
  category: TranCat | undefined;
  amount: number; // string in form
  date: string;
  description: string | undefined;
}

// // Validated output type (after Zod transformation)
type ExpenseFormInputSchema = z.infer<typeof expenseSchema>;

// Define FormErrors type - should match your form fields
interface FormErrors {
  type?: string | undefined;
  amount?: number | null;
  date?: string | null;
  category?: string | undefined;
  description?: string | undefined;
}

// Define FormTouched type - tracks which fields have been interacted with
interface FormTouched {
  type?: boolean;
  amount?: boolean;
  date?: boolean;
  category?: boolean;
  description?: boolean;
}

// Define FormAction type for useReducer actions
type FormAction =
  | { type: 'SET_FIELD_VALUE'; field: keyof ExpenseSchema; value: any }
  | { type: 'SET_FIELD_ERROR'; field: keyof FormErrors; error: string | null }
  | { type: 'SET_FIELD_TOUCHED'; field: keyof FormTouched; touched: boolean }
  | { type: 'SET_IS_VALID'; isValid: boolean }
  | { type: 'SET_IS_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_IS_SUCCESS'; isSuccess: boolean }
  | { type: 'RESET_FORM' };

interface FormState {
  values: ExpenseFormInput;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
}

const initialFormState: FormState = {
  values: {
    type: undefined,
    amount: 0,
    date: '',
    category: undefined,
    description: undefined,
  },
  errors: {
    type: undefined,
    amount: null,
    date: null,
    category: undefined,
    description: undefined,
  },
  touched: {
    type: false,
    amount: false,
    date: false,
    category: false,
    description: false,
  },
  isValid: false,
  isSubmitting: false,
  isSuccess: false,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_IS_SUCCESS':
      return { ...state, isSuccess: action.isSuccess! };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };
    default:
      return state;
  }
};

type ExpenseProps = {
  formType: FormType;
  expenseId?: string;
  trans?: Transaction;
};

const ExpenseForm = ({ formType, expenseId, trans }: ExpenseProps) => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  const router = useRouter();
  // const formReducer = (state: FormState, action: FormAction): FormState => {
  //   switch (action.type) {
  //     case 'SET_FIELD_VALUE':
  //       return {
  //         ...state,
  //         values: {
  //           ...state.values,
  //           [action.field]: action.value,
  //         },
  //       };

  //     case 'SET_FIELD_ERROR':
  //       return {
  //         ...state,
  //         errors: {
  //           ...state.errors,
  //           [action.field]: action.error,
  //         },
  //       };

  //     case 'SET_FIELD_TOUCHED':
  //       return {
  //         ...state,
  //         touched: {
  //           ...state.touched,
  //           [action.field]: action.touched,
  //         },
  //       };

  //     case 'SET_IS_VALID':
  //       return {
  //         ...state,
  //         isValid: action.isValid,
  //       };

  //     case 'SET_IS_SUBMITTING':
  //       return {
  //         ...state,
  //         isSubmitting: action.isSubmitting,
  //       };

  //     case 'SET_IS_SUCCESS':
  //       return {
  //         ...state,
  //         isSuccess: action.isSuccess,
  //       };

  //     case 'RESET_FORM':
  //       return initialFormState;

  //     default:
  //       return state;
  //   }
  // };

  const formVal = useMemo(() => {
    const baseValues = {
      type: undefined as TranTypes | undefined,
      amount: 0,
      date: '',
      category: undefined as string | undefined,
      description: '',
    };

    if (formType === 'create') {
      return baseValues;
    }

    if (!trans) {
      return baseValues;
    }

    return {
      type: trans.type,
      amount: trans.amount ? Number(trans.amount) : 0,
      date: trans.date ? trans.date.toISOString().split('T')[0] : '',
      category: trans.category || undefined,
      description: trans.description || '',
    };
  }, [formType, trans]);

  const form = useZodForm({
    schema: expenseSchema,
    mode: 'onTouched',
    defaultValues: formVal,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: ExpenseFormInputSchema) => {
    try {
      let res;

      if (formType === 'create') {
        if (!data) {
          toast.error('Invalid form data');
          return;
        }
        res = await addNewTransaction(data);
      } else if (formType === 'update') {
        if (!expenseId) {
          toast.error('Missing expense ID for edit');
          return;
        }

        const updateData = {
          ...data,
          id: expenseId,
        };
        res = await editTransaction(updateData);
      }

      if (res?.errors) {
        toast.error(res?.message);
        dispatch({
          type: 'SET_FIELD_ERROR',
          field: 'description',
          error: res?.message,
        });
      } else {
        toast.success(res?.message);
        dispatch({ type: 'SET_IS_SUCCESS', isSuccess: true });
        reset(); // Reset form to defaultValues
        router.push('/dashboard/expense');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      dispatch({
        type: 'SET_FIELD_ERROR',
        field: 'description',
        error: 'Unexpected error',
      });
    }
  };

  const type = watch('type');

  return (
    <Form {...form}>
      <form
        className='mx-auto max-w-xl space-y-4 text-xs'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='grid grid-cols-1 gap-4'>
          <div className='flex flex-col gap-0'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-0 text-xs'>Type</FormLabel>
                  <Select
                    key={field.value || 'empty'}
                    onValueChange={(value) => {
                      field.onChange(value);

                      // onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                      //   if (e.target.value !== 'EXPENSE') {
                      //     setValue('category', undefined);
                      //   }
                      // };
                      if (value === 'EXPENSE') {
                        setValue('category', '');
                      }
                    }}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className='px-2 py-1 text-[10px] text-sky-100 data-[size=default]:h-6'>
                        <SelectValue
                          className='text-xs'
                          placeholder='type expense'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionType.map((tr, i) => (
                        <SelectItem
                          className='text-[10px] text-amber-100'
                          key={tr.title}
                          value={tr.title}
                        >
                          {tr.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='py-.5 w-fit bg-pink-700/5 px-2 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div>
          {/* <div className='flex flex-col gap-1'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-0 text-xs'>Category</FormLabel>
                  <Select
                    key={(field.value as string) || 'empty'}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value) setValue('category', value);
                    }}
                    value={type === 'EXPENSE' ? (field.value as string) : ''}
                    disabled={type !== 'EXPENSE'}
                  >
                    <FormControl>
                      <SelectTrigger className='px-2 py-1 text-[10px] text-sky-100 data-[size=default]:h-6'>
                        <SelectValue placeholder='category expense' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCat.map((cat, i) => (
                        <SelectItem
                          key={cat.title}
                          value={cat.title}
                          className='text-[12px]'
                        >
                          <cat.icon /> {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='w-fit rounded-md bg-pink-700/15 px-2 py-0.5 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div> */}

          <div className='flex flex-col gap-1'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-0 text-xs'>Category</FormLabel>
                  <Select
                    key={`${type}-${(field.value as string) || 'empty'}`}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value) setValue('category', value);
                    }}
                    value={(field.value as string) || ''}
                    disabled={!type}
                  >
                    <FormControl>
                      <SelectTrigger className='px-2 py-1 text-[10px] text-sky-100 data-[size=default]:h-6'>
                        <SelectValue
                          placeholder={`Select type ${type?.toLowerCase()} `}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {type &&
                        categoriesByType[
                          type as keyof typeof categoriesByType
                        ]?.map((cat) => (
                          <SelectItem
                            key={cat.title}
                            value={cat.title}
                            className='text-[12px]'
                          >
                            <div className='flex items-center gap-2'>
                              <cat.icon className='h-4 w-4' />
                              {cat.title}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='w-fit rounded-md bg-pink-700/15 px-2 py-0.5 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='mb-1 text-xs'>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                        {/* <InputCustom
                          {...field}
                          className='text-[10px] file:text-xs file:font-light'
                        /> */}
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode='single'
                        selected={
                          field.value
                            ? typeof field.value === 'string'
                              ? new Date(field.value)
                              : field.value
                            : undefined
                        }
                        onSelect={(value) => {
                          console.log(
                            'LOG: ~ value.toISOString():',
                            value?.toISOString()
                          );
                          field.onChange(value);
                          if (value) setValue('date', value.toISOString());
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        captionLayout='dropdown'
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className='py-.5 w-fit bg-pink-700/5 px-2 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1 text-xs'>Amount</FormLabel>
                  <FormControl>
                    <InputCustom
                      {...field}
                      className='text-[10px] file:text-xs file:font-light'
                    />
                  </FormControl>
                  <FormMessage className='py-.5 w-fit bg-pink-700/5 px-2 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1 text-xs'>Description</FormLabel>
                  <FormControl>
                    <InputCustom
                      {...field}
                      className='text-[10px] file:text-xs file:font-light'
                    />
                  </FormControl>
                  <FormMessage className='py-.5 w-fit bg-pink-700/5 px-2 text-[10px] font-normal' />
                </FormItem>
              )}
            />
          </div>
          {/* <div>
            <Label className='mb-1'>Description</Label>
            <InputCustom id='description' {...register('description')} />
          </div> */}
        </div>
        <div className='flex justify-end'>
          <Button
            type='button'
            variant={'ghost'}
            onClick={() => reset()}
            className='px-6'
            size={'sm'}
          >
            Reset
          </Button>
          <Button type='submit' variant={'ghost'} className='px-6' size={'sm'}>
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Loader size={12} className='animate-spin' /> save...
              </span>
            ) : (
              ' Submit'
            )}
          </Button>
        </div>
      </form>{' '}
    </Form>
  );
};

export default ExpenseForm;
