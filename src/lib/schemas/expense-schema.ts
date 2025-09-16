import z from 'zod';

export const expenseSchema = z.object({
  type: z.string().min(2, { message: 'must have type' }),
  amount: z.number().min(2, { message: 'must have type' }),
  description: z.string().min(2, { message: 'must have description' }),
  category: z.string().min(2, { message: 'must have category' }),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
