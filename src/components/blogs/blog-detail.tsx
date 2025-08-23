import { getBlogBySlug } from '@/actions/blog-actions';
import { getCommentByPostId } from '@/actions/comment-actions';
import { getAllLoveIds, getCurrentUserLoveIds } from '@/actions/toggle-actions';
import { getAllUsers } from '@/actions/user-actions';
import { auth } from '@/auth';
import ThumbsLikeButton from '@/components/thumbs-like-button';
import { localAvatar } from '@/lib/constants';
import { categories } from '@/lib/helpers';
import {
  CommentReactionsProps,
  PostProps,
  PostReactionsProps,
} from '@/lib/types';
import {
  calculateReadTime,
  formatDate,
  summarizeBlogContent,
} from '@/lib/utils';
import { Calendar, Clock, Share } from 'lucide-react';
import { Session } from 'next-auth';

import CommentForm from '../comments/comment-form';
import CommentList from '../comments/comment-list';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '../ui';
import BlogContent from './blog-content';

type BlogDetailProps = {
  blog: PostProps;
  slug: string;
  initialCommentReactions?: CommentReactionsProps;
  postInitialReactions?: PostReactionsProps;
};

const BlogDetail = async ({
  blog,
  slug,
  initialCommentReactions,
  postInitialReactions,
}: BlogDetailProps) => {
  const session = (await auth()) as Session;
  const rt = calculateReadTime(blog?.content);
  const post = (await getBlogBySlug(slug)).data as PostProps;
  const comments = (await getCommentByPostId(blog.id as string)).data || [];

  const imgCat = categories.filter((cat) => cat.name === blog.category)[0].img;
  console.log('🚀 ~ BlogDetail ~ imgCat:', imgCat);

  const likeIds = (await getCurrentUserLoveIds()).data || [];
  const allLoveIds = (await getAllLoveIds()).data || [];
  const allUsers = (await getAllUsers()).data || [];
  const commentsWithReaction = comments?.filter(
    (comment) => comment.parentId !== null
  );
  const authorId = blog.authorId;

  const sumContent = summarizeBlogContent(blog.content, 200);
  const keyToCheck = 'authorId';

  return (
    <div className='max-w-7xl lg:col-span-3'>
      <article className='overflow-hidden rounded-2xl bg-white shadow-lg'>
        <div className='relative h-96 overflow-hidden'>
          <img
            src={imgCat}
            alt='Students supporting each other in school hallway'
            className='h-full w-full object-cover opacity-80'
          />
          <div className='absolute inset-0 w-full bg-gradient-to-t from-black/50 to-transparent' />
          <div className='bg-accent/30 absolute right-6 bottom-12 left-6 rounded-lg p-2 backdrop-blur-sm'>
            <div className='mb-4 flex flex-wrap gap-2'>
              <Badge variant='secondary' className='bg-white/90 text-gray-800'>
                {blog?.category}
              </Badge>
            </div>
            <h1 className='mb-2 text-center text-2xl leading-tight font-bold text-stone-100'>
              {blog?.title}
            </h1>
            <p className='text-xl leading-relaxed text-gray-300'>
              {sumContent}
            </p>
          </div>
        </div>

        {/* Article Meta */}
        <div className='border-b px-8 pt-8'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col items-start space-x-4'>
              {/* <Avatar className='h-12 w-12'>
                <AvatarImage
                  src={blog?.author.avatar || localAvatar}
                  alt={blog?.author.name}
                />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar> */}
              <h1 className='mb-2 text-center text-2xl leading-tight font-bold text-stone-100 dark:text-stone-600'>
                {blog?.title}
              </h1>
              <div>
                <div className='font-semibold text-gray-900'>
                  @{blog?.author.name}
                </div>
                <div className='text-xs text-gray-500 lowercase'>
                  {/* {blog?.author.role} */}
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-6 text-sm text-gray-600'>
              <div className='flex items-center space-x-1'>
                <Calendar className='h-4 w-4' />
                {blog?.createdAt && (
                  <span className='text-xs text-sky-700'>
                    {formatDate.date(blog?.createdAt.toString())}
                  </span>
                )}
              </div>
              <div className='flex items-center space-x-1'>
                <Clock className='h-4 w-4' />
                <span className='font-bold'>{rt} </span>{' '}
                <span className='text-xs'>min readTime</span>
              </div>
            </div>
          </div>
        </div>

        {blog?.content && <BlogContent content={blog?.content} />}
      </article>
      <div className='flex w-full justify-between px-8 py-2'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={blog?.author.avatar || localAvatar}
              alt={blog?.author.name}
            />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Badge className='h-4 bg-stone-500/30 text-stone-100'>
            @{blog.author.name}{' '}
          </Badge>
        </div>
        <div className='flex items-center gap-8'>
          <ThumbsLikeButton
            postId={post.id as string}
            currentUserId={session.user.id}
            likeIds={likeIds}
            allLove={allLoveIds}
            iconSize={20}
            postInitialReactions={postInitialReactions}
          />
          <Share size={18} />
        </div>
      </div>

      <Card className='bg-card/50 mt-8 border-0 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-xl text-stone-400'>
            Comments ({Array.isArray(comments) && comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Comment Form */}
          <CommentForm
            postId={blog.id ?? ''}
            slug={blog.slug}
            blog={blog}
            commentsWithReaction={commentsWithReaction}
            comments={comments}
            startOpen
            session={session}
            likeIds={likeIds}
            allUsers={allUsers}
            allLoveIds={allLoveIds}
            initialCommentReactions={initialCommentReactions}
            path='comment'
          />

          <Separator className='mb-2' />

          {/* Comments List */}
          <div className='space-y-6'>
            <div className='w-full space-y-4'>
              {/* Replies */}
              <CommentList
                postId={blog.id || ''}
                blog={blog}
                initialCommentReactions={initialCommentReactions}
                path='comment'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogDetail;
