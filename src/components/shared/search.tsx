import { useCallback, useEffect, useState } from 'react';

import { Button, InputCustom } from '@/components/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { RotateCcw, SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SearchProps = unknown;

const Search = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const createUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if (!updates.page) {
        params.delete('page');
      }

      return `/search?${params.toString()}`;
    },
    [searchParams]
  );

  // useEffect(() => {
  //   if (debouncedQuery !== q) {
  //     const newUrl = createUrl({ q: debouncedQuery });

  //     router.replace(newUrl);
  //   }
  // }, [debouncedQuery, q, createUrl, router]);

  const handleQueryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     const newUrl = createUrl({ q: query });
  //     router.push(newUrl);
  //   }
  // };

  const handleSearchClick = () => {
    const newUrl = createUrl({ q: query });
    router.push(newUrl);
  };

  // const handleCategoryClick = (categoryValue: string) => {
  //   return createUrl({ category: categoryValue });
  // };

  const handleQueryReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuery('');
    const newUrl = createUrl({ q: undefined });
    router.push(newUrl);
  };

  return (
    <form action='/search' method='GET'>
      <div className='flex w-full max-w-sm items-center space-x-2'>
        <div className='relative'>
          <InputCustom
            name='q'
            type='text'
            placeholder='Search...'
            value={query}
            onChange={handleQueryInputChange}
            // onKeyDown={handleQueryKeyDown}
            // suffix={
            //   <SearchIcon
            //     size={18}
            //     className='text-muted/30 svg absolute right-2 stroke-amber-50 stroke-1'
            //   />
            // }
            className='bg-accent border-0 border-b md:w-[100px] lg:w-[200px]'
          />
        </div>
        <Button
          variant={'outline'}
          type='submit'
          className='text-xs shadow-md'
          onClick={handleSearchClick}
        >
          <SearchIcon />
        </Button>
        <Button
          variant={'outline'}
          type='submit'
          className='text-xs shadow-md'
          onClick={handleQueryReset}
        >
          <RotateCcw />
        </Button>
      </div>
    </form>
  );
};

export default Search;
