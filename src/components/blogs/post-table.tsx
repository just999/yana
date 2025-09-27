'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import {
  deleteBlogBySlug,
  updateBlogAnonymous,
  updateBlogFeatured,
} from '@/actions/blog-actions';
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { PostProps } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { BookOpen, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import AlertDialogButton from '../alert-dialog-button';

type PostTableProps = {
  limit?: number;
  title?: string;
  blogs: PostProps[] | [];
  type: 'guest' | 'user';
};

const PostTable = ({
  limit,
  title,
  blogs: initialBlogs,
  type,
}: PostTableProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [blogs, setBlogs] = useState(initialBlogs);
  const [featuredStatus, setFeaturedStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [anonymousStatus, setAnonymousStatus] = useState<
    Record<string, boolean>
  >({});

  const [updatingFeatured, setUpdatingFeatured] = useState<Set<string>>(
    new Set()
  );
  const [updatingAnonymous, setUpdatingAnonymous] = useState<Set<string>>(
    new Set()
  );
  const [updatingPosts, setUpdatingPosts] = useState(new Set<string>());
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBlogs(initialBlogs);

    const initialStatus: Record<string, boolean> = {};
    initialBlogs.forEach((post: PostProps) => {
      initialStatus[post.slug] = post.featured || false;
    });
    setFeaturedStatus(initialStatus);

    setUpdatingPosts(new Set());
    setDeletingSlug(null);
  }, [initialBlogs]);

  const handleFeaturedChange = useCallback(
    async (post: PostProps, checked: boolean) => {
      setFeaturedStatus((prev) => ({ ...prev, [post.slug]: checked }));
      setUpdatingFeatured((prev) => new Set([...prev, post.slug]));
      // setUpdatingPosts((prev) => new Set([...prev, post.slug]));

      try {
        const result = await updateBlogFeatured(post.slug, checked);
        if (result.error) throw new Error(result.message);

        toast.success('Featured status updated successfully');

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.slug === post.slug ? { ...blog, featured: checked } : blog
          )
        );
      } catch (error) {
        setFeaturedStatus((prev) => ({ ...prev, [post.slug]: !checked }));
        toast.error('Failed to update featured status');
        console.error('Error updating featured status:', error);
      } finally {
        setUpdatingFeatured((prev) => {
          const newSet = new Set(prev);
          newSet.delete(post.slug);
          return newSet;
        });
      }
    },
    []
  );
  const handleAnonymousChange = useCallback(
    async (post: PostProps, checked: boolean) => {
      setAnonymousStatus((prev) => ({ ...prev, [post.slug]: checked }));
      setUpdatingAnonymous((prev) => new Set([...prev, post.slug]));

      try {
        const result = await updateBlogAnonymous(post.slug, checked);
        if (result.error) throw new Error(result.message);

        toast.success('Anonymous status updated successfully');

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.slug === post.slug ? { ...blog, anonymous: checked } : blog
          )
        );
      } catch (error) {
        setAnonymousStatus((prev) => ({ ...prev, [post.slug]: !checked }));
        toast.error('Failed to update anonymous status');
        console.error('Error updating anonymous status:', error);
      } finally {
        setUpdatingAnonymous((prev) => {
          const newSet = new Set(prev);
          newSet.delete(post.slug);
          return newSet;
        });
      }
    },
    []
  );

  const handleDelete = useCallback(async (slug: string) => {
    // Or slug: string if switching
    setDeletingSlug(slug);
    try {
      const result = await deleteBlogBySlug(slug);
      startTransition(() => {
        if (result?.error) {
          toast.error(result.message || 'Failed to delete blog');
        } else {
          toast.success(result?.message || 'Blog deleted successfully');
          setBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.slug !== slug)
          );
          setFeaturedStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[slug];
            return newStatus;
          });
        }
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingSlug(null);
    }
  }, []);

  const isDeleting = (slug: string) => deletingSlug === slug && isPending;

  return (
    <div className='mx-auto mt-8 min-w-5xl rounded-lg border pt-4'>
      <h3 className='mb-4 px-2 text-2xl font-semibold underline'>
        {title ? title : 'Posts'}
      </h3>
      <Table>
        <TableCaption className='underline'>
          A list of recent posts
        </TableCaption>
        <TableHeader className='bg-accent/70'>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className='hidden md:table-cell'>Author</TableHead>
            <TableHead className='hidden text-center md:table-cell'>
              Date
            </TableHead>
            {session?.user.role === 'ADMIN' && (
              <TableHead className='hidden text-center md:table-cell'>
                Featured
              </TableHead>
            )}
            {(session?.user.role === 'ADMIN' || session?.user.email) && (
              <TableHead className='hidden text-center md:table-cell'>
                Anonymous
              </TableHead>
            )}
            <TableHead className='hidden text-center md:table-cell'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs && blogs.length > 0 ? (
            blogs.slice(0, limit).map((post, i) => (
              <TableRow
                key={post.slug}
                className={`group ${isDeleting(post.slug) ? 'opacity-50' : ''}`}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <div className='max-w-xs'>
                    <p className='truncate' title={post.title}>
                      {post.title.substring(0, 50)}
                      {post.title.length > 50 && '...'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='hidden md:table-cell'>
                  {post.author?.name ? post.author.name : 'anonymous'}
                </TableCell>
                <TableCell className='hidden text-center md:table-cell'>
                  {formatDate.date(post.createdAt?.toLocaleDateString() ?? '')}
                </TableCell>
                {session?.user.role === 'ADMIN' && (
                  <TableCell className='hidden text-center md:table-cell'>
                    <div className='flex items-center justify-center gap-2'>
                      <Checkbox
                        className='bg-amber-50'
                        checked={
                          featuredStatus[post.slug] ?? post.featured ?? false
                        }
                        onCheckedChange={(checked) =>
                          handleFeaturedChange(
                            post,
                            checked === 'indeterminate' ? false : checked
                          )
                        }
                        disabled={updatingFeatured.has(post.slug) || isPending}
                      />
                      <span className='text-sm'>
                        {updatingFeatured.has(post.slug) ? (
                          <span className='flex items-center gap-0.5 text-amber-200'>
                            <Loader2 className='size-4 animate-spin' />
                            Update
                          </span>
                        ) : (
                          'isFeatured'
                        )}
                      </span>
                    </div>
                  </TableCell>
                )}
                {(session?.user.role === 'ADMIN' || session?.user.email) && (
                  <TableCell className='hidden text-center md:table-cell'>
                    <div className='flex items-center justify-center gap-2'>
                      <Checkbox
                        className='bg-amber-50'
                        checked={
                          anonymousStatus[post.slug] ?? post.anonymous ?? false
                        }
                        onCheckedChange={(checked) =>
                          handleAnonymousChange(
                            post,
                            checked === 'indeterminate' ? false : checked
                          )
                        }
                        disabled={updatingAnonymous.has(post.slug) || isPending}
                      />
                      <span className='text-sm'>
                        {updatingAnonymous.has(post.slug) ? (
                          <span className='flex items-center gap-0.5 text-amber-200'>
                            <Loader2 className='size-4 animate-spin' />
                            Updating...
                          </span>
                        ) : (
                          'isAnonymous'
                        )}
                      </span>
                    </div>
                  </TableCell>
                )}
                {session?.user.id ? (
                  <TableCell className='flex w-full items-center justify-center gap-2'>
                    <Button
                      asChild
                      type='button'
                      variant={'ghost'}
                      size={'sm'}
                      className='group h-6 rounded bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50'
                      disabled={isDeleting(post.slug)}
                    >
                      <Link
                        href={`/dashboard/blogs/edit-blog/${post.slug}`}
                        className='flex items-center gap-1'
                      >
                        <Pencil size={16} className='svg' />
                        Edit
                      </Link>
                    </Button>

                    <AlertDialogButton
                      icon={isDeleting(post.slug) ? Loader2 : Trash2}
                      iconClassName={
                        isDeleting(post.slug) ? 'animate-spin' : ''
                      }
                      remove={() => handleDelete(post.slug)}
                      disabled={isDeleting(post.slug)}
                      className='h-6 gap-2 rounded bg-red-500 px-4 text-xs font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                      title='Delete Blog'
                      description={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
                      destructive
                      action='Delete'
                    />
                  </TableCell>
                ) : (
                  <TableCell className='flex w-full items-center justify-center gap-2'>
                    <Button
                      variant={'ghost'}
                      size={'sm'}
                      type='button'
                      asChild
                      className='group flex items-center text-xs shadow-2xl dark:bg-amber-700/20'
                    >
                      <Link
                        href={`/blogs/${post.slug}`}
                        className='text-stone-400 dark:hover:bg-amber-700/40'
                      >
                        <BookOpen size={24} className='svg' /> Open
                      </Link>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={session?.user.role === 'ADMIN' ? 6 : 5}
                className='text-muted-foreground py-8 text-center'
              >
                No blogs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {limit && blogs.length > limit && (
        <div className='mt-4 text-center'>
          <p className='text-muted-foreground text-sm'>
            Showing {limit} of {blogs.length} blogs
          </p>
        </div>
      )}
    </div>
  );
};

export default PostTable;
