'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Bookmark,
  Calendar,
  ChevronUp,
  Clock,
  Heart,
  Mail,
  MessageCircle,
  Share2,
  Tag,
  TrendingUp,
  User,
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

const blogPost = {
  title: 'Breaking the Silence: Understanding and Addressing School Bullying',
  subtitle:
    'A comprehensive guide for students, parents, and educators on recognizing, preventing, and responding to bullying behavior',
  author: {
    name: 'Dr. Sarah Mitchell',
    avatar:
      'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    role: 'Child Psychology Specialist',
    bio: 'Dr. Mitchell has over 15 years of experience in child psychology and anti-bullying advocacy.',
  },
  publishDate: 'November 15, 2024',
  readTime: '8 min read',
  tags: ['Bullying Prevention', 'School Safety', 'Mental Health', 'Education'],
  likes: 234,
  comments: 45,
  shares: 89,
};

const sampleComments: Comment[] = [
  {
    id: '1',
    author: 'Jessica Rodriguez',
    avatar:
      'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content:
      "This article really resonated with me. As a parent, I've seen firsthand how bullying can affect a child's confidence. The strategies mentioned here are practical and actionable.",
    timestamp: '2 hours ago',
    likes: 12,
    replies: [
      {
        id: '1-1',
        author: 'Dr. Sarah Mitchell',
        avatar:
          'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        content:
          'Thank you for sharing your experience, Jessica. Parent involvement is crucial in creating a supportive environment for children.',
        timestamp: '1 hour ago',
        likes: 8,
      },
    ],
  },
  {
    id: '2',
    author: 'Mark Thompson',
    avatar:
      'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content:
      "As an educator, I appreciate the emphasis on creating inclusive classroom environments. We've implemented several of these strategies at our school with positive results.",
    timestamp: '4 hours ago',
    likes: 18,
  },
];

const featuredPosts = [
  {
    title: "Building Resilience in Students: A Teacher's Guide",
    excerpt:
      'Practical strategies for helping students develop emotional resilience and coping skills.',
    image:
      'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    readTime: '6 min read',
    category: 'Education',
  },
  {
    title: 'The Role of Bystanders in Bullying Prevention',
    excerpt:
      'How encouraging positive bystander behavior can transform school culture.',
    image:
      'https://images.pexels.com/photos/8926548/pexels-photo-8926548.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    readTime: '5 min read',
    category: 'Prevention',
  },
  {
    title: "Supporting Children's Mental Health at Home",
    excerpt:
      'Creating a supportive home environment for children facing challenges at school.',
    image:
      'https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    readTime: '7 min read',
    category: 'Mental Health',
  },
];

const categories = [
  { name: 'Bullying Prevention', count: 24 },
  { name: 'Mental Health', count: 18 },
  { name: 'School Safety', count: 15 },
  { name: 'Education', count: 32 },
  { name: 'Parent Resources', count: 12 },
  { name: 'Teacher Training', count: 9 },
];

export const popularPosts = [
  {
    title: '10 Signs Your Child Might Be Experiencing Bullying',
    views: '12.5k views',
  },
  {
    title: 'How Schools Can Create Anti-Bullying Policies That Work',
    views: '9.2k views',
  },
  {
    title: 'CyberBullying: A Modern Challenge for Students and Parents',
    views: '8.7k views',
  },
  { title: 'Building Empathy in the Classroom', views: '7.1k views' },
  {
    title: 'Recovery and Healing After Bullying Experiences',
    views: '6.8k views',
  },
];

