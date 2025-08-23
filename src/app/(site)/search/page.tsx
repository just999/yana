// import { getAllBlogs } from '@/actions/blog-actions';
// import SearchForm from '@/app/(site)/search/search-form';
// import Blogs from '@/components/blogs/blogs';
// import { InputCustom } from '@/components/ui';
// import { categories } from '@/lib/helpers';
// import { cn } from '@/lib/utils';
// import { Search, SearchIcon } from 'lucide-react';
// import Link from 'next/link';

// type SearchPageProps = {
//   searchParams: Promise<{
//     q?: string;
//     slug?: string;
//     category: string;
//     sort?: string;
//     page?: string;
//   }>;
// };

// const SearchPage = async ({ searchParams }: SearchPageProps) => {
//   const {
//     q = 'all',
//     slug = 'all',
//     category = 'all',
//     sort = 'newest',
//     page = '1',
//   } = await searchParams;

//   const blogs =
//     (
//       await getAllBlogs({
//         query: q,
//         slug,
//         category,
//         sort,
//         page: Number(page),
//       })
//     ).data || [];

//   console.log(q, category, sort, page);

//   //CONSTRUCT FILTER URL
//   const getFilterUrl = ({
//     c,
//     s,
//     st,
//     pg,
//   }: {
//     c?: string;
//     s?: string;
//     st?: string;
//     pg?: string;
//   }) => {
//     const params = { q, slug, category, sort, page };

//     if (c) params.category = c;
//     if (s) params.slug = s;
//     if (st) params.sort = st;
//     if (pg) params.page = pg;

//     return `/search?${new URLSearchParams(params).toString()}`;
//   };

//   return (
//     <div className='grid px-8 pt-20 md:grid-cols-5 md:gap-5'>
//       <SearchForm />
//       <div className='space-y-4 md:col-span-4'>
//         <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//           <Blogs blogs={blogs} type='guest' />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;

import { getAllBlogs } from '@/actions/blog-actions';
import SearchForm from '@/app/(site)/search/search-form';
import Blogs from '@/components/blogs/blogs';

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    slug?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const resolvedParams = await searchParams;

  const {
    q = '',
    slug = '',
    category = 'all',
    sort = 'newest',
    page = '1',
  } = resolvedParams;

  // Debug logging

  // Call getAllBlogs with proper parameters
  const blogsResult = await getAllBlogs({
    query: q || 'all', // Don't pass empty string, pass
    slug: slug || 'all', // Don't pass empty string, pass undefined
    category: category === 'all' ? undefined : category,
    sort,
    page: Number(page),
  });

  const blogs = blogsResult?.data || [];

  return (
    <div className='mx-auto grid max-w-6xl px-8 py-20 md:grid-cols-5 md:gap-5'>
      <SearchForm blogs={blogs} />
      <div className='space-y-4 md:col-span-4'>
        <div className='mb-4'>
          <p className='text-sm text-gray-600'>
            Found {blogs.length} result{blogs.length !== 1 ? 's' : ''}
            {slug && ` for slug containing "${slug}"`}
            {category && category !== 'all' && ` in ${category}`}
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Blogs blogs={blogs} type='guest' />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
