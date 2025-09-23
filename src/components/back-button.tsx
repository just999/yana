import { cn } from '@/lib/utils';
import { ArrowLeftCircle } from 'lucide-react';
import Link from 'next/link';

// import { useRouter } from 'next/navigation';

import { Button } from './ui';

type BackButtonProps = {
  value: string;
  link?: string;
  size?: number;
  className?: string;
};

const BackButton = ({ value, link, size, className }: BackButtonProps) => {
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // const handleClick = () => {
  //   if (!mounted) return;
  //   if (link) {
  //     router.push(link);
  //   } else {
  //     router.back();
  //   }
  // };

  // Don't render until mounted on client
  // if (!mounted) {
  //   return (
  //     <div className='group'>
  //       <Button
  //         variant={'ghost'}
  //         className={cn(
  //           'group mb-5 flex items-center gap-2 font-bold text-gray-500',
  //           className
  //         )}
  //         disabled
  //       >
  //         <ArrowLeftCircle size={size} />
  //         <span>{text}</span>
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <div className='group'>
      <Button
        variant={'ghost'}
        asChild
        className={cn(
          'group mb-5 flex items-center gap-2 font-bold text-gray-500 hover:underline',
          className
        )}
      >
        <Link href={link || '/'}>
          <ArrowLeftCircle size={size} className='group-hover:underline' />
          <span className='group-hover:underline'>{value}</span>
        </Link>
      </Button>
    </div>
  );
};

export default BackButton;
