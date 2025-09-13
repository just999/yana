'use client';

import { Suspense, useMemo } from 'react';

import TestComponent from '@/app/(site)/playground/test-component';
import App from '@/app/(site)/playground/youtube-comment-reaction';
import YouTubeStyleComment from '@/app/(site)/playground/youtube-style-comment';
import { Button } from '@/components/ui';
import { jokeObjAtom } from '@/lib/jotai/atoms';
import { jsonToHtml } from '@/lib/json-to-html';
import { useAtom } from 'jotai';
import { Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Area from './area';
import CodeBlockComponent from './code-block-editor';
import CodeBlockEditor from './code-block-editor';
import InputForm from './input-form';
import Perimeter from './perimeter';
import RenderedContent from './rendered-content';
import Volume from './volume';

const data = [
  {
    id: '1',
    author: 'John Doe',
    avatar: '/api/placeholder/32/32',
    content: 'This is a great video! Thanks for sharing.',
    timestamp: '2 hours ago',
    likes: 15,
  },
  {
    id: '2',
    author: 'Jane Smith',
    avatar: '/api/placeholder/32/32',
    content: 'Really helpful tutorial. I learned a lot from this.',
    timestamp: '5 hours ago',
    likes: 8,
  },
];

type PgPageProps = unknown;

function AsyncComp() {
  const [joke, setJoke] = useAtom(jokeObjAtom);
  const { data: session } = useSession();

  const role = session?.user.role;

  const router = useRouter();

  if (role !== 'ADMIN') {
    router.push('/');
  }

  return (
    <div className='pt-16'>
      <h3>{joke.setup}</h3>
      <p>{joke.punchline}</p>
      <Button
        type='button'
        onClick={() =>
          setJoke('https://official-joke-api.appspot.com/random_joke')
        }
      >
        Generate
      </Button>
      {/* <YouTubeStyleComment /> */}
      <App />
    </div>
  );
}

const PgPage = () => {
  // const htmlContent = useMemo(() => jsonToHtml(cont), []);

  // const codeNode = cont.content.find((node: any) => node.type === 'codeBlock');
  return (
    <>
      <div className='flex flex-col space-y-2 pt-16'>
        <Suspense
          fallback={
            <span>
              <Loader className='animate-spin' />
              ...
            </span>
          }
        >
          <AsyncComp />
          <TestComponent />
        </Suspense>
        <div>
          <InputForm />
        </div>
        <div>
          <Area />
          <Perimeter />
          <Volume />
        </div>

        {/* <RenderedContent content={cont} /> */}
        <CodeBlockEditor />
      </div>
    </>
  );
};

export default PgPage;
