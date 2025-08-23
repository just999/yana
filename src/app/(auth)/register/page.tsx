import { auth } from '@/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import type { Session } from 'next-auth';

import RegisterForm from './register-form';

type RegisterPageProps = unknown;

const RegisterPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  const session = ((await auth()) as Session) || null;
  return (
    <div className='container flex h-screen w-full flex-col items-center justify-center px-4 md:px-6'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Create an account</h1>
          <p className='text-muted-foreground'>
            Join our supportive community today
          </p>
        </div>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>Sign up</CardTitle>
            <CardDescription>
              Choose your account type and provide your details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <RegisterForm session={session} />
          </CardContent>
        </Card>
        <div className='text-muted-foreground text-center text-xs'>
          By signing up, you acknowledge that this is a safe space for
          discussing sensitive topics.
          <br />
          Please be respectful of others experiences.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
