import { verifyEmail } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

type VerifyEmailPageProps = {
  searchParams: Promise<{ token: string }>;
};

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  let content: React.ReactNode;
  let title = 'Verifying your email';
  let description = 'Please wait while we verify your email address...';

  const { token } = await searchParams;

  try {
    const result = await verifyEmail(token);

    if (!result.error) {
      title = 'Email Verified!';
      description = 'Your email has been successfully verified.';
      content = (
        <div className='flex flex-col items-center gap-4'>
          <CheckCircle2 className='h-16 w-16 text-green-500' />
          <p className='text-muted-foreground text-center'>
            You can now access all features of our platform.
          </p>
        </div>
      );
    } else {
      title = 'Verification Failed';
      description =
        result.message || 'There was an issue verifying your email.';
      content = (
        <div className='flex flex-col items-center gap-4'>
          <XCircle className='text-destructive h-16 w-16' />
          <p className='text-muted-foreground text-center'>
            {result.message ||
              'The verification link may be invalid or expired.'}
          </p>
        </div>
      );
    }
  } catch (error) {
    title = 'Verification Error';
    description = 'An unexpected error occurred.';
    content = (
      <div className='flex flex-col items-center gap-4'>
        <XCircle className='text-destructive h-16 w-16' />
        <p className='text-muted-foreground text-center'>
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className='container flex min-h-[calc(100vh-140px)] items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className='grid gap-4'>
          {content || (
            <div className='flex flex-col items-center justify-center py-8'>
              <Loader2 className='text-primary h-12 w-12 animate-spin' />
            </div>
          )}
        </CardContent>

        <CardFooter className='flex flex-col gap-2'>
          {!token ? (
            <p className='text-destructive text-center text-sm'>
              No verification token provided.
            </p>
          ) : null}

          <Button asChild className='w-full' variant='outline'>
            <Link href='/'>Return to Home</Link>
          </Button>

          {title.includes('Failed') || title.includes('Error') ? (
            <Button asChild className='w-full'>
              <Link href='/auth/resend-verification'>
                Resend Verification Email
              </Link>
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
