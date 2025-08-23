'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { Button, InputCustom } from '@/components/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Types
interface SearchItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface SearchFilters {
  category?: string;
  tags?: string[];
}

interface SearchContextType {
  allData: SearchItem[];
  isLoading: boolean;
  searchResults: SearchItem[];
  performSearch: (query: string, filters?: SearchFilters) => void;
}

// Context
const SearchContext = createContext<SearchContextType | null>(null);

// Hook with better error handling
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error(
      'useSearch must be used within a SearchProvider. Make sure to wrap your component tree with <SearchProvider>.'
    );
  }
  return context;
};

// Optional hook that returns null if not in provider (safer)
export const useSearchSafe = () => {
  return useContext(SearchContext);
};

// Provider Component
export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [allData, setAllData] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // Prefetch all data on mount
  useEffect(() => {
    const prefetchData = async () => {
      try {
        setIsLoading(true);

        // Mock data for demonstration - replace with your API call
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading

        const mockData: SearchItem[] = [
          {
            id: '1',
            title: 'React Performance Tips',
            content:
              'Learn how to optimize your React applications for better performance...',
            category: 'development',
            tags: ['react', 'performance', 'optimization'],
          },
          {
            id: '2',
            title: 'Next.js Best Practices',
            content:
              'Discover the best practices for Next.js development and deployment...',
            category: 'development',
            tags: ['nextjs', 'best-practices', 'web-dev'],
          },
          {
            id: '3',
            title: 'TypeScript Advanced Patterns',
            content: 'Master advanced TypeScript patterns and techniques...',
            category: 'development',
            tags: ['typescript', 'patterns', 'advanced'],
          },
        ];

        // Replace this with your actual API call:
        // const response = await fetch('/api/search/all');
        // const data = await response.json();

        setAllData(mockData);
        setSearchResults(mockData);
      } catch (error) {
        console.error('Failed to prefetch search data:', error);
        setAllData([]);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    prefetchData();
  }, []);

  // Client-side search function
  const performSearch = useCallback(
    (query: string, filters?: SearchFilters) => {
      if (!query.trim()) {
        setSearchResults(allData);
        return;
      }

      const lowercaseQuery = query.toLowerCase();

      const filtered = allData.filter((item) => {
        // Text matching
        const matchesText =
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.content.toLowerCase().includes(lowercaseQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery));

        // Category filtering
        const matchesCategory =
          !filters?.category || item.category === filters.category;

        // Tag filtering
        const matchesTags =
          !filters?.tags?.length ||
          filters.tags.some((tag) => item.tags.includes(tag));

        return matchesText && matchesCategory && matchesTags;
      });

      // Sort by relevance
      const sorted = filtered.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, lowercaseQuery);
        const bScore = calculateRelevanceScore(b, lowercaseQuery);
        return bScore - aScore;
      });

      setSearchResults(sorted);
    },
    [allData]
  );

  const calculateRelevanceScore = (item: SearchItem, query: string): number => {
    let score = 0;

    if (item.title.toLowerCase().includes(query)) score += 10;
    if (item.content.toLowerCase().includes(query)) score += 5;
    if (item.tags.some((tag) => tag.toLowerCase().includes(query))) score += 7;
    if (item.title.toLowerCase() === query) score += 20;

    return score;
  };

  const value = useMemo(
    () => ({
      allData,
      isLoading,
      searchResults,
      performSearch,
    }),
    [allData, isLoading, searchResults, performSearch]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
