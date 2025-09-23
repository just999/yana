import SkeletonCustom from '@/components/skeleton-custom';
import { Separator } from '@/components/ui';
import type { Metadata } from 'next';

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

export const metadata: Metadata = {
  title: 'Playground',
  description: 'playground',
};

type PgPageProps = unknown;

// function AsyncComp() {
//   const [joke, setJoke] = useAtom(jokeObjAtom);
//   const { data: session } = useSession();

//   const role = session?.user.role;

//   const router = useRouter();

//   if (role !== 'ADMIN') {
//     router.push('/');
//   }

//   return (
//     <div className='pt-16'>
//       <h3>{joke.setup}</h3>
//       <p>{joke.punchline}</p>
//       <Button
//         type='button'
//         onClick={() =>
//           setJoke('https://official-joke-api.appspot.com/random_joke')
//         }
//       >
//         Generate
//       </Button>
//       {/* <YouTubeStyleComment /> */}
//       <App />
//     </div>
//   );
// }

const PgPage = () => {
  // const htmlContent = useMemo(() => jsonToHtml(cont), []);

  // const codeNode = cont.content.find((node: any) => node.type === 'codeBlock');
  return (
    <div>
      <h2 className='mb-4 pt-16 font-mono text-lg'>Loading Skeleton</h2>
      <Separator />
      <div className='space-y-8'>
        <div className='flex space-x-4'>
          <SkeletonCustom />
          <SkeletonCustom />
          <SkeletonCustom />
        </div>

        <div className='space-y-4'>
          <SkeletonCustom />
          <SkeletonCustom />
          <SkeletonCustom />
        </div>
      </div>
    </div>
  );
};

export default PgPage;
