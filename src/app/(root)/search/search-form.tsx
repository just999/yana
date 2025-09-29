// 'use client';

// import { useCallback, useEffect, useState } from 'react';

// import { InputCustom } from '@/components/ui';
// import { categories } from '@/lib/helpers';
// import { cn } from '@/lib/utils';
// import { SearchIcon } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// type SearchFormProps = {
//   getFilterUrl?: () => void;
// };

// const SearchForm = ({ getFilterUrl }: SearchFormProps) => {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const q = searchParams.get('q');
//   const category = searchParams.get('category') ?? 'all';
//   const slug = searchParams.get('slug');
//   const sort = searchParams.get('sort');
//   const page = searchParams.get('page');

//   // Local state for slug input
//   const [slugInput, setSlugInput] = useState(slug || '');

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams.toString());

//       if (value === 'all' || value === '') {
//         params.delete(name); // Remove parameter for 'all' or empty values
//       } else {
//         params.set(name, value);
//       }

//       return `/search?${params.toString()}`;
//     },
//     [searchParams]
//   );

//   // Handle slug search with debouncing
//   const handleSlugSearch = useCallback(
//     (value: string) => {
//       const params = new URLSearchParams(searchParams.toString());

//       if (value.trim()) {
//         params.set('slug', value.trim());
//       } else {
//         params.delete('slug');
//       }

//       // Reset to page 1 when filtering
//       params.delete('page');

//       router.push(`/search?${params.toString()}`);
//     },
//     [searchParams, router]
//   );

//   // Debounced search effect - triggers search after user stops typing
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (slugInput !== (slug || '')) {
//         handleSlugSearch(slugInput);
//       }
//     }, 300); // 300ms delay

//     return () => clearTimeout(timeoutId);
//   }, [slugInput, slug, handleSlugSearch]);

//   // Handle input change
//   const handleSlugInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSlugInput(e.target.value);
//   };

//   // Handle Enter key press (immediate search)
//   const handleSlugKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSlugSearch(slugInput);
//     }
//   };

//   // Handle search icon click (immediate search)
//   const handleSearchClick = () => {
//     handleSlugSearch(slugInput);
//   };

//   return (
//     <div className='filter-links max-w-40'>
//       <div className='mt-3 mb-2 text-lg'>Category</div>
//       <div className='bg-accent rounded-lg p-2 pb-4'>
//         <ul className='space-y-1 text-xs'>
//           <li>
//             <Link
//               href={createQueryString('category', 'all')}
//               className={cn(
//                 (category === 'all' || category === '') && 'font-bold'
//               )}
//             >
//               Any
//             </Link>
//           </li>
//           {categories.map((x) => (
//             <li key={x.name}>
//               <Link
//                 className={cn(
//                   'text-xs',
//                   category === x.name && 'font-bold text-blue-400 underline'
//                 )}
//                 href={createQueryString('category', x.name)}
//               >
//                 {x.name}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className='mt-3 mb-2 text-lg'>Slug</div>
//       <div>
//         <ul className='space-y-1'>
//           <li>
//             <Link
//               href={createQueryString('slug', 'all')}
//               className={cn((!slug || slug === '') && 'font-bold')}
//             >
//               Any
//             </Link>
//           </li>
//           <li className='relative'>
//             <InputCustom
//               name='slug'
//               className='border-0 border-b pr-8 pb-0'
//               placeholder='search slug...'
//               value={slugInput}
//               onChange={handleSlugInputChange}
//               onKeyDown={handleSlugKeyDown}
//             />
//             <SearchIcon
//               size={18}
//               className='text-muted svg absolute right-2 bottom-1 cursor-pointer stroke-amber-50 stroke-1 transition-colors hover:stroke-amber-200'
//               onClick={handleSearchClick}
//             />
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default SearchForm;
// 'use client';

// import { useCallback, useEffect, useState } from 'react';

// import { InputCustom } from '@/components/ui';
// import { useDebounce } from '@/hooks/use-debounce';
// import { categories } from '@/lib/helpers';
// import { cn } from '@/lib/utils';
// import { SearchIcon } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// type SearchFormProps = {
//   // Remove getFilterUrl prop since we'll handle URL building in the client
// };

// const SearchForm = () => {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const q = searchParams.get('q');
//   const category = searchParams.get('category') ?? 'all';
//   const slug = searchParams.get('slug') ?? 'all';
//   const sort = searchParams.get('sort');
//   const page = searchParams.get('page');
//   const router = useRouter();
//   // Local state for slug input
//   const [searchTerm, setSearchTerm] = useState({
//     query: q ?? 'all',
//     category: category ?? 'all',
//     slug: slug ?? 'all',
//     sort: sort ?? 'newest',
//     page: page ?? '1',
//   });
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);
//   // Update local state when URL changes
//   useEffect(() => {
//     setSearchTerm((prev) => ({
//       ...prev,
//       searchTerm,
//     }));
//   }, [slug]);

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams.toString());

