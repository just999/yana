// 'use client';

// import { deleteBlogBySlug } from '@/actions/blog-actions';
// import {
//   Button,
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui';
// import { blogAtom } from '@/lib/jotai/blog-atoms';
// import { PostProps } from '@/lib/types';
// // import posts from '@/data/posts';

// import { formatDate } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { Pencil, Trash, Trash2Icon, X } from 'lucide-react';
// import { useSession } from 'next-auth/react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// import AlertDialogButton from '../alert-dialog-button';

// type PostTableProps = {
//   limit?: number;
//   title?: string;
//   blogs: PostProps[];
// };

// const PostTable = ({ limit, title, blogs }: PostTableProps) => {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [formData, setFormData] = useAtom(blogAtom);

//   const remove = (slug: string) => {
//     console.log('removed:', slug);
//   };
//   return (
//     <div className='mx-auto mt-10 w-6xl'>
//       <h3 className='mb-4 text-2xl font-semibold'>{title ? title : 'Posts'}</h3>
//       <Table>
//         <TableCaption className='underline'>
//           A list of recent posts
//         </TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead>No</TableHead>
//             <TableHead>Title</TableHead>
//             <TableHead className='hidden md:table-cell'>Author</TableHead>
//             <TableHead className='hidden text-center md:table-cell'>
//               Date
//             </TableHead>
//             <TableHead className='hidden text-center md:table-cell'>
//               Actions
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {blogs &&
//             blogs.map((post, i) => (
//               <TableRow key={post.slug} className='group'>
//                 <TableCell>{i + 1}</TableCell>
//                 <TableCell>{post.title.substring(0, 50)}</TableCell>
//                 <TableCell className='hidden md:table-cell'>
//                   {post.author?.name ? post.author.name : 'anonymous'}
//                 </TableCell>
//                 <TableCell className='hidden text-center md:table-cell'>
//                   {formatDate.date(post.createdAt?.toLocaleDateString() ?? '')}
//                 </TableCell>
//                 {session && (
//                   <TableCell className='flex w-full items-center justify-center gap-2'>
//                     <Button
//                       // onClick={() => {
//                       //   setFormData(post);
//                       //   router.push(`/dashboard/blogs/edit-blog/${post.slug}`);
//                       // }}
//                       asChild
//                       type='button'
//                       variant={'ghost'}
//                       size={'sm'}
//                       className='group rounded bg-blue-500 px-4 py-2 text-xs font-bold text-white group-hover:bg-amber-700'
//                     >
//                       <Link
//                         className='group-hover:bg-amber-700'
//                         href={`/dashboard/blogs/edit-blog/${post.slug}`}
//                       >
//                         <Pencil size={20} className='svg' /> Edit
//                       </Link>
//                     </Button>

//                     <div className=''>
//                       <AlertDialogButton
//                         icon={X}
//                         remove={() => deleteBlogBySlug(post.slug)}
//                         className='rounded bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600'
//                       />
//                     </div>
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default PostTable;

// 'use client';

// import { useCallback, useState, useTransition } from 'react';

// import { deleteBlogBySlug, updateBlogFeatured } from '@/actions/blog-actions';
// import {
//   Button,
//   Checkbox,
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui';
// import { PostProps } from '@/lib/types';
// import { formatDate } from '@/lib/utils';
// import { BookOpen, Loader2, Pencil, Trash2 } from 'lucide-react';
// import { useSession } from 'next-auth/react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';

// import AlertDialogButton from '../alert-dialog-button';

// type PostTableProps = {
//   limit?: number;
//   title?: string;
//   blogs: PostProps[] | [];
//   type: 'guest' | 'user';
// };

// const PostTable = ({
//   limit,
//   title,
//   blogs: initialBlogs,
//   type,
// }: PostTableProps) => {
//   const { data: session } = useSession();

//   const router = useRouter();

//   const [blogs, setBlogs] = useState(initialBlogs);
//   const [blogFeatured, setBlogFeatured] = useState(false);
//   const [featuredStatus, setFeaturedStatus] = useState(() => {
//     const initialStatus: Record<string, boolean> = {};
//     blogs.forEach((post: PostProps) => {
//       initialStatus[post.slug] = post.featured || false;
//     });
//     return initialStatus;
//   });

//   const [updatingPosts, setUpdatingPosts] = useState(new Set());
//   const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
//   const [isPending, startTransition] = useTransition();

//   // Handle checkbox change
//   const handleFeaturedChange = useCallback(
//     async (post: PostProps, checked: boolean) => {
//       // Optimistic update
//       setFeaturedStatus((prev) => ({ ...prev, [post.slug]: checked }));
//       setUpdatingPosts((prev) => new Set([...prev, post.slug]));

//       try {
//         const result = await updateBlogFeatured(post.slug, checked);
//         if (result.error) throw new Error(result.message);
//         toast.success('Updated successfully');
//       } catch (error) {
//         setFeaturedStatus((prev) => ({ ...prev, [post.slug]: !checked }));
//         toast.error('Update failed');
//       } finally {
//         setUpdatingPosts((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(post.slug);
//           return newSet;
//         });
//       }
//     },
//     [updateBlogFeatured]
//   );

//   // Submit featured status update using server action
//   const handleSubmitFeatured = useCallback(
//     async (post: PostProps) => {
//       setUpdatingPosts((prev) => new Set([...prev, post.slug]));

//       startTransition(async () => {
//         try {
//           const result = await updateBlogFeatured(
//             post.slug,
//             featuredStatus[post.slug]
//           );

//           if (result.error) {
//             toast.error(result.message || 'Failed to update featured status');
//             // Revert the change on error
//             setFeaturedStatus((prev) => ({
//               ...prev,
//               [post.slug]: !prev[post.slug],
//             }));
//           } else {
//             toast.success('Featured status updated successfully');
//           }
//         } catch (error) {
//           console.error('Error updating featured status:', error);
//           toast.error('Failed to update featured status');
//           // Revert the change on error
//           setFeaturedStatus((prev) => ({
//             ...prev,
//             [post.slug]: !prev[post.slug],
//           }));
//         } finally {
//           setUpdatingPosts((prev) => {
//             const newSet = new Set(prev);
//             newSet.delete(post.slug);
//             return newSet;
//           });
//         }
//       });
//     },
//     [featuredStatus, updateBlogFeatured]
//   );

//   // Auto-submit on checkbox change (alternative approach)
//   const handleAutoSubmitFeatured = useCallback(
//     async (post: PostProps, checked: boolean) => {
//       setFeaturedStatus((prev) => ({
//         ...prev,
//         [post.slug]: checked,
//       }));

//       setUpdatingPosts((prev) => new Set([...prev, post.slug]));

//       try {
//         const result = await updateBlogFeatured(post.slug, checked);
//         // ... handle result
//         if (result.error) {
//           setFeaturedStatus((prev) => ({
//             ...prev,
//             [post.slug]: !checked,
//           }));
//           toast.error(result.message);
//         } else {
//           toast.success(result.message);
//           router.refresh();
//         }
//       } catch (error) {
//         // Revert on error
//         setFeaturedStatus((prev) => ({ ...prev, [post.slug]: !checked }));
//         // ... error handling
//       } finally {
//         setUpdatingPosts((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(post.slug);
//           return newSet;
//         });
//       }
//     },
//     [updateBlogFeatured]
//   );

//   const handleDelete = async (slug: string) => {
//     setDeletingSlug(slug);

//     try {
//       startTransition(async () => {
//         const result = await deleteBlogBySlug(slug);

//         if (result?.error) {
//           toast.error(result?.message || 'Failed to delete blog');
//         } else {
//           toast.success(result?.message || 'Blog deleted successfully');

//           // Remove the deleted blog from local state for immediate UI update
//           setBlogs((prevBlogs) =>
//             prevBlogs.filter((blog) => blog.slug !== slug)
//           );

//           // Optionally refresh the page to ensure data consistency
//           router.refresh();
//         }
//       });
//     } catch (error) {
//       console.error('Error deleting blog:', error);
//       toast.error('An unexpected error occurred');
//     } finally {
//       setDeletingSlug(null);
//     }
//   };

//   const isDeleting = (slug: string) => deletingSlug === slug && isPending;

//   return (
//     <div className='mx-auto mt-10 w-6xl'>
//       <h3 className='mb-4 text-2xl font-semibold'>{title ? title : 'Posts'}</h3>
//       <Table>
//         <TableCaption className='underline'>
//           A list of recent posts
//         </TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead>No</TableHead>
//             <TableHead>Title</TableHead>
//             <TableHead className='hidden md:table-cell'>Author</TableHead>
//             <TableHead className='hidden text-center md:table-cell'>
//               Date
//             </TableHead>
//             {session?.user.role === 'ADMIN' && (
//               <TableHead className='hidden text-center md:table-cell'>
//                 Featured
//               </TableHead>
//             )}
//             <TableHead className='hidden text-center md:table-cell'>
//               Actions
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {blogs &&
//             blogs
//               .slice(0, limit) // Apply limit if provided
//               .map((post, i) => (
//                 <TableRow
//                   key={post.slug}
//                   className={`group ${isDeleting(post.slug) ? 'opacity-50' : ''}`}
//                 >
//                   <TableCell>{i + 1}</TableCell>
//                   <TableCell>
//                     <div className='max-w-xs'>
//                       <p className='truncate' title={post.title}>
//                         {post.title.substring(0, 50)}
//                         {post.title.length > 50 && '...'}
//                       </p>
//                     </div>
//                   </TableCell>
//                   <TableCell className='hidden md:table-cell'>
//                     {post.author?.name ? post.author.name : 'anonymous'}
//                   </TableCell>
//                   <TableCell className='hidden text-center md:table-cell'>
//                     {formatDate.date(
//                       post.createdAt?.toLocaleDateString() ?? ''
//                     )}
//                   </TableCell>
//                   {session?.user.role === 'ADMIN' && (
//                     <TableCell
//                       className='hidden text-center md:table-cell'
//                       // onClick={() =>
//                       //   handleAutoSubmitFeatured(post, blogFeatured)
//                       // }
//                     >
//                       <div className='flex items-center justify-center gap-2'>
//                         {/* Option 1: Manual submit with save button */}
//                         <Checkbox
//                           className='bg-amber-50'
//                           checked={featuredStatus[post.slug] || false}
//                           onCheckedChange={(checked) =>
//                             handleFeaturedChange(
//                               post,
//                               checked === 'indeterminate' ? false : checked
//                             )
//                           }
//                           disabled={updatingPosts.has(post.slug) || isPending}
//                         />
//                         <span className='text-sm'>isFeatured</span>
//                       </div>
//                     </TableCell>
//                   )}
//                   {session?.user.id ? (
//                     <TableCell className='flex w-full items-center justify-center gap-2'>
//                       <Button
//                         asChild
//                         type='button'
//                         variant={'ghost'}
//                         size={'sm'}
//                         className='group h-6 rounded bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50'
//                         disabled={isDeleting(post.slug)}
//                       >
//                         <Link
//                           href={`/dashboard/blogs/edit-blog/${post.slug}`}
//                           className='flex items-center gap-1'
//                         >
//                           <Pencil size={16} className='svg' />
//                           Edit
//                         </Link>
//                       </Button>

//                       <AlertDialogButton
//                         icon={isDeleting(post.slug) ? Loader2 : Trash2}
//                         iconClassName={
//                           isDeleting(post.slug) ? 'animate-spin' : ''
//                         }
//                         remove={() => handleDelete(post.slug)}
//                         disabled={isDeleting(post.slug)}
//                         className='h-6 gap-2 rounded bg-red-500 px-4 text-xs font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
//                         title='Delete Blog'
//                         description={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
//                         destructive
//                         action='Delete'
//                       />
//                     </TableCell>
//                   ) : (
//                     <TableCell className='flex w-full items-center justify-center gap-2'>
//                       <Button
//                         variant={'ghost'}
//                         size={'sm'}
//                         type='button'
//                         asChild
//                         className='group flex items-center text-xs shadow-2xl dark:bg-amber-700/20'
//                       >
//                         <Link
//                           href={`/blogs/${post.slug}`}
//                           className='text-stone-400 dark:hover:bg-amber-700/40'
//                         >
//                           <BookOpen size={24} className='svg' /> Open
//                         </Link>
//                       </Button>
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))}

