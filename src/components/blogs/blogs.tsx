'use client';

import BlogCard from '@/components/blogs/blog-card';
import { PostProps } from '@/lib/types';
import { summarizeBlogContent } from '@/lib/utils';

type BlogsProps = {
  blogs: PostProps[];
  type: 'guest' | 'user';
};

const Blogs = ({ blogs, type }: BlogsProps) => {
  return (
    <>
      {blogs?.map((post) => {
        return (
          <BlogCard
            post={post}
            type={type}
            key={post.id}
            blogs={blogs}
            slug={post.slug}
          />
        );
      })}
    </>
  );
};

export default Blogs;
