'use client';

import type { ChangeEvent } from 'react';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { cn } from '@/lib/utils'; // Assuming you have this utility

import { Calendar } from 'lucide-react';
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

// Helper function to get display label for range values
const getRangeLabel = (range: RangeTime): string => {
  const labels: Record<RangeTime, string> = {
    today: 'Today',
    w: 'W',
    m: 'M',
    y: 'Y',
  };
  return labels[range];
};

export const RangeButton = ({ defaultRange }: RangeProps) => {
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

  const handleRangeChange = (newRange: RangeTime) => {
    // Update form
    form.setValue('range', newRange);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', newRange);
    replace(`${pathname}?${params.toString()}`);

    console.log('Range switched to:', newRange);
  };

  return (
    <Form {...form}>
      <div className='mx-auto flex w-full justify-end'>
        <FormField
          control={form.control}
          name='range'
          render={({ field }) => (
            <FormItem className='flex flex-col items-center justify-end'>
              {/* <FormLabel className='mb-0 flex w-full justify-center text-xs text-sky-100'>
                Range
              </FormLabel> */}

              {/* Switch/Toggle Button Group */}
              <FormControl>
                <div className='flex gap-1 rounded-lg bg-blue-800/50 p-1'>
                  <span>
                    <Calendar size={16} />
                  </span>
                  {rangeTime.map((timeOption) => (
                    <Button
                      key={timeOption}
                      type='button'
                      variant={'ghost'}
                      onClick={() => handleRangeChange(timeOption)}
                      size={'sm'}
                      className={cn(
                        'h-4 rounded-md px-2 py-1 text-[10px] font-medium transition-all duration-200',
                        'hover:bg-sky-600/20 focus:ring-2 focus:ring-sky-400/50 focus:outline-none',
                        field.value === timeOption
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-sky-200 hover:text-sky-100'
                      )}
                    >
                      {getRangeLabel(timeOption)}
                    </Button>
                  ))}
                </div>
              </FormControl>

              <FormMessage className='w-fit rounded-md bg-pink-700/15 px-2 py-0.5 text-[10px] font-normal' />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};
