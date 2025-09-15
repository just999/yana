'use client';

import { useActionState, useEffect, useState } from 'react';

import { generateResetPassword } from '@/actions/auth-actions';
import SubmitButton from '@/components/submit-button';
import { Button, InputCustom, Label } from '@/components/ui';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [state, formAction, isPending] = useActionState(generateResetPassword, {
    error: false,
    message: '',
  });

  useEffect(() => {
    if (!state.error && hasSubmitted) {
      setHasSubmitted(true);
      toast.success(state.message);
    } else if (state.error) {
      setHasSubmitted(false);
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <InputCustom
          id='email'
          name='email'
          type='email'
          placeholder='your@email.com'
          required
        />
        {state.error && (
          <p className='text-destructive text-sm font-medium'>
            {state.message}
          </p>
        )}
      </div>
      {/* <Button type='submit' className='w-full' disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Reset Link'}
      </Button> */}
      <SubmitButton value='send email' submittingText='sending...' />
    </form>
  );
}
