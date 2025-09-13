import { getAllBlogs, getFeaturedBlogs } from '@/actions/blog-actions';
import { auth } from '@/auth';
import { FeaturedPosts } from '@/components/featured-posts';
import { ResourcesSection } from '@/components/resources-section';
import { Button, Card, CardContent } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    slug?: string;
    category: string;
    excerpt?: string;
    sort?: string;
    page?: string;
  }>;
};
export default async function Home({ searchParams }: HomeProps) {
  const {
    q = 'all',
    slug = 'all',
    category = 'all',
    excerpt = 'all',
    sort = 'newest',
    page = '1',
  } = await searchParams;
  const session = await auth();

  const blogs = (
    await getAllBlogs({ query: q, slug, category, sort, page: Number(page) })
  ).data;

  const featuredBlogs = (await getFeaturedBlogs()).data;

  return (
    <div className='container mx-auto max-w-6xl space-y-16 px-4'>
      {/* Hero Section */}

      <section className='from-primary/10 to-background relative overflow-hidden rounded-md bg-gradient-to-b py-20 md:py-28'>
        <div className='px-4 md:px-6'>
          <div className='grid items-center gap-6 lg:grid-cols-2 lg:gap-12'>
            <div className='space-y-4'>
              <div className='bg-primary/10 text-primary inline-block rounded-lg px-3 py-1 text-sm'>
                Find Your Voice
              </div>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                A Safe Space for College Students
              </h1>
              <p className='text-muted-foreground max-w-[600px] md:text-xl'>
                Share your experiences, connect with others, and find support in
                a community that understands.
              </p>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <Button asChild size='lg'>
                  <Link href='/blogs'>Read Stories</Link>
                </Button>
                <Button variant='outline' size='lg' asChild>
                  <Link
                    href={
                      session?.user.email
                        ? '/dashboard/blogs/new-blog'
                        : '/login'
                    }
                  >
                    Share Your Story
                  </Link>
                </Button>
              </div>
            </div>
            <div className='relative h-[300px] overflow-hidden rounded-xl sm:h-[400px] lg:h-[500px]'>
              <Image
                src='/img/sad.jpg'
                alt='Students supporting each other'
                fill
                className='object-cover'
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className='container px-4 py-12 md:px-6'>
        <h2 className='mb-12 text-center text-2xl font-bold tracking-tighter sm:text-3xl'>
          Our Community Values
        </h2>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Support</h3>
                <p className='text-muted-foreground'>
                  We provide a supportive environment where everyone&apos;s
                  experiences are validated and respected.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Safety</h3>
                <p className='text-muted-foreground'>
                  Your safety and wellbeing are our top priorities in all
                  community interactions.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold'>Empowerment</h3>
                <p className='text-muted-foreground'>
                  We aim to empower each other through shared experiences and
                  collective strength.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Posts */}
      <FeaturedPosts featuredBlogs={featuredBlogs || []} />

      {/* Resources */}
      <ResourcesSection />

      {/* Call to Action */}
      <section className='bg-primary text-primary-foreground w-full pt-16 pb-20'>
        <div className='container px-4 text-center md:px-6'>
          <h2 className='mb-4 text-2xl font-bold tracking-tighter sm:text-3xl'>
            Join Our Community Today
          </h2>
          <p className='mx-auto mb-8 max-w-[600px]'>
            Connect with others who understand your experiences and start your
            healing journey.
          </p>
          <Button size='lg' variant='secondary' asChild>
            <Link href='/register'>Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
