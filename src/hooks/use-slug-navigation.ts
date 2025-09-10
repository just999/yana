import type { PostProps } from '@/lib/types';

export const useSlugNavigation = (posts: PostProps[], currentSlug: string) => {
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);
  console.log('🚀 ~ useSlugNavigation ~ currentIndex:', currentIndex);

  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  console.log('🚀 ~ useSlugNavigation ~ previousPost:', previousPost);
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const currentPost = posts[currentIndex] || null;

  console.log('🚀 ~ useSlugNavigation ~ currentIndex:', currentIndex);
  console.log('🚀 ~ useSlugNavigation ~ totalPosts:', posts.length);
  console.log('🚀 ~ useSlugNavigation ~ currentSlug:', currentSlug);
  console.log('🚀 ~ useSlugNavigation ~ previousPost:', previousPost);
  console.log('🚀 ~ useSlugNavigation ~ nextPost:', nextPost);

  return { previousPost, nextPost, currentPost, currentIndex };
};
