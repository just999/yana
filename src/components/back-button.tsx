import { cn } from '@/lib/utils';
import { ArrowLeftCircle } from 'lucide-react';
import Link from 'next/link';

// import { useRouter } from 'next/navigation';

import { Button } from './ui';

type BackButtonProps = {
  value: string;
  link?: string;
  iconSize?: number;
  className?: string;
} & React.ComponentProps<typeof Button>;

const BackButton = ({
  value,
  link,
  iconSize,
  className,
  ...props
}: BackButtonProps) => {
  return (
    <div className='group w-fit px-2'>
      <Button
        variant={'ghost'}
        asChild
        className={cn(
          'group mb-5 flex items-center gap-2 font-bold text-gray-500 hover:underline',
          className
        )}
        {...props}
      >
        <Link href={link || '/'}>
          <ArrowLeftCircle size={iconSize} className='group-hover:underline' />
          <span className='group-hover:underline'>{value}</span>
        </Link>
      </Button>
    </div>
  );
};

export default BackButton;
