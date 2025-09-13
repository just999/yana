import type { PostProps } from '@/lib/types';

export const useSlugNavigation = (posts: PostProps[], currentSlug: string) => {
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const currentPost = posts[currentIndex] || null;

  return { previousPost, nextPost, currentPost, currentIndex };
};
