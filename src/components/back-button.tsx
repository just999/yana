'use client';

import { cn } from '@/lib/utils';
import { ArrowLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from './ui';

type BackButtonProps = {
  text: string;
  link?: string;
  size?: number;
  className?: string;
};

const BackButton = ({ text, link, size, className }: BackButtonProps) => {
  const router = useRouter();
  return (
    <div className='group'>
      <Button
        variant={'ghost'}
        onClick={() => router.back()}
        className={cn(
          'group mb-5 flex items-center gap-2 font-bold text-gray-500 hover:underline',
          className
        )}
      >
        <ArrowLeftCircle size={size} className='group-hover:underline' />
        <span className='group-hover:underline'>{text}</span>
      </Button>
    </div>
  );
};

export default BackButton;
