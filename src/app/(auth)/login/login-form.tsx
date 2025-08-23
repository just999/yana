'use client';

import { useActionState, useEffect, useState } from 'react';

import { signInWithCredentials } from '@/actions/auth-actions';
import SocialLoginButton from '@/components/shared/social-login-button';
import SubmitButton from '@/components/submit-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  InputCustom,
  InputPassword,
  Label,
} from '@/components/ui';
import { loginDefaultValues, registerDefaultValues } from '@/lib/constants';
import { userAtom } from '@/lib/jotai/user-atoms';
import { User } from '@prisma/client';
import { useAtom } from 'jotai';
import { Key, Mail } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

type LoginFormProps = {
  user: User;
};

const LoginForm = ({ user }: LoginFormProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    'google' | 'github' | null
  >(null);
  const [data, action] = useActionState(signInWithCredentials, {
    error: false,
    message: '',
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [curUser, setCurUser] = useAtom(userAtom);
  const { data: session, update, status } = useSession();
  useEffect(() => {
    if (!data.error && data.message) {
      setHasSubmitted(true);
      router.refresh();
      router.push(callbackUrl);
    }
    if (data.error) {
      setHasSubmitted(false);
      toast.error(data.message);
    }

    // if (data.twoFactor) {
    //   setShowTwoFactor(true);
    // }
  }, [data.message, data.error, router, callbackUrl]);

  useEffect(() => {
    // Ensure data.data is an object (not a string) before accessing properties
    if (user) {
      setCurUser({
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? user.avatar ?? undefined,
        anonymous: user.anonymous ?? user.anonymous,
        // isTwoFactorEnabled:
        //   user.isTwoFactorEnabled ?? user.isTwoFactorEnabled ?? false,
        school: user.school ?? user.school ?? undefined,
        role: user.role ?? user.role ?? undefined,
        major: user.major ?? user.major ?? undefined,
        phone: user.phone ?? user.phone ?? undefined,
        address: user.address ?? user.address ?? undefined,
        city: user.city ?? user.city ?? undefined,
      });

      update({
        ...session,
        user: {
          ...session?.user,
          user: data.data,
        },
      });
    }
  }, [data.data, session, setCurUser, update, user]);

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    try {
      const user = signIn(provider, {
        callbackUrl: '/',
        redirect: true,
      });
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setSocialLoading(null);
    }
  };

  return (
    <form action={action} className='w-full max-w-md space-y-4'>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Welcome back</h1>
        <p className='text-muted-foreground'>
          Enter your credentials to sign in to your account
        </p>
      </div>

      <Card className='shadow-lg'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {showTwoFactor && (
            <>
              <input
                type='hidden'
                name='email'
                value={loginDefaultValues.email}
              />
              <input
                type='hidden'
                name='password'
                value={loginDefaultValues.password}
              />
              <input type='hidden' name='twoFactorSubmission' value='true' />
              <div className='space-y-2'>
                <Label htmlFor='email'>Two Factor Code</Label>
                <InputCustom
                  defaultValue={loginDefaultValues.code}
                  id='code'
                  name='code'
                  placeholder='12345'
                  type='text'
                  autoComplete='code'
                  className='placeholder:text-stone-500'
                  suffix={
                    <Key size={20} className='absolute right-2 text-zinc-600' />
                  }
                  required
                />
              </div>
            </>
          )}
          {!showTwoFactor && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <InputCustom
                  defaultValue={loginDefaultValues.email}
                  id='email'
                  name='email'
                  placeholder='m@example.com'
                  type='email'
                  autoComplete='email'
                  suffix={
                    <Mail
                      size={20}
                      className='absolute right-2 text-zinc-400'
                    />
                  }
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <InputPassword
                  defaultValue={loginDefaultValues.password}
                  id='password'
                  name='password'
                  required
                  autoComplete='current-password'
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='remember'
                    name='remember'
                    defaultChecked={loginDefaultValues.remember}
                  />
                  <label
                    htmlFor='remember'
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Remember me
                  </label>
                </div>
                <div>
                  <Link
                    href='/forgot-password'
                    className='text-primary text-sm font-medium underline-offset-4 hover:underline'
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className='flex flex-col'>
          <div className='flex w-full flex-col'>
            {/* <LoginButton /> */}
            <SubmitButton
              text={showTwoFactor ? 'Verify Code' : 'Sign In'}
              submittingText={showTwoFactor ? 'Verifying...' : 'Signing in...'}
            />
            <span className='text-center text-xs text-stone-500 italic'>
              or
            </span>
            <SocialLoginButton
              className='flex w-1/2 justify-center gap-2 pt-2 text-xs'
              buttonClassName='h-8'
              bgClass='text-[10px] text-accent-foreground/30'
              onClick={handleSocialLogin}
              loadingProvider={socialLoading}
              providers={['google', 'github']}
            />
            <p className='text-muted-foreground mt-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link
                href='/sign-up'
                className='text-primary font-medium underline-offset-4 hover:underline'
              >
                Sign up
              </Link>
            </p>
          </div>
          {/* Display error message if exists */}
          {!hasSubmitted && data?.error && (
            <div className='bg-destructive/15 text-destructive rounded-md p-3 text-sm'>
              {data.message || 'Invalid credentials. Please try again.'}
            </div>
          )}
        </CardFooter>
      </Card>

      <div className='text-muted-foreground text-center text-xs'>
        By continuing, you agree to our{' '}
        <Link
          href='/terms'
          className='hover:text-primary underline underline-offset-4'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='/privacy'
          className='hover:text-primary underline underline-offset-4'
        >
          Privacy Policy
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
