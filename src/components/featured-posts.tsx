import Blogs from '@/components/blogs/blogs';
import ViewAllBlogs from '@/components/view-all-blogs';
import { PostProps } from '@/lib/types';
import Link from 'next/link';

type FeaturedPostsProps = {
  featuredBlogs?: PostProps[];
};

export function FeaturedPosts({ featuredBlogs }: FeaturedPostsProps) {
  return (
    <section className='container px-4 py-12 md:px-6'>
      <div className='mb-8 flex flex-col items-start justify-between md:flex-row md:items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl'>
            Featured Stories
          </h2>
          <p className='text-muted-foreground mt-2'>
            Read about experiences and insights from our community members
          </p>
        </div>
        <Link
          href='/blogs'
          className='text-primary mt-4 font-medium hover:underline md:mt-0'
        >
          View all posts →
        </Link>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <Blogs blogs={featuredBlogs || []} type='guest' />

        {/* ))} */}
      </div>
      <ViewAllBlogs />
    </section>
  );
}
