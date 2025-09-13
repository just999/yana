import { z } from 'zod';

export const imagesSchema = z.array(z.object({}));

export const commentSchema = z.object({
  comment: z.string().min(1, { message: 'must have comment' }),
});

export type CommentSchema = z.infer<typeof commentSchema>;

export const blogSchema = z.object({
  title: z.string().min(2, { message: 'must have blog title' }),
  slug: z.string().min(2, { message: 'must have blog slug' }),
  category: z.string().min(2, { message: 'must have blog category' }),
  excerpt: z.string().optional(),
  content: z.string().min(2, { message: 'must have content' }),
  images: z.array(z.string()).optional(),
  anonymous: z.boolean().optional(),
  comments: z.array(commentSchema).optional(),
  featured: z.boolean().optional(),
  // images: z.array(z.object({ src: z.string(), id: z.string() })).optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;

export const idBlogSchema = z.object({
  id: z.string().min(2, { message: 'must have blog id' }),
});

export const updateBlogSchema = blogSchema.merge(idBlogSchema);

export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;

export type BlogUpdateSchema = BlogSchema & { slug: string };
