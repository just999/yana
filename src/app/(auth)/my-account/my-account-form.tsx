'use client';

import { useActionState, useEffect, useState } from 'react';

import { updateUser } from '@/actions/auth-actions';
import BackButton from '@/components/back-button';
import SubmitButton from '@/components/submit-button';
import { Button, Checkbox, InputCustom, Label } from '@/components/ui';
import { User } from '@prisma/client';
import { Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

type MyAccountFormProps = {
  user: User;
};

const MyAccountForm = ({ user }: MyAccountFormProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data: session, update } = useSession();
  const router = useRouter();
  const [data, action] = useActionState(updateUser, {
    error: false,
    message: '',
  });

  useEffect(() => {
    if (data.message && !data.error) {
      setHasSubmitted(true);

      update({
        ...session,
        user: {
          ...session?.user,
          name: data.data?.name || session?.user.name,
          anonymous: data.data?.anonymous || session?.user.anonymous,
        },
      }).then(() => {
        router.refresh();
        router.push('/');
      });
    }
  }, [
    data.message,
    data.error,
    router,
    session,
    update,
    data.data?.name,
    data.data?.anonymous,
  ]);

  const UpdateButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        disabled={pending}
        className='w-full'
        variant='outline'
        type='submit'
      >
        {pending ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Updating...
          </>
        ) : (
          'Update'
        )}
      </Button>
    );
  };

  return (
    <form action={action} className='space-y-4'>
      <BackButton value='back' />
      <div className='grid w-[398px] grid-cols-2 gap-4'>
        <div className='w-[398px] space-y-2'>
          <Label htmlFor='name'>name</Label>
          <InputCustom
            className='w-full'
            defaultValue={user.name}
            id='name'
            name='name'
            placeholder='nama'
            // required
          />
        </div>
      </div>{' '}
      <div className='space-y-2'>
        <Label className='text-base'>Account Privacy</Label>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='anonymous'
            name='anonymous'
            defaultChecked={user.anonymous}
          />
          <label
            htmlFor='anonymous'
            className='text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Enable anonymous posting (your profile will remain hidden)
          </label>
        </div>
      </div>
      <div className='flex flex-col'>
        <SubmitButton value='Update' submittingText='Updating...' />
      </div>
    </form>
  );
};

export default MyAccountForm;
