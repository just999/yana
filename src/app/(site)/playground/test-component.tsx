// In your component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { useSession } from 'next-auth/react';

export default function TestComponent() {
  const { data: session, status } = useSession();

  console.log('Session status:', status);
  console.log('Session data:', session);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Not logged in</p>;

  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
      <p>ID: {session?.user?.id}</p>
      <p>Role: {session?.user?.role}</p>
      <p>Profile Complete: {session?.user?.profileComplete ? 'Yes' : 'No'}</p>
      <Avatar>
        <AvatarImage src={session?.user.image || '/avatar/user.svg'} />
        <AvatarFallback>{session?.user.avatar}</AvatarFallback>
      </Avatar>
    </div>
  );
}
