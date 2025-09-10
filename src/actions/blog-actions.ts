'use server';

import { getAuthUserId } from '@/actions/auth-actions';
import { utapi } from '@/app/server/uploadthing';
import { auth } from '@/auth';
import { PAGE_SIZE } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  BlogSchema,
  blogSchema,
  updateBlogSchema,
  type UpdateBlogSchema,
} from '@/lib/schemas/blog-schemas';
import { formatError } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: true };
}>;

// !Helper function (could be in a separate utils file)
// export async function extractImageUrls(html: string): Promise<string[]> {
//   if (!html) return [];
//   if (typeof window !== 'undefined') {
//     // Browser environment

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, 'text/html');
//     return Array.from(doc.querySelectorAll('img[src^="https://"]')).map(
//       (img) => (img as HTMLImageElement).src
//     );
//   }
//   // Node.js environment (SSR)
//   // const { JSDOM } = require('jsdom');
//   const dom = new JSDOM(html);
//   return Array.from(
//     dom.window.document.querySelectorAll('img[src^="https://"]')
//   ).map((img) => (img as HTMLImageElement).src);
// }

// !GET ALL CATEGORIES
export async function getAllCategories() {
  try {
    const data = await db.post.groupBy({
      by: ['category'],
      _count: true,
    });
    return {
      error: false,
      message: 'post successfully fetch',
      data: data,
    };
  } catch (error) {
    return {
      error: true,
      message: formatError(error),
    };
  }
}

// !CREATE NEW BLOG
export async function createNewBlog(data: BlogSchema) {
  // TODO: validate the data

  try {
    const session = await auth();

    const validated = blogSchema.parse(data);
    if (!session) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    const existingBlogSlug = await db.post.findUnique({
      where: {
        slug: validated.slug,
      },
    });

    if (existingBlogSlug) {
      return {
        error: true,
        message: 'this slug is taken, please select different slug',
      };
    }

    const post = await db.post.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        category: validated.category,
        authorId: session.user.id,
        images: validated.images?.map((img) => img),
      },
    });

    if (!post) {
      return { error: true, message: 'Failed to create the blog.' };
    }

    revalidatePath('/dashboard/blogs');

    return {
      error: false,
      message: 'blog successfully created',
      data: post,
    };
  } catch (err: unknown) {
    // if (error.code === 'P2002') {
    //   return { error: 'That slug already exists.' };
    // }

    return { error: true, message: formatError(err) };
  }

  // revalidatePath('/');
  // redirect(`/blog/${post.slug}`);
}

// !CREATE NEW BLOG
export async function newBlog(prevState: unknown, formData: BlogSchema) {
  // TODO: validate the data

  try {
    const session = await auth();

    if (!session) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    const validated = blogSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        message: 'validation error',
        inputs: formData,
      };
    }

    const existingBlogSlug = await db.post.findUnique({
      where: {
        slug: formData.slug,
      },
    });

    if (existingBlogSlug !== null) {
      return {
        error: true,
        message: 'this slug is taken, please select different slug',
      };
    }

    const post = await db.post.create({
      data: {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        category: formData.category,
        authorId: session.user.id,
        images: formData.images,
      },
    });

    if (!post) {
      return { error: true, message: 'Failed to create the blog.' };
    }

    revalidatePath('/dashboard/blogs');

    return {
      error: false,
      message: 'blog successfully created',
      data: post,
    };
  } catch (err: unknown) {
    // if (error.code === 'P2002') {
    //   return { error: 'That slug already exists.' };
    // }

    return { error: true, message: formatError(err) };
  }

  // revalidatePath('/');
  // redirect(`/blog/${post.slug}`);
}

