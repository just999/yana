import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/lib/constants';
import { ballet, cn } from '@/lib/utils';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <span className='flex'>
        <SITE_CONFIG.logo className='svg h-auto w-8 fill-orange-500 dark:fill-orange-400' />
        <span
          className={cn(
            'ml-2 hidden text-xl font-bold lg:block',
            ballet.className
          )}
        >
          {SITE_CONFIG.name}
        </span>
      </span>
      <div className='w-1/3 rounded-lg p-6 text-center shadow-md'>
        <h1 className='mb-4 text-3xl font-bold'>Not Found</h1>
        <p className='text-destructive bg-muted/50 rounded-sm'>
          Could not find requested page
        </p>
        <Button variant='outline' className='mt-4 ml-2' asChild>
          <Link href='/'>Back To Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
