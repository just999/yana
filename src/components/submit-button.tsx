'use client';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type SubmitButtonProps = {
  submittingText?: string;
  text: string;
  className?: string;
  disabled?: boolean;
};

const SubmitButton = ({
  text,
  className,
  disabled,
  submittingText,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  // const pending = true;
  return (
    <Button
      disabled={pending || disabled}
      variant='outline'
      size={'sm'}
      type='submit'
      className={cn(className)}
    >
      {pending ? (
        <>
          <Loader className='mr-2 h-4 w-4 animate-spin' />
          {submittingText ? submittingText : 'Submitting...'}
        </>
      ) : (
        text
      )}
    </Button>
  );
};

export default SubmitButton;
