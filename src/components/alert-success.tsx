'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

import { Alert } from './ui';

type AlertStatusProps = {
  children: React.ReactNode;
  type: 'SUCCESS' | 'ERROR';
};

const AlertStatus = ({ type, children }: AlertStatusProps) => {
  const Icon = type === 'SUCCESS' ? Check : X;

  return (
    <Alert
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        type === 'SUCCESS'
          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
      )}
    >
      <Icon className='mt-0.5 h-5 w-5 flex-shrink-0' />
      <div className='flex-1'>
        <h4 className='mb-1 text-sm font-medium'>{type}</h4>
        <div className='text-sm'>{children}</div>
      </div>
    </Alert>
  );
};

export default AlertStatus;