// !UPDATE BLOG
export async function updateBlog(data: UpdateBlogSchema & { slug: string }) {
  console.log('🚀 ~ updateBlog ~ data:', data);
  // TODO: validate the data
  try {
    const session = await auth();

    if (!session) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }
    const validated = updateBlogSchema.safeParse(data);
    console.log('🚀 ~ updateBlog ~ validated:', validated);

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        message: 'validation error',
        inputs: data,
      };
    }
    if (!data.id) throw new Error('Missing post ID');

    const existingBlog = await db.post.findUnique({
      where: {
        id: data.id,
      },
      select: { images: true },
    });
    console.log('🚀 ~ updateBlog ~ existingBlog:', existingBlog);

    if (!existingBlog) {
      return {
        error: true,
        message: 'blog not found',
      };
    }

    // Extract new images from validated data
    // const newImages = validated.images?.map((img) => img.src) || [];

    // Get existing images (assuming they're stored as array of strings)
    const existingImages = existingBlog.images;
    console.log('🚀 ~ updateBlog ~ existingImages:', existingImages);
    // Merge existing and new images, removing duplicates
    // const mergedImages = [...new Set([...existingImages, ...newImages])];

    // Get new images from the validated data
    const newImages = validated.data.images || [];
    const imagesToSave = newImages;
    const { slug, comments, id, ...updateData } = validated.data;

    const uniqueImg = [...new Set([...existingImages, ...newImages])];
    const post = await db.post.update({
      where: { id },
      data: {
        ...updateData,
        slug,
        images: imagesToSave,
        updatedAt: new Date(),
      },
    });

    if (!post) {
      return { error: true, message: 'Failed to create the blog.' };
    }

    revalidatePath('/dashboard/blogs');
    revalidatePath(`/blog/${data.slug}`);

    return {
      error: false,
      message: 'post successfully updated',
      data: post,
    };
  } catch (err: unknown) {
    console.error(err);
    return { error: true, message: formatError(err) };
  }
}

export async function updateBlogFeatured(slug: string, featured: boolean) {
  try {
    const session = await auth();

    if (!session) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    const existingBlog = await db.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        content: true,
        images: true,
        category: true,
        // ... other required fields for your BlogSchema
      },
    });

    if (!existingBlog) {
      return {
        error: true,
        message: 'blog not found',
      };
    }

    // Use your existing updateBlog function with the featured status
    const result = await updateBlog({
      ...existingBlog,
      slug,
      featured,
    });

    return result;
  } catch (err: unknown) {
    return { error: true, message: formatError(err) };
  }
}

// !GET BLOGS BY USERID
export const getBlogsByUserId = async (userId: string) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const blogs = await db.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: true,
        reactions: true,
      },
    });
    if (!blogs) {
      return {
        error: true,
        message: `no blog was found under the userId: ${session.user.id}`,
      };
    }

    return {
      error: false,
      message: 'Successfully fetch blogs',
      data: blogs,
    };
  } catch (err: unknown) {
    return { error: true, message: formatError(err) };
  }
};
// !GET BLOGS BY current auth USER
export const getBlogsByAuthUser = async () => {
  try {
    const userId = await getAuthUserId();

    const blogs = await db.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true,
        reactions: true,
        comments: true,
      },
    });
    if (!blogs) {
      return {
        error: true,
        message: `no blog was found under the userId: ${userId}`,
      };
    }

    return {
      error: false,
      message: 'Successfully fetch blogs',
      data: blogs,
    };
  } catch (err: unknown) {
    return { error: true, message: formatError(err) };
  }
};

// export const getAllBlogs = async ({
//   query,
//   slug,
//   category,
//   limit = PAGE_SIZE,
//   sort,
//   page,
// }: {
//   query?: string;
//   slug?: string;
//   category?: string;
//   limit?: number;
//   sort?: string;
//   page: number;
// }) => {
//   // QUERY FILTER
//   const queryFilter: Prisma.PostWhereInput =
//     query && query !== 'all'
//       ? {
//           content: {
//             contains: query,
//             mode: 'insensitive',
//           } as Prisma.StringFilter,
//         }
//       : {};
//   // CATEGORY FILTER
//   const categoryFilter: Prisma.PostWhereInput =
//     category && category !== 'all' ? { category } : {};
//   // SLUG FILTER
//   const slugFilter: Prisma.PostWhereInput =
//     slug && slug !== 'all' ? { slug } : {};

//   try {
//     const blogs = await db.post.findMany({
//       orderBy: { createdAt: 'desc' },
//       where: {
//         ...queryFilter,
//         ...categoryFilter,
//         ...slugFilter,
//       },
//       include: {
//         author: true,
//         comments: true,
//         reactions: true,
//       },
//       skip: (page - 1) * limit,
//       take: limit,
//     });
//     if (!blogs) {
//       return {
//         error: true,
//         message: 'No post was found',
//       };
//     }
//     return {
//       error: false,
//       message: 'successfully fetch posts',
//       data: blogs,
//     };
//   } catch (err: unknown) {
//     return {
//       error: true,
//       message: formatError(err),
//     };
//   }
// };

