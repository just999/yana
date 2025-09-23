'use client';

import type { ChangeEvent } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

export const rangeTime = ['today', 'w', 'm', 'y'] as const;
export type RangeTime = (typeof rangeTime)[number];

export const rangeSchema = z.object({
  range: z.enum(rangeTime).optional(),
});

export type RangeSchema = z.infer<typeof rangeSchema>;

type RangeProps = {
  defaultRange: RangeTime;
};

const Range = ({ defaultRange }: RangeProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const rangeParams = searchParams.get('range') ?? defaultRange ?? 'today';

  let range: RangeTime = 'today';

  if (rangeParams) {
    if (rangeTime.includes(rangeParams as RangeTime)) {
      range = rangeParams as RangeTime;
    } else {
      console.warn('invalid range');
    }
  }

  const form = useZodForm({
    schema: rangeSchema,
    mode: 'onTouched',
    defaultValues: {
      range: range,
    },
  });
  const rangeVal = form.watch('range');

  const onSubmit = async (data: RangeSchema) => {};
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='mx-auto w-full'>
          <FormField
            control={form.control}
            name='range'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col items-center justify-center'>
                <FormLabel className='mb-0 text-xs'>Range</FormLabel>
                <Select
                  key={(field.value as string) || 'empty'}
                  onValueChange={(value) => {
                    field.onChange(value);

                    const params = new URLSearchParams(searchParams);

                    params.set('range', value);
                    replace(`${pathname}?${params.toString()}`);

                    if (value) form.setValue('range', value as RangeTime);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='px-2 py-1 text-[10px] text-sky-100 data-[size=default]:h-6'>
                      <SelectValue placeholder='category transaction' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rangeTime.map((t, i) => (
                      <SelectItem key={t} value={t} className='text-[10px]'>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='w-fit rounded-md bg-pink-700/15 px-2 py-0.5 text-[10px] font-normal' />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default Range;
