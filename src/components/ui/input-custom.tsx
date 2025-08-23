'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ImEye, ImEyeBlocked } from 'react-icons/im';

import { Input } from './input';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
  errorMessage?: React.ReactNode;
  isDirty?: boolean;
  suffix?: React.ReactNode;
  variant?: 'default' | 'happy';
}

const InputCustom = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      suffix,
      type,
      isInvalid,
      isDirty,
      variant,
      errorMessage,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <div className='relative flex w-full items-center'>
          <Input
            variant={variant}
            type={type}
            className={cn(className)}
            ref={ref}
            {...props}
          />
          {suffix}
        </div>
        {isInvalid && errorMessage && (
          <span className='error-message text-shadow rounded-sm bg-fuchsia-100 px-4 text-xs text-red-700'>
            {errorMessage}
          </span>
        )}
      </>
    );
  }
);

InputCustom.displayName = 'InputCustom';

//!PASSWORD INPUT COMPONENT
const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className='relative'>
        <InputCustom
          variant={variant}
          type={show ? 'text' : 'password'}
          className={cn('pr-8', className)}
          {...props}
          ref={ref}
        />
        <div
          className='absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-zinc-400'
          onClick={() => setShow(!show)}
        >
          {show ? (
            <ImEye size={20} className='hover:text-stone-600/70' />
          ) : (
            <ImEyeBlocked size={20} className='hover:text-stone-600/70' />
          )}
        </div>
      </div>
    );
  }
);
InputPassword.displayName = 'InputPassword';

export { InputCustom, InputPassword };
