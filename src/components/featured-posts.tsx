import Blogs from '@/components/blogs/blogs';
import ViewAllBlogs from '@/components/view-all-blogs';
import { PostProps } from '@/lib/types';
import Link from 'next/link';

// This would normally come from a database or API
export const featuredPosts = [
  {
    id: 1,
    title: 'Finding My Voice After Years of Bullying',
    slug: 'test1',
    excerpt:
      'How I overcame the trauma of being bullied throughout my college years and found the strength to speak up.',
    author: {
      name: 'Alex Johnson',
      avatar: 'AJ',
    },
    date: 'May 15, 2025',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    categories: ['Personal Growth', 'Bullying'],
  },
  {
    id: 2,
    title: 'Resources That Helped Me Heal',
    slug: 'test2',
    excerpt:
      'A compilation of books, podcasts, and campus resources that supported my healing journey.',
    author: {
      name: 'Sam Rivera',
      avatar: 'SR',
    },
    date: 'April 28, 2025',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg',
    categories: ['Resources', 'Healing'],
  },
  {
    id: 3,
    title: 'How to Report Harassment at Your College',
    slug: 'test3',
    excerpt:
      'A step-by-step guide to navigating the reporting process at most universities, with tips from experience.',
    author: {
      name: 'Jordan Lee',
      avatar: 'JL',
    },
    date: 'April 10, 2025',
    readTime: '10 min read',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    categories: ['Guides', 'Advocacy'],
  },
];

type FeaturedPostsProps = {
  featuredBlogs?: PostProps[];
};

export function FeaturedPosts({ featuredBlogs }: FeaturedPostsProps) {
  return (
    <section className='container px-4 py-12 md:px-6'>
      <div className='mb-8 flex flex-col items-start justify-between md:flex-row md:items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tighter sm:text-3xl'>
            Featured Stories
          </h2>
          <p className='text-muted-foreground mt-2'>
            Read about experiences and insights from our community members
          </p>
        </div>
        <Link
          href='/blogs'
          className='text-primary mt-4 font-medium hover:underline md:mt-0'
        >
          View all posts →
        </Link>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {/* {featuredBlogs.map((post) => (
          <Card key={post.id} className='group overflow-hidden'>
            <div className='relative h-48 overflow-hidden'>
              <Image
                src={post.image}
                alt={post.title}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
              />
            </div>
            <CardHeader className='p-4'>
              <div className='mb-2 flex flex-wrap gap-2'>
                {post.categories.map((category) => (
                  <Badge
                    key={category}
                    variant='secondary'
                    className='font-normal'
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <CardTitle className='hover:text-primary line-clamp-2 transition-colors'>
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription className='mt-2 line-clamp-2'>
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardFooter className='flex items-center justify-between p-4 pt-0'>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={`/avatars/${post.author.avatar.toLowerCase()}.jpg`}
                  />
                  <AvatarFallback>{post.author.avatar}</AvatarFallback>
                </Avatar>
                <div className='text-sm'>
                  <p className='leading-none font-medium'>{post.author.name}</p>
                  <p className='text-muted-foreground text-xs'>{post.date}</p>
                </div>
              </div>
              <span className='text-muted-foreground text-xs'>
                {post.readTime}
              </span>
            </CardFooter>
          </Card>

          <BlogCard post={post} key={post.id} /> */}
        <Blogs blogs={featuredBlogs || []} type='guest' />

        {/* ))} */}
      </div>
      <ViewAllBlogs />
    </section>
  );
}