//       // if (value === 'all' || value === '') {
//       //   params.delete(name); // Remove parameter for 'all' or empty values
//       // } else {
//       //   params.set(name, value);
//       // }

//       if (debouncedSearchTerm) {
//         params.set(name, debouncedSearchTerm.slug);
//       } else {
//         params.delete('searchTerm');
//       }
//       // router.replace(`${pathname}?${params.toString()}`);

//       return `/search?${params.toString()}`;
//     },
//     [searchParams]
//   );

//   // Create URL for slug search
//   const createSlugUrl = useCallback(
//     (slugValue: string) => {
//       const params = new URLSearchParams(searchParams.toString());

//       if (slugValue.trim()) {
//         params.set('slug', slugValue.trim());
//       } else {
//         params.delete('slug');
//       }

//       // Reset to page 1 when filtering
//       params.delete('page');

//       return `/search?${params.toString()}`;
//     },
//     [searchParams]
//   );

//   // Handle input change
//   const handleSlugInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setSearchTerm((prev) => ({
//       ...prev,
//       [e.target.name]: newValue,
//     }));
//   };

//   // Debounced navigation effect
//   useEffect(() => {
//     const params = new URLSearchParams(searchParams);
//     const timeoutId = setTimeout(() => {
//       if (searchTerm.slug !== (slug || '')) {
//         // Use window.location for immediate navigation
//         const newUrl = createSlugUrl(searchTerm.slug);
//         window.history.pushState({}, '', newUrl);
//         // Trigger a page refresh to refetch data
//         window.location.href = newUrl;
//       }
//     }, 500); // Increased to 500ms for better UX

//     return () => clearTimeout(timeoutId);
//   }, [searchTerm, slug, createSlugUrl]);

//   // Handle Enter key press (immediate search)
//   const handleSlugKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       const newUrl = createSlugUrl(searchTerm.slug);
//       window.location.href = newUrl;
//     }
//   };

//   // Handle search icon click (immediate search)
//   const handleSearchClick = () => {
//     const newUrl = createSlugUrl(searchTerm.slug);
//     window.location.href = newUrl;
//   };

//   return (
//     <div className='filter-links max-w-40'>
//       <div className='mt-3 mb-2 text-lg'>Category</div>
//       <div className='bg-accent rounded-lg p-2 pb-4'>
//         <ul className='space-y-1 text-xs'>
//           <li>
//             <Link
//               href={createQueryString('category', 'all')}
//               className={cn(
//                 (category === 'all' || category === '') && 'font-bold'
//               )}
//             >
//               Any
//             </Link>
//           </li>
//           {categories.map((x) => (
//             <li key={x.name}>
//               <Link
//                 className={cn(
//                   'text-xs',
//                   category === x.name && 'font-bold text-blue-400 underline'
//                 )}
//                 href={createQueryString('category', x.name)}
//               >
//                 {x.name}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className='mt-3 mb-2 text-lg'>Slug</div>
//       <div>
//         <ul className='space-y-1'>
//           <li>
//             <Link
//               href={createQueryString('slug', 'all')}
//               className={cn('font-bold')}
//             >
//               reset
//             </Link>
//           </li>
//           <li className='relative'>
//             <InputCustom
//               name='slug'
//               className='border-0 border-b pr-8 pb-0'
//               placeholder='search slug...'
//               value={searchTerm.slug}
//               onChange={handleSlugInputChange}
//               onKeyDown={handleSlugKeyDown}
//             />
//             <SearchIcon
//               size={18}
//               className='text-muted svg absolute right-2 bottom-1 cursor-pointer stroke-amber-50 stroke-1 transition-colors hover:stroke-amber-200'
//               onClick={handleSearchClick}
//             />
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default SearchForm;

'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  InputCustom,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { categories, orderFilter } from '@/lib/helpers';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RotateCcw, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SearchForm = {
  blogs: PostProps[];
};

