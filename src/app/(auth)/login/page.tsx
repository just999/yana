import {
  getRememberedEmail,
  getUserByAuthUserId,
} from '@/actions/auth-actions';
import { auth } from '@/auth';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';

import LoginForm from './login-form';

type LoginPageProps = unknown;

const LoginPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  const user = (await getUserByAuthUserId()).data as User;
  const rememberedEmail = await getRememberedEmail();

  if (session) {
    return redirect(callbackUrl || '/');
  }

  return (
    <div className='container flex h-screen flex-col items-center justify-center px-4 md:px-6'>
      <LoginForm user={user} />
    </div>
  );
};

export default LoginPage;