export const getAllBlogs = async ({
  query,
  slug,
  category,
  limit = PAGE_SIZE,
  sort,
  page,
}: {
  query?: string; // Made optional
  slug?: string; // Made optional
  category?: string;
  limit?: number;
  sort?: string;
  page: number;
}) => {
  // QUERY FILTER - Search in title and content
  const queryFilter: Prisma.PostWhereInput =
    query && query !== 'all' && query.trim()
      ? {
          OR: [
            {
              title: {
                contains: query.trim(),
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
            {
              content: {
                contains: query.trim(),
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
          ],
        }
      : {};

  // CATEGORY FILTER
  const categoryFilter: Prisma.PostWhereInput =
    category && category !== 'all' ? { category } : {};

  // SLUG FILTER - Fixed: Use contains instead of exact match
  const slugFilter: Prisma.PostWhereInput =
    slug && slug !== 'all' && slug.trim()
      ? {
          slug: {
            contains: slug.trim(),
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  // SORT FILTER
  const getSortOrder = (sort?: string) => {
    switch (sort) {
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'relevance':
        return { reactions: { _count: 'desc' as const } };
      case 'newest':
      default:
        return { createdAt: 'desc' as const };
    }
  };

  try {
    // Get total count for pagination
    const totalCount = await db.post.count({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...slugFilter,
      },
    });

    const blogs = await db.post.findMany({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...slugFilter,
      },
      orderBy: getSortOrder(sort),
      include: {
        author: true,
        comments: true,
        reactions: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      error: false,
      message: 'Successfully fetched posts',
      data: blogs,
      // pagination: {
      //   total: totalCount,
      //   page,
      //   pages: Math.ceil(totalCount / limit),
      //   hasMore: page * limit < totalCount,
      // },
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (err: unknown) {
    console.error('Error in getAllBlogs:', err);
    return {
      error: true,
      message: formatError(err),
    };
  }
};
export const getAllBlogsData = async () => {
  // QUERY FILTER - Search in title and content

  try {
    // Get total count for pagination

    const blogs = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        comments: true,
        reactions: true,
      },
    });

    return {
      error: false,
      message: 'Successfully fetched posts',
      data: blogs,
    };
  } catch (err: unknown) {
    console.error('Error in getAllBlogs:', err);
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// ?GET BLOG BY SLUG
export const getBlogBySlug = async (slug: string) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }
    const blog = await db.post.findUnique({
      where: { slug: slug },
      include: {
        comments: true,
        author: true,
        reactions: true,
      },
    });
    if (!blog) {
      return {
        error: true,
        message: 'No post was found',
      };
    }
    return {
      error: false,
      message: 'successfully fetch posts',
      data: blog,
    };
  } catch (err: unknown) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// !DELETE IMAGE SERVER ACTION
export async function deleteImageServerAction(
  imageUrl: string,
  slug: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session) {
      return { error: true, message: 'unauthorized' };
    }

    const key = imageUrl.split('/').pop();
    if (!key) return;

    return await db.$transaction(async (tx) => {
      const currentBlog = await db.post.findUnique({
        where: { slug },
      });

      if (!currentBlog) {
        return {
          error: true,
          message: 'Blog not found',
        };
      }
      // Helper function to escape special regex characters
      function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      const imgPattern = new RegExp(
        `<img[^>]*?data-image-id=["']${escapeRegExp(key)}["'][^>]*?(?:\\/?>|>[^<]*?<\\/img>)`,
        'gi'
      );
      if (currentBlog.images.length > 0) {
        const fileKey = currentBlog.images.map(async (url) => {
          const key = url.split('/').pop();
          if (!key) return;
          return await utapi.deleteFiles(key);
        });
      }

      const updatedContent = content.replace(imgPattern, '');
      const updatedImg = currentBlog.images.filter((img) => img !== imageUrl);
      await db.post.update({
        where: { slug },
        data: {
          content: updatedContent,
          images: updatedImg,
        },
      });

      await utapi.deleteFiles(key);
      return { error: false, message: 'Image deleted successfully.' };
    });
  } catch (error) {
    console.error('❌ UploadThing deletion failed:', error);
    return { success: false, error: 'Deletion failed.' };
  }
}

// !DELETE BLOG BY SLUG
export const deleteBlogBySlug = async (slug: string) => {
  try {
    const session = await auth();
    const admin = session?.user.role === 'ADMIN';
    if (!session) {
      return { error: true, message: 'Unauthorized' };
    }

    const result = await db.$transaction(async (tx) => {
      // Query by slug, not id
      const existingBlog = await tx.post.findUnique({
        where: { slug }, // Fix: Use slug instead of id
        include: { comments: true },
      });

      if (!existingBlog) {
        return { error: true, message: 'No post found' };
      }

      // Fix: Allow admins to delete any blog, or author to delete their own
      if (existingBlog.authorId !== session.user.id && !admin) {
        return {
          error: true,
          message: 'You are not authorized to delete this blog',
        };
      }

      // Await image deletions
      if (existingBlog.images?.length > 0) {
        const fileKeys = existingBlog.images
          .map((url) => url.split('/').pop())
          .filter((key): key is string => !!key); // Type guard to filter out undefined
        if (fileKeys.length > 0) {
          await utapi.deleteFiles(fileKeys); // Delete all files at once
        }
      }

      // Delete related likes
      await tx.like.deleteMany({
        where: { postId: existingBlog.id },
      });

      // Delete related comments
      if (existingBlog.comments.length > 0) {
        await tx.comment.deleteMany({
          where: { postId: existingBlog.id },
        });
      }

      // Delete the post
      await tx.post.delete({
        where: { slug }, // Fix: Use slug
      });

      return { error: false, message: 'Post successfully deleted' };
    });

    // Check transaction result before revalidating
    if (result.error) {
      return result; // Propagate error (e.g., no post found, unauthorized)
    }

    revalidatePath('/dashboard/blogs');
    return { error: false, message: 'Post successfully deleted' };
  } catch (error) {
    console.error('❌ Blog deletion failed:', error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
};
// export const reactToPost = async (
//   userId: string,
//   postId: string,
//   type: 'LIKE' | 'DISLIKE'
// ) => {
//   // Upsert reaction (update if exists, otherwise create)
//   return await db.reaction.upsert({
//     where: {
//       userId_postId: { userId, postId },
//     },
//     create: { userId, postId, type },
//     update: { type },
//   });
// };

export const getPostReactions = async (postId: string) => {
  return await db.reaction.groupBy({
    by: ['type'],
    where: { postId },
    _count: { _all: true },
  });
};

export const deleteBlogBySlugSimple = async (slug: string) => {
  try {
    const userId = await getAuthUserId();

    const blog = await db.post.findUnique({
      where: { slug },
      include: {
        comments: true,
      },
    });

    if (!blog) {
      return {
        error: true,
        message: 'Blog not found',
      };
    }

    if (blog.authorId !== userId) {
      return {
        error: true,
        message: 'You are not authorized to delete this blog',
      };
    }

    // Simple approach: Delete in specific order
    await db.$transaction(async (tx) => {
      // 1. Delete all likes related to this post
      await tx.like.deleteMany({
        where: { postId: blog.id },
      });

      // 2. Delete all reactions related to comments and post
      await tx.reaction.deleteMany({
        where: {
          OR: [{ postId: blog.id }, { comment: { postId: blog.id } }],
        },
      });

      // 3. Delete all comments (Prisma will handle the self-referencing relation)
      // Delete child comments first by ordering
      const comments = await tx.comment.findMany({
        where: { postId: blog.id },
        orderBy: { createdAt: 'desc' }, // Assuming newer comments are more likely to be children
      });

      // Delete comments one by one, starting with those that have no children
      for (const comment of comments) {
        try {
          await tx.comment.delete({
            where: { id: comment.id },
          });
        } catch (error) {
          // If deletion fails due to children, we'll try again in next iteration
          console.log(`Skipping comment ${comment.id} for now`);
        }
      }

      // Try to delete any remaining comments
      await tx.comment.deleteMany({
        where: { postId: blog.id },
      });

      // 4. Finally delete the post
      await tx.post.delete({
        where: { id: blog.id },
      });
    });

    revalidatePath('/dashboard/blogs');
    revalidatePath('/blogs');

    return {
      error: false,
      message: `Successfully deleted "${blog.title}"`,
    };
  } catch (err) {
    console.error('Delete blog error:', err);
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export async function getFeaturedBlogs() {
  try {
    const blogs = await db.post.findMany({
      where: {
        featured: true,
      },
      include: {
        author: true,
        reactions: true,
        comments: true,
      },
    });
    if (!blogs) {
      return {
        error: true,
        message: 'Blog not found',
      };
    }
    return {
      error: false,
      message: 'successfully fetch posts',
      data: blogs,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
