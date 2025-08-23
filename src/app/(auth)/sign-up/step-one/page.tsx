import StepOneForm from '@/app/(auth)/sign-up/step-one/step-one-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

type StepOnePageProps = unknown;

const StepOnePage = () => {
  return (
    <div className='container flex w-full flex-col items-center justify-center px-1 md:px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Create an account</h1>
          <p className='text-muted-foreground'>
            Join our supportive community today
          </p>
        </div>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>User Info</CardTitle>
            <CardDescription>
              Choose your account type and provide your details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <StepOneForm />
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

export default StepOnePage;
