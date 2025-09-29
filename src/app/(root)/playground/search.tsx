'use client';

import { useEffect, useState } from 'react';

import { Pagination } from '@/components/pagination';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import { ChevronDown, Filter, Search, X } from 'lucide-react';

type SearchResult = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  author: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'relevance',
    date: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 6;

  // Mock search function
  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults = Array.from({ length: 18 }, (_, i) => ({
        id: `result-${i}`,
        title: `Search Result ${i + 1}`,
        description: `This is a description for search result ${i + 1}. It contains some details about the item that might match your query "${query}".`,
        category: ['Technology', 'Business', 'Science'][i % 3],
        date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        author: `Author ${(i % 5) + 1}`,
      }));
      setResults(mockResults);
      setIsLoading(false);
    }, 800);
  };

  // Handle initial load and query changes
  useEffect(() => {
    if (query) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [query, filters, currentPage]);

  // Calculate paginated results
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(results.length / resultsPerPage);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      sort: 'relevance',
      date: 'all',
    });
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Search Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>Search</h1>
        <p className='text-muted-foreground'>
          Find exactly what you're looking for
        </p>
      </div>

      {/* Search Bar */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search for anything...'
            className='py-6 pr-4 pl-10 text-base'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button className='px-8 py-6' onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className='mb-8 flex flex-wrap items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Filter className='text-muted-foreground h-4 w-4' />
          <span className='text-sm font-medium'>Filters:</span>
        </div>

        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value=''>All Categories</SelectItem> */}
            <SelectItem value='technology'>Technology</SelectItem>
            <SelectItem value='business'>Business</SelectItem>
            <SelectItem value='science'>Science</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters({ ...filters, sort: value })}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='relevance'>Relevance</SelectItem>
            <SelectItem value='newest'>Newest</SelectItem>
            <SelectItem value='oldest'>Oldest</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.date}
          onValueChange={(value) => setFilters({ ...filters, date: value })}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Date range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All time</SelectItem>
            <SelectItem value='day'>Last 24 hours</SelectItem>
            <SelectItem value='week'>Last week</SelectItem>
            <SelectItem value='month'>Last month</SelectItem>
          </SelectContent>
        </Select>

        {(filters.category ||
          filters.sort !== 'relevance' ||
          filters.date !== 'all') && (
          <Button
            variant='ghost'
            className='text-muted-foreground'
            onClick={clearFilters}
          >
            <X className='mr-1 h-4 w-4' />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      <div className='mb-8 flex flex-wrap gap-2'>
        {query && (
          <Badge className='px-3 py-1'>
            Query: {query}
            <button
              onClick={() => setQuery('')}
              className='hover:bg-accent ml-2 rounded-full'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        )}
        {filters.category && (
          <Badge className='px-3 py-1'>
            Category: {filters.category}
            <button
              onClick={() => setFilters({ ...filters, category: '' })}
              className='hover:bg-accent ml-2 rounded-full'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        )}
        {filters.sort !== 'relevance' && (
          <Badge className='px-3 py-1'>
            Sort: {filters.sort}
            <button
              onClick={() => setFilters({ ...filters, sort: 'relevance' })}
              className='hover:bg-accent ml-2 rounded-full'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        )}
        {filters.date !== 'all' && (
          <Badge className='px-3 py-1'>
            Date: {filters.date}
            <button
              onClick={() => setFilters({ ...filters, date: 'all' })}
              className='hover:bg-accent ml-2 rounded-full'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        )}
      </div>

      {/* Results */}
      <div className='mb-8'>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: resultsPerPage }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-3/4' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='mb-2 h-4 w-full' />
                  <Skeleton className='mb-2 h-4 w-5/6' />
                  <Skeleton className='h-4 w-4/6' />
                </CardContent>
                <CardFooter className='flex gap-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-16' />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className='text-muted-foreground mb-4 text-sm'>
              Showing {indexOfFirstResult + 1}-
              {Math.min(indexOfLastResult, results.length)} of {results.length}{' '}
              results
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {currentResults.map((result) => (
                <Card
                  key={result.id}
                  className='transition-shadow hover:shadow-md'
                >
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>{result.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground mb-4'>
                      {result.description}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <Badge variant='secondary'>{result.category}</Badge>
                      <Badge variant='outline'>{result.date}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className='text-muted-foreground text-sm'>
                    By {result.author}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : query ? (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground text-lg'>
              No results found for "{query}"
            </p>
            <p className='text-muted-foreground mt-2 text-sm'>
              Try different keywords or remove some filters
            </p>
          </div>
        ) : (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground text-lg'>
              Enter a search term to begin
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {results.length > resultsPerPage && (
        <div className='flex justify-center'>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
