import { getBlogsByAuthUser } from '@/actions/blog-actions';
import { auth } from '@/auth';
import PostForm from '@/components/blogs/post-form';
import { blogDefaultValue } from '@/lib/constants';
import HydrateBlog from '@/lib/jotai/hydrate-blog';
import { Metadata } from 'next';
import { Session } from 'next-auth';

export const metadata: Metadata = {
  title: 'create new blog',
};

type NewBlogPageProps = unknown;

const NewBlogPage = async () => {
  const blogs = (await getBlogsByAuthUser()).data;
  const session = (await auth()) as Session;
  return (
    <section className='min-w-2xl py-2 pb-24'>
      <div className='container'>
        <HydrateBlog
          imageUrl={[]}
          imgData={[]}
          blog={blogDefaultValue}
          type={'create'}
          slug={''}
          session={session}
        >
          <PostForm type='create' />
        </HydrateBlog>
      </div>
    </section>
  );
};

export default NewBlogPage;
