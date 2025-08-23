import ProfileForm from '@/app/(auth)/profile-complete/profile-form';
import RegisterForm from '@/app/(auth)/register/register-form';
import { auth } from '@/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Session } from 'next-auth';

type ProfileCompletePageProps = unknown;

const ProfileCompletePage = async () => {
  return (
    <div className='container flex h-screen w-full flex-col items-center justify-center px-4 md:px-6'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Complete your profile</h1>
          <p className='text-muted-foreground'>
            Join our supportive community today
          </p>
        </div>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>Profile</CardTitle>
            <CardDescription>
              Choose your account type and provide your details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <ProfileForm />
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

export default ProfileCompletePage;
