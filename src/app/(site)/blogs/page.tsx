import { getAllBlogs, getAllBlogsData } from '@/actions/blog-actions';
import { auth } from '@/auth';
import BackButton from '@/components/back-button';
import Blogs from '@/components/blogs/blogs';
import BlogsPagination from '@/components/blogs/blogs-pagination';
import PostTable from '@/components/blogs/post-table';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui';
import { PAGE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type BlogsPageProps = {
  searchParams: Promise<{
    q?: string;
    slug?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

const BlogsPage = async ({ searchParams }: BlogsPageProps) => {
  const resolvedParams = await searchParams;

  const {
    q = '',
    slug = '',
    category = 'all',
    sort = 'newest',
    page = '1',
  } = resolvedParams;
  // const { page } = await searchParams;
  const rawBlogs = await getAllBlogs({
    query: q || 'all', // Don't pass empty string, pass
    slug: slug || 'all', // Don't pass empty string, pass undefined
    category: category === 'all' ? undefined : category,
    sort,
    page: Number(page) || 1,
  });

  const transformedBlogs =
    rawBlogs.data &&
    rawBlogs.data.map((blog) => ({
      ...blog,
    }));

  const session = await auth();

  if (rawBlogs.data?.length === 0) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center gap-2 py-96 text-white'>
        <h3 className='text-3xl'>no blog found, please create a blog </h3>
        <Button
          size={'sm'}
          variant='ghost'
          type='button'
          className='bg-orange-700'
        >
          <Link href={'/dashboard/blogs/new-blog'}>create new blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='py-16'>
      <section className='container mx-auto px-2 py-4 lg:px-4'>
        <div className='w-full'>
          <BackButton text='Go Back' link='/' size={18} />{' '}
          <div className='flex flex-col items-center pb-2'>
            <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl'>
              All Blogs
            </h2>
            <p className='text-muted-foreground mt-2'>
              Read about experiences and insights from our community members
            </p>
          </div>
          <div
            className={cn(
              `mx-auto grid max-w-7xl gap-6 border-b-4 border-double pb-4`,
              `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`,
              `justify-content-center place-items-center`
            )}
          >
            <Blogs blogs={transformedBlogs || []} type={'guest'} />
          </div>
        </div>
      </section>
      {session && (
        <section className='flex flex-col items-center space-y-2 pb-4'>
          <PostTable
            title='Blogs'
            limit={PAGE_SIZE}
            blogs={transformedBlogs || []}
            type='guest'
          />
          {rawBlogs.totalPages && rawBlogs.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={rawBlogs.totalPages}
            />
          )}
        </section>
      )}
    </div>
  );
};

export default BlogsPage;
