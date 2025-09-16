import TransactionItem from '@/components/expense/transaction-item';
import TransactionSummaryItem from '@/components/expense/transaction-summary-item';
import Trend from '@/components/expense/trend';
import { Button, Separator } from '@/components/ui';
import { PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

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
    <>
      {/* <div className='flex flex-col space-y-2 pt-16'>
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

        <RenderedContent content={cont} />
        <CodeBlockEditor />
      </div> */}
      <div className='w-full pt-16'>
        <section className='mb-8'>
          <h1 className='text-2xl font-semibold'>Summary</h1>
        </section>
        <section className='mb-8 grid grid-cols-2 gap-8 lg:grid-cols-4'>
          <h1 className='text-2xl font-semibold'>Summary</h1>
        </section>
        <section className='mb-8 flex items-center justify-between'>
          <h1 className='text-2xl font-semibold'>Transactions</h1>

          <Button asChild variant={'outline'}>
            <Link
              href={'/dashboard/expense/add'}
              className='flex items-center space-x-1'
            >
              <PlusCircle className='h-4 w-4' /> <div>Add</div>
            </Link>
          </Button>
        </section>

        <div className='m-auto flex max-w-xl flex-col'>
          <h2 className='mb-4 font-mono text-lg'>Trend</h2>
          <Separator
            className='my-4 h-1 border-t-gray-300 border-b-gray-300'
            decorative
          />
          <div className='flex space-x-8'>
            <Trend type='INCOME' amount={10000} prevAmount={500} />
            <Trend type='EXPENSE' amount={5000} prevAmount={7000} />
            <Trend type='INVESTMENT' amount={3000} prevAmount={500} />
            <Trend type='SAVING' amount={2000} prevAmount={5000} />
          </div>
        </div>
        <div className='m-auto flex max-w-xl flex-col'>
          <h2 className='mb-4 font-mono text-lg'>Transaction Item</h2>
          <Separator
            className='my-4 h-1 border-t-gray-300 border-b-gray-300'
            decorative
          />
          <div className='flex flex-col space-y-4'>
            <TransactionItem
              type='INCOME'
              amount={10000}
              description='Salary'
            />
            <TransactionItem
              type='EXPENSE'
              amount={5000}
              description='Going out to eat'
              category='Food'
            />
            <TransactionItem
              type='INVESTMENT'
              amount={3000}
              description='In Microsoft'
            />
            <TransactionItem
              type='SAVING'
              amount={2000}
              description='For children'
            />
          </div>
        </div>
        <div className='m-auto flex max-w-xl flex-col'>
          <h2 className='mb-4 font-mono text-lg'>Transaction Summary Item</h2>
          <Separator
            className='my-4 h-1 border-t-gray-300 border-b-gray-300'
            decorative
          />
          <div className='flex flex-col space-y-4'>
            <TransactionSummaryItem date='2024-05-01' amount={3500} />
            <Separator
              className='h-1 border-t-gray-300 border-b-gray-300 p-0'
              decorative
            />
            <TransactionItem
              type='INCOME'
              amount={10000}
              description='Salary'
            />
            <TransactionItem
              type='EXPENSE'
              amount={5000}
              description='Going out to eat'
              category='Food'
            />
            <TransactionItem
              type='INVESTMENT'
              amount={3000}
              description='In Microsoft'
            />
            <TransactionItem
              type='SAVING'
              amount={2000}
              description='For children'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PgPage;
