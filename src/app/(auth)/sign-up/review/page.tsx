import ReviewForm from '@/app/(auth)/sign-up/review/review-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

type ReviewPageProps = unknown;

const ReviewPage = () => {
  return (
    <div className='container flex w-full flex-col items-center justify-center px-1 md:px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-0 text-center'>
          <h1 className='text-3xl font-bold'>User Data</h1>
          <p className='text-muted-foreground'>
            Join our supportive community today
          </p>
        </div>
        <Card className='gap-2'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl underline decoration-stone-500 decoration-double decoration-1 underline-offset-3'>
              Review Your Data
            </CardTitle>
            <CardDescription>
              Choose your account type and provide your details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <ReviewForm />
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

export default ReviewPage;
