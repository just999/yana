'use client';

import { Img } from '@/assets/img';
import BlogContent from '@/components/blogs/blog-content';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { localAvatar } from '@/lib/constants';
import { PostProps } from '@/lib/types';
import {
  calculateReadTime,
  formatDate,
  summarizeBlogContent,
} from '@/lib/utils';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type BlogCardProps = {
  post: PostProps;
  type: 'guest' | 'user';
};

const BlogCard = ({ post, type }: BlogCardProps) => {
  const sumContent = summarizeBlogContent(post.content, 200);

  const commentCount = post.comments?.length;
  const readTime = calculateReadTime(post.content);
  const postLikeCount = post.reactions.length;
  return (
    <Card key={post.slug} className='group min-w-72 overflow-hidden'>
      <div className='relative h-40 overflow-hidden'>
        {Array.isArray(post.images) && post.images.length > 0 ? (
          post.images
            .slice(0, 1)
            .map((img, i) => (
              <Image
                src={img || '/img/noimg.svg'}
                alt={post.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                key={img}
              />
            ))
        ) : (
          <div className='bg-accent/80 z-10 flex w-full text-center'>
            <Img className='mx-auto h-48 w-auto text-amber-200' />
          </div>
        )}
      </div>
      <CardHeader className='bg-accent-foreground/5 p-0 py-2'>
        <div className='mb-2 flex w-full flex-wrap items-center justify-between gap-2 px-2'>
          <Badge variant='secondary' className='bg-stone-500/50 font-normal'>
            {post.category}
          </Badge>
          <div className='flex items-center gap-1 text-xs'>
            <span className='align-middle text-xs text-sky-500'>187 </span>{' '}
            views
          </div>
        </div>
        <CardTitle className='px-2 transition-colors'>
          <Link
            href={`/blogs/${post.slug}`}
            className='underline-offset-2 hover:underline hover:decoration-amber-500'
          >
            {post.title.substring(0, 35)}...
          </Link>
        </CardTitle>
        <CardDescription className='bg-foreground/10 mt-2 line-clamp-2 w-full p-1 text-[12px] text-stone-500'>
          {/* {post.excerpt} */} {sumContent}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div>
          <div className='flex items-center justify-center gap-5'>
            {type === 'user' && <BlogContent content={post.content} />}
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex flex-col justify-between gap-2 p-4 pt-0'>
        <div className='flex w-full items-center justify-between space-x-2'>
          <div className='flex items-center space-x-1.5'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={post.author?.avatar || localAvatar}
                className=' '
              />
              <AvatarFallback>{post.author?.avatar || 'avatar'}</AvatarFallback>
            </Avatar>
            <div className='text-sm'>
              <p className='max-w-14 text-xs leading-none font-medium text-wrap'>
                {post.author?.name}
              </p>
              <p className='text-muted-foreground text-xs'>
                {formatDate.date(post.createdAt?.toISOString() ?? '')}
              </p>
            </div>
          </div>

          <span className='text-muted-foreground flex items-center gap-1 text-xs'>
            {/* {post.readTime} */} <Clock size={12} className='text-sky-200' />{' '}
            <span className='text-amber-300'>{readTime} mins</span>
          </span>
        </div>

        <div className='flex w-full justify-between'>
          <div className='text-xs'>
            comments:
            <span className='font-semibold text-amber-200'>
              {' '}
              {commentCount}
            </span>
          </div>
          <div>{postLikeCount} ❤️</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
