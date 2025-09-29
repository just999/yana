import { getBlogBySlug } from '@/actions/blog-actions';
import { auth } from '@/auth';
import BackButton from '@/components/back-button';
import BlogForm from '@/components/blogs/blog-form';
import PostForm from '@/components/blogs/post-form';
import HydrateBlog from '@/lib/jotai/hydrate-blog';
import { ImageData, PostProps } from '@/lib/types';
import { extractImageUrlsServer } from '@/lib/utils';
import { Session } from 'next-auth';

type EditBlogPageProps = {
  params: Promise<{ slug: string }>;
};

const transformBlogToPost = async (rawBlog: PostProps): Promise<PostProps> => {
  const extImg = extractImageUrlsServer(rawBlog.content);
  return {
    ...rawBlog,
    images:
      JSON.stringify(extImg) === JSON.stringify(rawBlog.images)
        ? extImg.map((img) => img.src)
        : rawBlog.images,
  };
};

const transformImages = (images: string): ImageData[] | undefined => {
  if (!images) return undefined;

  if (Array.isArray(images)) {
    return images.map((image, index: number) => {
      if (typeof image === 'object' && image.id && image.src) {
        return image as ImageData;
      }

      if (typeof image === 'string') {
        return {
          id: `image-${index}`,
          src: image,
          alt: `Image ${index + 1}`,
        };
      }

      if (typeof image === 'object' && image.url) {
        return {
          id: image.id || `image-${index}`,
          src: image.url,
          alt: image.alt || `Image ${index + 1}`,
        };
      }

      return {
        id: `image-${index}`,
        src: String(image),
        alt: `Image ${index + 1}`,
      };
    });
  }

  return undefined;
};

const EditBlogPage = async ({ params }: EditBlogPageProps) => {
  const slug = (await params).slug;
  const rawBlog = (await getBlogBySlug(slug)).data;
  const session = (await auth()) as Session;
  if (!rawBlog) {
    return null;
  }

  const blog: PostProps = await transformBlogToPost(rawBlog);

  const imageDataUrl = Array.isArray(blog.images)
    ? blog.images.map((f) => (typeof f === 'string' ? f : ''))
    : [];

  const imgData: ImageData[] = Array.isArray(blog.images)
    ? blog.images.map((img: string, index: number) => {
        if (typeof img === 'string') {
          return {
            id: `image-${index}`,
            src: img,
            alt: img.split('/').pop(),
          };
        }
        return img;
      })
    : [];

  return (
    <section className='min-w-2xl py-2 pb-24'>
      <BackButton value='Back To Posts' link='/blogs' />
      <div className=''>
        <HydrateBlog
          blog={blog}
          type='update'
          imageUrl={imageDataUrl}
          imgData={imgData}
          slug={slug}
          session={session}
        >
          {/* <PostForm type='update' slug={slug} /> */}
          <BlogForm type='update' slug={slug} blog={blog} />
        </HydrateBlog>
      </div>
    </section>
  );
};

export default EditBlogPage;
