import { APP_NAME } from '@/lib/constants';
import { ballet, cn } from '@/lib/utils';
import { Ballet } from 'next/font/google';

type FooterProps = {
  className?: string;
};

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-muted z-10 border-t', className)}>
      <div className='flex-center p-5'>
        {currentYear} <span className={cn(ballet.className)}>{APP_NAME}</span>.
        All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
