import { getAllBlogs, getBlogsByAuthUser } from '@/actions/blog-actions';
import { getAllUsers } from '@/actions/user-actions';
import { auth } from '@/auth';
import PostTable from '@/components/blogs/post-table';
import AnalyticsChart from '@/components/dashboard/analytics-chart';
import { Pagination } from '@/components/pagination';
import SectionCards from '@/components/section-cards';
import { PostProps } from '@/lib/types';
import { Session } from 'next-auth';

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    slug?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const resolvedParams = await searchParams;

  const {
    q = '',
    slug = '',
    category = 'all',
    sort = 'newest',
    page = '1',
  } = resolvedParams;
  const rawUserBlogs = (await getBlogsByAuthUser()).data || [];
  // Map blogs to match the Post type expected by PostTable
  const blogs = rawUserBlogs.map((blog: PostProps) => ({
    ...blog,
    author: blog.author,
    date: blog.createdAt
      ? blog.createdAt instanceof Date
        ? blog.createdAt.toISOString()
        : new Date(blog.createdAt).toISOString()
      : new Date().toISOString(),
    comments: blog.comments ?? [],
  }));

  const rawBlogs = await getAllBlogs({
    query: q || 'all', // Don't pass empty string, pass
    slug: slug || 'all', // Don't pass empty string, pass undefined
    category: category === 'all' ? undefined : category,
    sort,
    page: Number(page) || 1,
  });
  const session = (await auth()) as Session;
  const userRole = session?.user.role;
  const newBlogs = userRole === 'USER' ? blogs : rawBlogs.data;
  const users = await getAllUsers();
  // if (!session.user) {
  //   return redirect('/');
  // }

  return (
    <>
      <div className='flex w-full flex-1 flex-col pb-18'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <SectionCards blogs={rawBlogs.data} users={users.data} />
            {/* </div> */}
          </div>
          <AnalyticsChart />
          <div className='flex flex-col items-center space-y-2 px-6'>
            <PostTable
              title='Latest Posts'
              blogs={newBlogs || []}
              type='user'
            />
            {rawBlogs.totalPages && rawBlogs.totalPages > 1 && (
              <Pagination
                page={Number(page) || 1}
                totalPages={rawBlogs.totalPages}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