const SearchForm = ({ blogs }: SearchForm) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') || 'all';
  const category = searchParams.get('category') || 'all';
  const slug = searchParams.get('slug') || '';
  const sort = searchParams.get('sort') || 'all';
  const page = searchParams.get('page') || '1';

  // Local state for slug input only
  const [slugInput, setSlugInput] = useState(slug);

  // Debounce the slug input
  const debouncedSlug = useDebounce(slugInput, 300);

  // Update local state when URL slug changes (from external navigation)
  useEffect(() => {
    setSlugInput(slug);
  }, [slug]);

  // Helper function to create URLs
  const createUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset page when filtering (except when updating page itself)
      if (!updates.page) {
        params.delete('page');
      }

      return `/search?${params.toString()}`;
    },
    [searchParams]
  );

  // Debounced navigation effect - NO PAGE RELOAD
  useEffect(() => {
    if (debouncedSlug !== slug) {
      const newUrl = createUrl({ slug: debouncedSlug });

      // Use router.replace for smooth navigation without page reload
      router.replace(newUrl);
    }
  }, [debouncedSlug, slug, createUrl, router]);

  // Handle slug input change
  const handleSlugInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugInput(e.target.value);
  };

  // Handle Enter key press (immediate search)
  const handleSlugKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newUrl = createUrl({ slug: slugInput });
      router.push(newUrl);
    }
  };

  // Handle search icon click (immediate search)
  const handleSearchClick = () => {
    const newUrl = createUrl({ slug: slugInput });
    router.push(newUrl);
  };

  // Handle category links
  const handleCategoryClick = (categoryValue: string) => {
    return createUrl({ category: categoryValue });
  };
  // Handle sort links
  const handleSortClick = (sortValue: string) => {
    return createUrl({ sort: sortValue });
  };

  // Handle slug reset
  const handleSlugReset = () => {
    setSlugInput('');
    const newUrl = createUrl({ slug: undefined });
    router.push(newUrl);
  };

  return (
    <div className='filter-links max-w-40'>
      <div>
        <div className='mt-3 mb-2 text-lg underline'>Category</div>
        <div className='bg-accent rounded-lg p-2 pb-4'>
          <ul className='space-y-1 text-xs'>
            <li>
              <Link
                href={handleCategoryClick('all')}
                className={cn(
                  (category === 'all' || category === '') && 'font-bold'
                )}
              >
                Any
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.name}>
                <Link
                  className={cn(
                    'text-xs hover:text-amber-300 hover:underline',
                    category === x.name && 'font-bold text-blue-400 underline'
                  )}
                  href={handleCategoryClick(x.name)}
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className='flex items-center'>
          <div className='mt-3 mb-2 text-lg underline'>Slug</div>
          <div className='mt-3 mb-2 ml-2 text-xs'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'ghost'}
                  type='submit'
                  className='w-full border-0 text-xs shadow-md'
                  onClick={handleSlugReset}
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent data-side='top'>
                <p className='text-xs font-semibold text-stone-600'>Reset</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className='bg-accent rounded-lg p-2 pb-4'>
          <ul className='space-y-1'>
            <li className='relative'>
              <InputCustom
                name='slug'
                className='bg-accent rounded-b-none border-0 border-b-2 border-gray-400 dark:border-gray-500'
                placeholder='Search slug...'
                value={slugInput}
                onChange={handleSlugInputChange}
                onKeyDown={handleSlugKeyDown}
              />
              <SearchIcon
                size={18}
                className='text-muted svg absolute right-2 bottom-1 cursor-pointer stroke-amber-50 stroke-1 transition-colors hover:stroke-amber-200'
                onClick={handleSearchClick}
              />
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div className='mt-3 mb-2 text-lg underline'>Order</div>
        <div className='bg-accent rounded-lg p-2 pb-4'>
          <ul className='space-y-1'>
            <li>
              <Link
                href={handleSortClick('all')}
                className={cn(
                  'text-xs',
                  (sort === 'all' || sort === '') && 'font-bold'
                )}
              >
                Any
              </Link>
            </li>
            {orderFilter.map((x) => (
              <li key={x.title}>
                <Link
                  className={cn(
                    'text-xs hover:text-amber-300 hover:underline',
                    sort === x.title && 'font-bold text-blue-400 underline'
                  )}
                  href={handleSortClick(x.title)}
                >
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
