import { getUserByAuthUserId } from '@/actions/auth-actions';
import MyAccountForm from '@/app/(auth)/my-account/my-account-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

type MyAccountPageProps = unknown;

const MyAccountPage = async () => {
  const user = (await getUserByAuthUserId()).data;

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className='container flex h-screen flex-col items-center justify-center px-4 md:px-6'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Update an account</h1>
          <p className='text-muted-foreground'>supportive community today</p>
        </div>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>Update Your Data</CardTitle>
            <CardDescription>
              Choose your account type and provide your details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <MyAccountForm user={user} />
          </CardContent>
        </Card>
        <div className='text-muted-foreground text-center text-xs'>
          By signing account, you acknowledge that this is a safe space for
          discussing sensitive topics.
          <br />
          Please be respectful of others experiences.
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
