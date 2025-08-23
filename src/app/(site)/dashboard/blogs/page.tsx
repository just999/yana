import { getBlogsByUserId } from '@/actions/blog-actions';
import { auth } from '@/auth';
import BackButton from '@/components/back-button';
import Blogs from '@/components/blogs/blogs';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PostProps } from '@/lib/types';
import { Session } from 'next-auth';
import Link from 'next/link';

type BlogPageProps = unknown;

const BlogPage = async () => {
  const session = (await auth()) as Session;
  const blogs = await getBlogsByUserId(session.user.id);
  const transformedBlogs = blogs.data?.map((blog) => ({
    ...blog,
  }));

  if (!transformedBlogs) {
    return (
      <div className='w-xs'>
        <Card className='w-full text-center'>
          <CardHeader>
            <CardTitle className='text-center'>No Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <div>To Write New Blog</div>
            <Button size={'sm'} asChild variant={'ghost'}>
              <Link href={'/dashboard/blogs/new-blog'}>Create new blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className='container mx-auto px-4 py-12 md:px-6'>
      <div className='w-full'>
        <BackButton text='Back' />
        <div className='flex flex-col items-center pb-2'>
          <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl'>
            My Stories
          </h2>
          <p className='text-muted-foreground mt-2'>
            Read about experiences and insights from our community members
          </p>
        </div>
        <div className='xs:grid-cols-1 sm:justify-content grid justify-items-stretch gap-6 sm:justify-self-start md:grid-cols-2 lg:grid-cols-3'>
          {/* <PostTable blogs={blogs} /> */}
          <Blogs blogs={transformedBlogs || []} type='guest' />
        </div>
      </div>
    </section>
  );
};

export default BlogPage;
