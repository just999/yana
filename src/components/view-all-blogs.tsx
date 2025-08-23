'use client';

import { Button } from '@/components/ui';
import Link from 'next/link';

type ViewAllBlogsProps = unknown;

const ViewAllBlogs = () => {
  return (
    <div className='my-8 flex items-center justify-center pb-16'>
      <Button
        asChild
        // variant={'default'}
        size={'sm'}
        type='button'
        className='px-8 py-4 text-lg font-semibold'
      >
        <Link href={'/search'}>View All Blogs</Link>
      </Button>
    </div>
  );
};

export default ViewAllBlogs;
