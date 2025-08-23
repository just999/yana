// import { Button, InputCustom } from '@/components/ui';
// import { ChevronDown, Filter, SearchIcon } from 'lucide-react';

// type SearchProps = unknown;

// const SearchInput = () => {
//   // const categories = await getAllCategories();

//   return (
//     <form action='/search' method='GET'>
//       <div className='flex w-full max-w-sm items-center space-x-2'>
//         <Button
//           variant={'ghost'}
//           size={'sm'}
//           type='button'
//           className='box-content px-2 dark:hover:bg-stone-900'
//         >
//           <Filter
//             size={14}
//             className='dark:hover:bg-accent/90 dark:hover:border-2'
//           />
//           <ChevronDown />
//         </Button>
//         <div className='relative'>
//           <InputCustom
//             variant='happy'
//             name='q'
//             type='text'
//             placeholder='Search...'
//             suffix={
//               <SearchIcon
//                 size={18}
//                 className='text-muted svg absolute right-2 stroke-amber-50 stroke-1'
//               />
//             }
//             className='h-8 md:w-[100px] lg:w-[200px]'
//           />
//         </div>
//         <Button
//           size='sm'
//           variant={'ghost'}
//           type='submit'
//           className='text-xs shadow-md'
//         >
//           Search
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default SearchInput;

'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge, Button, InputCustom } from '@/components/ui';
import { ChevronDown, Filter, SearchIcon, X } from 'lucide-react';

// Mock categories - replace with your actual categories
const categories = [
  { name: 'Technology', value: 'technology' },
  { name: 'Business', value: 'business' },
  { name: 'Science', value: 'science' },
  { name: 'Design', value: 'design' },
  { name: 'Marketing', value: 'marketing' },
];

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
];

const dateRanges = [
  { label: 'All time', value: 'all' },
  { label: 'Last 24 hours', value: 'day' },
  { label: 'Last week', value: 'week' },
  { label: 'Last month', value: 'month' },
  { label: 'Last year', value: 'year' },
];

interface FilterState {
  categories: string[];
  sort: string;
  dateRange: string;
}

interface SearchInputProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const SearchInput = ({
  isOpen = false,
  onToggle,
  onClose,
}: SearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sort: 'relevance',
    dateRange: 'all',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const handleDateRangeChange = (dateRange: string) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      sort: 'relevance',
      dateRange: 'all',
    });
  };

  const closeSearch = () => {
    onClose?.();
    setSearchQuery('');
    clearFilters();
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.sort !== 'relevance' ||
    filters.dateRange !== 'all';

  const activeFilterCount =
    filters.categories.length +
    (filters.sort !== 'relevance' ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build search params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.categories.length > 0)
      params.set('categories', filters.categories.join(','));
    if (filters.sort !== 'relevance') params.set('sort', filters.sort);
    if (filters.dateRange !== 'all') params.set('date', filters.dateRange);

    // Navigate to search page with filters
    window.location.href = `/search?${params.toString()}`;
  };

  // Prevent dropdown from closing when clicking inside
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className='relative' ref={containerRef}>
      {/* Filter Toggle Button - Always Visible */}
      <Button
        variant={'ghost'}
        size={'sm'}
        type='button'
        onClick={onToggle}
        className='relative box-content px-2 dark:hover:bg-stone-900'
      >
        <Filter
          size={14}
          className={`transition-colors ${hasActiveFilters || isOpen ? 'text-blue-600' : ''}`}
        />
        <ChevronDown
          size={12}
          className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
        {/* Active filters indicator */}
        {activeFilterCount > 0 && (
          <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Search Component - Conditionally Visible */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className='absolute top-full left-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800'
          onClick={handleDropdownClick}
        >
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Search & Filters</h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={closeSearch}
              className='h-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <X size={16} />
            </Button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Search Input */}
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Search Query
              </label>
              <div className='relative'>
                <InputCustom
                  variant='happy'
                  name='q'
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Enter your search terms...'
                  className='h-10 w-full pr-10'
                  onFocus={(e) => e.stopPropagation()} // Prevent focus from bubbling
                />
                <SearchIcon
                  size={18}
                  className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400'
                />
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <label className='mb-3 block text-sm font-medium'>
                Categories
              </label>
              <div className='max-h-32 space-y-2 overflow-y-auto rounded-md border bg-gray-50 p-3 dark:bg-gray-700/50'>
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className='flex cursor-pointer items-center space-x-3 rounded p-1 text-sm hover:bg-white dark:hover:bg-gray-600'
                  >
                    <input
                      type='checkbox'
                      checked={filters.categories.includes(category.value)}
                      onChange={() => handleCategoryToggle(category.value)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort and Date in a row */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Sort Section */}
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Sort By
                </label>
                <div className='space-y-1 rounded-md border bg-gray-50 p-2 dark:bg-gray-700/50'>
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className='flex cursor-pointer items-center space-x-2 rounded p-1 text-sm hover:bg-white dark:hover:bg-gray-600'
                    >
                      <input
                        type='radio'
                        name='sort'
                        value={option.value}
                        checked={filters.sort === option.value}
                        onChange={() => handleSortChange(option.value)}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-xs'>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Section */}
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Date Range
                </label>
                <div className='space-y-1 rounded-md border bg-gray-50 p-2 dark:bg-gray-700/50'>
                  {dateRanges.map((range) => (
                    <label
                      key={range.value}
                      className='flex cursor-pointer items-center space-x-2 rounded p-1 text-sm hover:bg-white dark:hover:bg-gray-600'
                    >
                      <input
                        type='radio'
                        name='dateRange'
                        value={range.value}
                        checked={filters.dateRange === range.value}
                        onChange={() => handleDateRangeChange(range.value)}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-xs'>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-between border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className='text-sm'
              >
                <X className='mr-1 h-3 w-3' />
                Clear Filters
              </Button>
              <Button
                type='submit'
                size='sm'
                className='px-6 text-sm'
                disabled={!searchQuery && !hasActiveFilters}
              >
                <SearchIcon className='mr-1 h-3 w-3' />
                Search
              </Button>
            </div>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className='mt-6 border-t pt-4'>
              <p className='mb-3 text-sm font-medium'>Active Filters:</p>
              <div className='flex flex-wrap gap-2'>
                {filters.categories.map((category) => (
                  <Badge key={category} variant='secondary' className='text-xs'>
                    {categories.find((c) => c.value === category)?.name}
                    <button
                      onClick={() => handleCategoryToggle(category)}
                      className='ml-2 rounded-full p-0.5 hover:bg-red-200'
                      type='button'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}

                {filters.sort !== 'relevance' && (
                  <Badge variant='secondary' className='text-xs'>
                    Sort:{' '}
                    {sortOptions.find((s) => s.value === filters.sort)?.label}
                    <button
                      onClick={() => handleSortChange('relevance')}
                      className='ml-2 rounded-full p-0.5 hover:bg-red-200'
                      type='button'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                )}

                {filters.dateRange !== 'all' && (
                  <Badge variant='secondary' className='text-xs'>
                    {
                      dateRanges.find((d) => d.value === filters.dateRange)
                        ?.label
                    }
                    <button
                      onClick={() => handleDateRangeChange('all')}
                      className='ml-2 rounded-full p-0.5 hover:bg-red-200'
                      type='button'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
