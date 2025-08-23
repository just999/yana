import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { BookOpen, Compass, Phone, Shield } from 'lucide-react';
import Link from 'next/link';

const resources = [
  {
    title: 'Campus Resources',
    description: 'Guides to finding support services at your university',
    icon: <Compass className='text-primary h-10 w-10' />,
    link: '/resources/campus',
  },
  {
    title: 'Self-Help Materials',
    description: 'Books, articles, and worksheets for your healing journey',
    icon: <BookOpen className='text-primary h-10 w-10' />,
    link: '/resources/self-help',
  },
  {
    title: 'Crisis Lines',
    description: 'Immediate support when you need someone to talk to',
    icon: <Phone className='text-primary h-10 w-10' />,
    link: '/resources/crisis',
  },
  {
    title: 'Legal Information',
    description: 'Understanding your rights and options',
    icon: <Shield className='text-primary h-10 w-10' />,
    link: '/resources/legal',
  },
];

export function ResourcesSection() {
  return (
    <section className='bg-muted/50 py-16'>
      <div className='container px-4 md:px-6'>
        <div className='mb-10 text-center'>
          <h2 className='mb-2 text-2xl font-bold tracking-tighter sm:text-3xl'>
            Helpful Resources
          </h2>
          <p className='text-muted-foreground mx-auto max-w-[700px]'>
            Access guides, tools, and support services to help navigate
            challenging situations
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {resources.map((resource) => (
            <Card
              key={resource.title}
              className='text-center transition-shadow hover:shadow-md'
            >
              <CardHeader className='pb-2'>
                <div className='mx-auto mb-4'>{resource.icon}</div>
                <CardTitle>{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{resource.description}</CardDescription>
              </CardContent>
              <CardFooter className='flex justify-center pt-0'>
                <Button variant='link' asChild>
                  <Link href={resource.link}>Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className='mt-12 text-center'>
          <Button asChild>
            <Link href='/resources'>View All Resources</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
