import { z } from 'zod';

import { tranCat, tranTypes } from '../constants';

const baseExpenseSchema = z.object({
  type: z.enum(tranTypes),
  category: z.preprocess(
    (val) =>
      val && typeof val === 'string' && val.length > 0 ? val : undefined,
    z.string().optional()
  ) as z.ZodType<string | undefined, z.ZodTypeDef, string>,
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'provide valid date',
  }),
  description: z.preprocess(
    (val) =>
      val && typeof val === 'string' && val.length > 0 ? val : undefined,
    z.string().optional()
  ) as z.ZodType<string | undefined, z.ZodTypeDef, string>,
});

export const expenseSchema = baseExpenseSchema
  .refine(
    (data) => {
      if (data.type === 'EXPENSE') {
        return data.category !== undefined && tranCat.includes(data.category);
      }
      return true;
    },
    {
      path: ['category'],
      message: 'Category is required for expense',
    }
  )
  .refine(
    (data) => {
      if (!data.description) {
        return data.description === undefined;
      }
      return true;
    },
    {
      path: ['description'],
      message: 'description is required',
    }
  );

export type ExpenseSchema = z.infer<typeof expenseSchema>;

export const updateExpenseSchema = baseExpenseSchema.extend({
  id: z.string(),
});

export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
