'use client';

import { useState } from 'react';

import { localAvatar } from '@/lib/constants';
import { categories } from '@/lib/helpers';
import { PostProps } from '@/lib/types';
import DOMPurify from 'dompurify';
import { ChevronUp, Mail, Tag, TrendingUp } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '../ui';
import { popularPosts } from './blog-test';

type BlogSidebarProps = {
  blog: PostProps;
  allBlogs: PostProps[];
  featuredBlogs?: PostProps[];
};

const BlogSidebar = ({ blog, allBlogs, featuredBlogs }: BlogSidebarProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [email, setEmail] = useState('');

  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setNewComment('');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setEmail('');
  };

  const cats = allBlogs.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const arrayCats = Object.entries(cats).map(([cat, count]) => ({
    cat,
    count,
  }));

  return (
    <div className='space-y-8 rounded-lg lg:col-span-1'>
      <div className='space-y-8 lg:col-span-1'>
        {/* Author Bio */}
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <Avatar className='mx-auto mb-4 h-20 w-20'>
                <AvatarImage
                  src={blog.author.avatar || localAvatar}
                  alt={blog.author.name}
                />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <h3 className='mb-1 text-lg font-semibold'>{blog.author.name}</h3>
              <p className='mb-3 text-sm text-gray-600'>{blog.author.role}</p>
              <p className='mb-4 text-sm text-gray-700'>
                {/* {blogPost.author.bio} */}
              </p>
              <Button variant='outline' size='sm' className='w-full'>
                Follow Author
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <Card className='bg-gradient-to-br from-blue-50 to-indigo-50'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Mail className='h-5 w-5 text-blue-600' />
              <span className='text-lg text-stone-600'>Stay Updated</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4 text-sm text-gray-700'>
              Get the latest articles on bullying prevention and school safety
              delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className='space-y-3'>
              <Input
                type='email'
                placeholder='Your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='h-full align-middle'
              />
              <Button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-700'
              >
                Subscribe
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Featured Posts */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <ChevronUp className='h-5 w-5 text-green-600' />
              <span>Featured Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {featuredBlogs?.map((post, index) => {
                const contentValue = DOMPurify.sanitize(post.content, {
                  ALLOWED_TAGS: [
                    'img',
                    'div',
                    'span',
                    'p',
                    'a',
                    'br',
                    'strong',
                    'em',
                    'ul',
                    'li',
                    'ol',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                  ],
                  ALLOWED_ATTR: [
                    'src',
                    'alt',
                    'data-image-id',
                    'style',
                    'class',
                    'width',
                    'height',
                  ],
                  ALLOWED_URI_REGEXP: /^data:image\/|^blob:|^https?:\/\//,
                });
                // console.log('🚀 ~ contentValue:', contentValue);
                return (
                  <div key={index} className='group cursor-pointer'>
                    <div className='featured-blog space-x-3'>
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className='rounded-lg object-cover transition-opacity group-hover:opacity-90'
                      />
                      <div className='flex-1'>
                        <div className='flex flex-col items-start justify-between text-xs text-gray-500'>
                          <Badge variant='secondary' className='text-[10px]'>
                            {blog.category}
                          </Badge>
                          {/* <span className='text-[8px]'>({post.readTime})</span> */}
                        </div>
                        <h4 className='mb-2 text-sm leading-tight font-semibold transition-colors group-hover:text-blue-600'>
                          {post.title}
                        </h4>
                        <p className='mb-2 line-clamp-2 w-full text-xs text-gray-600'>
                          {/* {contentValue.substring(0, 30)} */}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popular Posts */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <TrendingUp className='h-5 w-5 text-orange-600' />
              <span>Most Read</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {popularPosts.map((post, index) => (
                <div key={index} className='group cursor-pointer'>
                  <div className='flex items-start space-x-3'>
                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600'>
                      {index + 1}
                    </div>
                    <div className='flex-1'>
                      <h4 className='mb-1 text-sm leading-tight font-medium transition-colors group-hover:text-blue-600'>
                        {post.title}
                      </h4>
                      <p className='text-xs text-gray-500'>{post.views}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Tag className='h-5 w-5 text-purple-600' />
              <span>Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {arrayCats.map((category, index) => (
                <div
                  key={index}
                  className='hover:bg-accent/80 -mx-2 flex cursor-pointer items-center justify-between rounded px-2 py-2 transition-colors'
                >
                  <span className='text-sm font-medium text-stone-300'>
                    {category.cat}
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogSidebar;