export default function BlogPage() {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [email, setEmail] = useState('');

  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle comment submission
    setNewComment('');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Header */}
      <header className='border-b bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='text-2xl font-bold text-blue-600'>
                SafeSchools
              </div>
              <nav className='hidden space-x-8 md:flex'>
                <a
                  href='#'
                  className='text-gray-600 transition-colors hover:text-blue-600'
                >
                  Home
                </a>
                <a
                  href='#'
                  className='text-gray-600 transition-colors hover:text-blue-600'
                >
                  Articles
                </a>
                <a
                  href='#'
                  className='text-gray-600 transition-colors hover:text-blue-600'
                >
                  Resources
                </a>
                <a
                  href='#'
                  className='text-gray-600 transition-colors hover:text-blue-600'
                >
                  About
                </a>
                <a
                  href='#'
                  className='text-gray-600 transition-colors hover:text-blue-600'
                >
                  Contact
                </a>
              </nav>
            </div>
            <Button variant='default' className='bg-blue-600 hover:bg-blue-700'>
              Get Help
            </Button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-4'>
          {/* Main Content */}
          <div className='lg:col-span-3'>
            <article className='overflow-hidden rounded-2xl bg-white shadow-lg'>
              {/* Hero Image */}
              <div className='relative h-96 overflow-hidden'>
                <img
                  src='https://images.pexels.com/photos/8926519/pexels-photo-8926519.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop'
                  alt='Students supporting each other in school hallway'
                  className='h-full w-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                <div className='absolute right-6 bottom-6 left-6'>
                  <div className='mb-4 flex flex-wrap gap-2'>
                    {blogPost.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='bg-white/90 text-gray-800'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h1 className='mb-2 text-4xl leading-tight font-bold text-white'>
                    {blogPost.title}
                  </h1>
                  <p className='text-xl leading-relaxed text-white/90'>
                    {blogPost.subtitle}
                  </p>
                </div>
              </div>

              {/* Article Meta */}
              <div className='border-b p-8'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage
                        src={blogPost.author.avatar}
                        alt={blogPost.author.name}
                      />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {blogPost.author.name}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {blogPost.author.role}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-6 text-sm text-gray-600'>
                    <div className='flex items-center space-x-1'>
                      <Calendar className='h-4 w-4' />
                      <span>{blogPost.publishDate}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <Clock className='h-4 w-4' />
                      <span>{blogPost.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className='p-8'>
                <div className='prose prose-lg max-w-none'>
                  <p className='mb-8 text-xl leading-relaxed text-gray-700'>
                    School bullying remains one of the most persistent
                    challenges facing our educational institutions today.
                    Understanding its impact and implementing effective
                    prevention strategies is crucial for creating safe,
                    supportive learning environments where every student can
                    thrive.
                  </p>

                  <h2 className='mt-12 mb-6 text-2xl font-bold text-gray-900'>
                    Understanding the Scope of the Problem
                  </h2>

                  <div className='mb-8 border-l-4 border-blue-400 bg-blue-50 p-6'>
                    <p className='font-medium text-blue-900'>
                      "According to recent studies, approximately 1 in 4
                      students report being bullied during the school year, with
                      significant impacts on their academic performance, mental
                      health, and overall well-being."
                    </p>
                  </div>

                  <p className='mb-6'>
                    Bullying takes many forms in today's schools, from
                    traditional physical and verbal harassment to more subtle
                    forms of social exclusion and CyberBullying. The digital age
                    has expanded the reach of bullying behavior beyond school
                    walls, making it a 24/7 concern for many students and
                    families.
                  </p>

                  <div className='my-8'>
                    <img
                      src='https://images.pexels.com/photos/8926557/pexels-photo-8926557.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
                      alt='Teacher facilitating a supportive classroom discussion'
                      className='w-full rounded-lg shadow-md'
                    />
                    <p className='mt-2 text-center text-sm text-gray-600'>
                      Creating inclusive classroom environments where every
                      student feels valued and heard
                    </p>
                  </div>

                  <h2 className='mt-12 mb-6 text-2xl font-bold text-gray-900'>
                    Recognition and Early Intervention
                  </h2>

                  <p className='mb-6'>
                    Early identification of bullying behavior is essential for
                    effective intervention. Warning signs may include changes in
                    academic performance, social withdrawal, unexplained
                    injuries, or reluctance to attend school. Both educators and
                    parents play crucial roles in recognizing these indicators.
                  </p>

                  <div className='my-8 grid gap-6 md:grid-cols-2'>
                    <div>
                      <img
                        src='https://images.pexels.com/photos/8926664/pexels-photo-8926664.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                        alt='Student receiving support from school counselor'
                        className='w-full rounded-lg shadow-md'
                      />
                    </div>
                    <div>
                      <img
                        src='https://images.pexels.com/photos/4260477/pexels-photo-4260477.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                        alt='Parent and child having a supportive conversation'
                        className='w-full rounded-lg shadow-md'
                      />
                    </div>
                  </div>

                  <h2 className='mt-12 mb-6 text-2xl font-bold text-gray-900'>
                    Building Supportive Communities
                  </h2>

                  <p className='mb-6'>
                    Prevention strategies must involve the entire school
                    community. This includes implementing comprehensive
                    anti-bullying policies, training staff to recognize and
                    respond to incidents, and fostering a culture of empathy and
                    inclusion among students.
                  </p>

                  <ul className='mb-6 list-inside list-disc space-y-2 text-gray-700'>
                    <li>
                      Establish clear behavioral expectations and consequences
                    </li>
                    <li>Provide regular training for staff and students</li>
                    <li>Create anonymous reporting systems</li>
                    <li>Implement peer mediation programs</li>
                    <li>
                      Engage parents and community members in prevention efforts
                    </li>
                  </ul>

                  <div className='my-8 rounded-lg border border-green-200 bg-green-50 p-6'>
                    <h3 className='mb-3 text-lg font-semibold text-green-900'>
                      Resources for Immediate Help
                    </h3>
                    <p className='mb-3 text-green-800'>
                      If you or someone you know is experiencing bullying, help
                      is available:
                    </p>
                    <ul className='space-y-1 text-green-800'>
                      <li>• National Suicide Prevention Lifeline: 988</li>
                      <li>• Crisis Text Line: Text HOME to 741741</li>
                      <li>• StopBullying.gov for comprehensive resources</li>
                    </ul>
                  </div>

                  <p className='mb-6'>
                    Creating change requires sustained effort from all
                    stakeholders. By working together, we can build school
                    environments where every student feels safe, valued, and
                    empowered to learn and grow.
                  </p>
                </div>

                {/* Article Actions */}
                <div className='flex items-center justify-between border-t pt-8'>
                  <div className='flex items-center space-x-6'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleLike}
                      className={`flex items-center space-x-2 ${liked ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      <Heart
                        className={`h-5 w-5 ${liked ? 'fill-current' : ''}`}
                      />
                      <span>{blogPost.likes + (liked ? 1 : 0)}</span>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='flex items-center space-x-2 text-gray-600'
                    >
                      <MessageCircle className='h-5 w-5' />
                      <span>{blogPost.comments}</span>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='flex items-center space-x-2 text-gray-600'
                    >
                      <Share2 className='h-5 w-5' />
                      <span>{blogPost.shares}</span>
                    </Button>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleBookmark}
                    className={`${bookmarked ? 'text-blue-600' : 'text-gray-600'}`}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`}
                    />
                  </Button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <Card className='mt-8'>
              <CardHeader>
                <CardTitle className='text-2xl'>
                  Comments ({sampleComments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className='mb-8'>
                  <Textarea
                    placeholder='Share your thoughts or experiences...'
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className='mb-4 min-h-[100px]'
                  />
                  <Button type='submit' disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </form>

                <Separator className='mb-8' />

                {/* Comments List */}
                <div className='space-y-6'>
                  {sampleComments.map((comment) => (
                    <div key={comment.id} className='space-y-4'>
                      <div className='flex space-x-4'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={comment.avatar}
                            alt={comment.author}
                          />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <div className='mb-2 flex items-center space-x-2'>
                            <span className='font-semibold text-gray-900'>
                              {comment.author}
                            </span>
                            <span className='text-sm text-gray-500'>
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className='mb-3 text-gray-700'>
                            {comment.content}
                          </p>
                          <div className='flex items-center space-x-4'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-gray-600 hover:text-red-600'
                            >
                              <Heart className='mr-1 h-4 w-4' />
                              {comment.likes}
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-gray-600'
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && (
                        <div className='ml-14 space-y-4'>
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className='flex space-x-4'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage
                                  src={reply.avatar}
                                  alt={reply.author}
                                />
                                <AvatarFallback>
                                  {reply.author[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className='flex-1'>
                                <div className='mb-2 flex items-center space-x-2'>
                                  <span className='font-semibold text-gray-900'>
                                    {reply.author}
                                  </span>
                                  <span className='text-sm text-gray-500'>
                                    {reply.timestamp}
                                  </span>
                                </div>
                                <p className='mb-3 text-gray-700'>
                                  {reply.content}
                                </p>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-gray-600 hover:text-red-600'
                                >
                                  <Heart className='mr-1 h-4 w-4' />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-8 lg:col-span-1'>
            {/* Author Bio */}
            <Card>
              <CardContent className='pt-6'>
                <div className='text-center'>
                  <Avatar className='mx-auto mb-4 h-20 w-20'>
                    <AvatarImage
                      src={blogPost.author.avatar}
                      alt={blogPost.author.name}
                    />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <h3 className='mb-1 text-lg font-semibold'>
                    {blogPost.author.name}
                  </h3>
                  <p className='mb-3 text-sm text-gray-600'>
                    {blogPost.author.role}
                  </p>
                  <p className='mb-4 text-sm text-gray-700'>
                    {blogPost.author.bio}
                  </p>
                  <Button variant='outline' size='sm' className='w-full'>
                    Follow Author
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className='bg-gradient-to-br from-blue-50 to-indigo-50'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Mail className='h-5 w-5 text-blue-600' />
                  <span>Stay Updated</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-sm text-gray-700'>
                  Get the latest articles on bullying prevention and school
                  safety delivered to your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit} className='space-y-3'>
                  <Input
                    type='email'
                    placeholder='Your email address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-700'
                  >
                    Subscribe
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Featured Posts */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <ChevronUp className='h-5 w-5 text-green-600' />
                  <span>Featured Posts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {featuredPosts.map((post, index) => (
                    <div key={index} className='group cursor-pointer'>
                      <div className='flex space-x-3'>
                        <img
                          src={post.image}
                          alt={post.title}
                          className='h-20 w-20 rounded-lg object-cover transition-opacity group-hover:opacity-90'
                        />
                        <div className='flex-1'>
                          <h4 className='mb-2 text-sm leading-tight font-semibold transition-colors group-hover:text-blue-600'>
                            {post.title}
                          </h4>
                          <p className='mb-2 line-clamp-2 text-xs text-gray-600'>
                            {post.excerpt}
                          </p>
                          <div className='flex items-center justify-between text-xs text-gray-500'>
                            <Badge variant='secondary' className='text-xs'>
                              {post.category}
                            </Badge>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <TrendingUp className='h-5 w-5 text-orange-600' />
                  <span>Most Read</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {popularPosts.map((post, index) => (
                    <div key={index} className='group cursor-pointer'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600'>
                          {index + 1}
                        </div>
                        <div className='flex-1'>
                          <h4 className='mb-1 text-sm leading-tight font-medium transition-colors group-hover:text-blue-600'>
                            {post.title}
                          </h4>
                          <p className='text-xs text-gray-500'>{post.views}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Tag className='h-5 w-5 text-purple-600' />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className='-mx-2 flex cursor-pointer items-center justify-between rounded px-2 py-2 transition-colors hover:bg-gray-50'
                    >
                      <span className='text-sm font-medium text-gray-700'>
                        {category.name}
                      </span>
                      <Badge variant='secondary' className='text-xs'>
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