//           {blogs.length === 0 && (
//             <TableRow>
//               <TableCell
//                 colSpan={5}
//                 className='text-muted-foreground py-8 text-center'
//               >
//                 No blogs found
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       {limit && blogs.length > limit && (
//         <div className='mt-4 text-center'>
//           <p className='text-muted-foreground text-sm'>
//             Showing {limit} of {blogs.length} blogs
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostTable;

'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { deleteBlogBySlug, updateBlogFeatured } from '@/actions/blog-actions';
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
  const [updatingPosts, setUpdatingPosts] = useState(new Set<string>());
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync local state with props when they change (CRITICAL FIX)
  useEffect(() => {
    setBlogs(initialBlogs);

    // Reset featured status when blogs change
    const initialStatus: Record<string, boolean> = {};
    initialBlogs.forEach((post: PostProps) => {
      initialStatus[post.slug] = post.featured || false;
    });
    setFeaturedStatus(initialStatus);

    // Clear any pending operations when data changes
    setUpdatingPosts(new Set());
    setDeletingSlug(null);
  }, [initialBlogs]);

  // Handle checkbox change with optimistic updates
  const handleFeaturedChange = useCallback(
    async (post: PostProps, checked: boolean) => {
      // Optimistic update
      setFeaturedStatus((prev) => ({ ...prev, [post.slug]: checked }));
      setUpdatingPosts((prev) => new Set([...prev, post.slug]));

      try {
        const result = await updateBlogFeatured(post.slug, checked);
        if (result.error) throw new Error(result.message);

        toast.success('Featured status updated successfully');

        // Update the local blogs array to keep it in sync
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.slug === post.slug ? { ...blog, featured: checked } : blog
          )
        );

        // Optional: refresh to ensure server sync
        // router.refresh();
      } catch (error) {
        // Revert optimistic update on error
        setFeaturedStatus((prev) => ({ ...prev, [post.slug]: !checked }));
        toast.error('Failed to update featured status');
        console.error('Error updating featured status:', error);
      } finally {
        setUpdatingPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(post.slug);
          return newSet;
        });
      }
    },
    []
  );

  // Handle delete with optimistic updates
  const handleDelete = useCallback(
    async (slug: string) => {
      setDeletingSlug(slug);

      try {
        startTransition(async () => {
          const result = await deleteBlogBySlug(slug);

          if (result?.error) {
            toast.error(result?.message || 'Failed to delete blog');
          } else {
            toast.success(result?.message || 'Blog deleted successfully');

            // Optimistically remove from local state
            setBlogs((prevBlogs) =>
              prevBlogs.filter((blog) => blog.slug !== slug)
            );

            // Clean up related state
            setFeaturedStatus((prev) => {
              const newStatus = { ...prev };
              delete newStatus[slug];
              return newStatus;
            });

            // Refresh to get updated pagination/data
            router.refresh();
          }
        });
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setDeletingSlug(null);
      }
    },
    [router]
  );

  const isDeleting = (slug: string) => deletingSlug === slug && isPending;

  return (
    <div className='mx-auto mt-10 w-6xl'>
      <h3 className='mb-4 text-2xl font-semibold'>{title ? title : 'Posts'}</h3>
      <Table>
        <TableCaption className='underline'>
          A list of recent posts
        </TableCaption>
        <TableHeader>
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
            <TableHead className='hidden text-center md:table-cell'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs && blogs.length > 0 ? (
            blogs
              .slice(0, limit) // Apply limit if provided
              .map((post, i) => (
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
                    {formatDate.date(
                      post.createdAt?.toLocaleDateString() ?? ''
                    )}
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
                          disabled={updatingPosts.has(post.slug) || isPending}
                        />
                        <span className='text-sm'>
                          {updatingPosts.has(post.slug)
                            ? 'Updating...'
                            : 'isFeatured'}
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
