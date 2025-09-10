import {
  getAllBlogs,
  getBlogBySlug,
  getBlogsByUserId,
  getFeaturedBlogs,
} from '@/actions/blog-actions';
import {
  getCommentByPostId,
  getCommentReactions,
  getPostReactions,
  updateCommentReaction,
} from '@/actions/comment-actions';
import { updatePostReaction } from '@/actions/toggle-actions';
import { auth } from '@/auth';
import BackButton from '@/components/back-button';
import BlogDetail from '@/components/blogs/blog-detail';
import BlogSidebar from '@/components/blogs/blog-sidebar';
import { CommentReactionsProvider } from '@/lib/contexts/like-context';
import { PostReactionsProvider } from '@/lib/contexts/post-like-context';
import { CommentsProps, PostProps } from '@/lib/types';
import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    slug?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

const BlogDetailPage = async ({
  params,
  searchParams,
}: BlogDetailPageProps) => {
  const resolvedParams = await searchParams;

  const newSlug = await params;

  const featuredBlogs = (await getFeaturedBlogs()).data;

  const session = (await auth()) as Session;
  const posts = await getBlogsByUserId(session.user.id);
  const transformedBlogs = posts.data?.map((blog) => ({
    ...blog,
  }));

  const {
    q = '',
    slug = '',
    category = 'all',
    sort = 'newest',
    page = '1',
  } = resolvedParams;
  const blogs = (
    await getAllBlogs({
      query: q || 'all', // Don't pass empty string, pass
      slug: slug || 'all', // Don't pass empty string, pass undefined
      category: category === 'all' ? undefined : category,
      sort,
      page: Number(page),
    })
  ).data as PostProps[];

  const blog = (await getBlogBySlug(newSlug.slug)).data;
  const featured = blogs.filter((b) => b.featured);

  if (!blog) {
    redirect('/');
  }

  // Get comments and their IDs
  const comments =
    blog && ((await getCommentByPostId(blog.id)).data as CommentsProps[]);
  const commentIds = comments?.map((comment) => comment.id) || [];

  const initialCommentReactions =
    commentIds?.length > 0 ? await getCommentReactions(commentIds) : {};

  const postInitialReactions = blog?.id ? await getPostReactions(blog.id) : {};

  return (
    <section className='p-6 pt-16'>
      <BackButton text='Go Back' />
      <div className='flex w-full flex-col space-x-4 xl:flex-row xl:justify-center'>
        {blog && (
          <div className='w-full grow space-y-3'>
            <main className='mx-auto max-w-7xl rounded-lg border px-4 py-12 pb-4 sm:px-6 lg:px-8 dark:border-gray-500/70'>
              <div className='grid grid-cols-1 gap-12 pb-36 lg:grid-cols-4'>
                <CommentReactionsProvider
                  updateReactionAction={updateCommentReaction}
                >
                  <PostReactionsProvider
                    updatePostReactionAction={updatePostReaction}
                  >
                    <BlogDetail
                      blogs={transformedBlogs!}
                      blog={blog}
                      slug={newSlug.slug}
                      initialCommentReactions={initialCommentReactions}
                      postInitialReactions={postInitialReactions}
                    />
                    <BlogSidebar
                      blog={blog}
                      allBlogs={blogs}
                      featuredBlogs={featuredBlogs || []}
                    />
                  </PostReactionsProvider>
                </CommentReactionsProvider>
              </div>
            </main>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogDetailPage;
