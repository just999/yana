'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn, formUrlQuery } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  page: number;
  totalPages: number;
  urlParamName?: string;
  onPageChange?: (page: number) => void;
  showPageInfo?: boolean;
  className?: string;
  preserveScroll?: boolean;
}

export function EnhancedPagination({
  page,
  totalPages,
  urlParamName = 'page',
  onPageChange,
  showPageInfo = true,
  className = '',
  preserveScroll = true,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paginationRef = useRef<HTMLDivElement>(null);

  const maxVisiblePages = 5;

  const scrollPositionRef = useRef<number>(0);

  const pageData = useMemo(() => {
    if (totalPages <= 0)
      return { pageNumbers: [], firstPage: null, lastPage: null };

    const pages: number[] = [];
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return {
      pageNumbers: pages,
      firstPage: pages[0],
      lastPage: pages[pages.length - 1],
    };
  }, [page, totalPages, maxVisiblePages]);

  useEffect(() => {
    if (preserveScroll && scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant',
        });
      });
    }
  }, [page, preserveScroll]);

  const navigateToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
        return;
      }

      if (preserveScroll) {
        scrollPositionRef.current =
          window.pageYOffset || document.documentElement.scrollTop;
      }

      onPageChange?.(targetPage);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: urlParamName,
        value: String(targetPage),
      });

      if (preserveScroll) {
        router.push(newUrl, { scroll: false });
      } else {
        router.push(newUrl);
      }
    },
    [
      page,
      totalPages,
      onPageChange,
      searchParams,
      urlParamName,
      router,
      preserveScroll,
    ]
  );

  const handleNavigation = useCallback(
    (direction: 'prev' | 'next' | 'first' | 'last') => {
      let targetPage: number;

      switch (direction) {
        case 'prev':
          targetPage = page - 1;
          break;
        case 'next':
          targetPage = page + 1;
          break;
        case 'first':
          targetPage = 1;
          break;
        case 'last':
          targetPage = totalPages;
          break;
        default:
          return;
      }

      navigateToPage(targetPage);
    },
    [page, totalPages, navigateToPage]
  );

  if (totalPages <= 1) {
    return showPageInfo ? (
      <div className={`text-muted-foreground text-sm ${className}`}>
        {totalPages === 1 ? 'Page 1 of 1' : 'No pages'}
      </div>
    ) : null;
  }

  const { pageNumbers, firstPage, lastPage } = pageData;

  return (
    <div
      ref={paginationRef}
      className={`flex items-center justify-between gap-2 ${className}`}
    >
      {/* Page Info */}
      {showPageInfo && (
        <div className='text-muted-foreground text-sm'>
          Page {page} of {totalPages}
        </div>
      )}

      {/* Pagination Controls */}
      <div className='flex items-center gap-1'>
        {/* Previous Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleNavigation('prev')}
          disabled={page <= 1}
          aria-label='Go to previous page'
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='ml-1 hidden sm:inline'>Prev</span>
        </Button>

        {/* First page + ellipsis if needed */}
        {firstPage && firstPage > 1 && (
          <>
            <Button
              variant={page === 1 ? 'default' : 'outline'}
              size='sm'
              onClick={() => navigateToPage(1)}
              aria-label='Go to page 1'
            >
              1
            </Button>
            {firstPage > 2 && (
              <Button
                variant='ghost'
                size='sm'
                disabled
                aria-label='More pages'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'default' : 'outline'}
            size='sm'
            onClick={() => navigateToPage(pageNum)}
            aria-label={`Go to page ${pageNum}`}
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        ))}

        {/* Last page + ellipsis if needed */}
        {lastPage && lastPage < totalPages && (
          <>
            {lastPage < totalPages - 1 && (
              <Button
                variant='ghost'
                size='sm'
                disabled
                aria-label='More pages'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant={page === totalPages ? 'default' : 'outline'}
              size='sm'
              onClick={() => navigateToPage(totalPages)}
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Next Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleNavigation('next')}
          disabled={page >= totalPages}
          aria-label='Go to next page'
        >
          <span className='mr-1 hidden sm:inline'>Next</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

export function PaginationWithScrollToPagination({
  page,
  totalPages,
  urlParamName = 'page',
  onPageChange,
  showPageInfo = true,
  className = '',
}: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paginationRef = useRef<HTMLDivElement>(null);

  const maxVisiblePages = 5;

  const pageData = useMemo(() => {
    if (totalPages <= 0)
      return { pageNumbers: [], firstPage: null, lastPage: null };

    const pages: number[] = [];
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return {
      pageNumbers: pages,
      firstPage: pages[0],
      lastPage: pages[pages.length - 1],
    };
  }, [page, totalPages, maxVisiblePages]);

  useEffect(() => {
    if (paginationRef.current) {
      const timer = setTimeout(() => {
        paginationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [page]);

  const navigateToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
        return;
      }

      onPageChange?.(targetPage);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: urlParamName,
        value: String(targetPage),
      });

      router.push(newUrl);
    },
    [page, totalPages, onPageChange, searchParams, urlParamName, router]
  );

  const handleNavigation = useCallback(
    (direction: 'prev' | 'next' | 'first' | 'last') => {
      let targetPage: number;

      switch (direction) {
        case 'prev':
          targetPage = page - 1;
          break;
        case 'next':
          targetPage = page + 1;
          break;
        case 'first':
          targetPage = 1;
          break;
        case 'last':
          targetPage = totalPages;
          break;
        default:
          return;
      }

      navigateToPage(targetPage);
    },
    [page, totalPages, navigateToPage]
  );

  if (totalPages <= 1) {
    return showPageInfo ? (
      <div className={`text-muted-foreground text-sm ${className}`}>
        {totalPages === 1 ? 'Page 1 of 1' : 'No pages'}
      </div>
    ) : null;
  }

  const { pageNumbers, firstPage, lastPage } = pageData;

  return (
    <div
      ref={paginationRef}
      className={`flex items-center justify-between gap-2 ${className}`}
    >
      {/* Same pagination UI as above */}
      {showPageInfo && (
        <div className='text-muted-foreground text-sm'>
          Page {page} of {totalPages}
        </div>
      )}

      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleNavigation('prev')}
          disabled={page <= 1}
          aria-label='Go to previous page'
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='ml-1 hidden sm:inline'>Prev</span>
        </Button>

        {firstPage && firstPage > 1 && (
          <>
            <Button
              variant={page === 1 ? 'default' : 'outline'}
              size='sm'
              onClick={() => navigateToPage(1)}
              aria-label='Go to page 1'
            >
              1
            </Button>
            {firstPage > 2 && (
              <Button
                variant='ghost'
                size='sm'
                disabled
                aria-label='More pages'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            )}
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'default' : 'outline'}
            size='sm'
            onClick={() => navigateToPage(pageNum)}
            aria-label={`Go to page ${pageNum}`}
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        ))}

        {lastPage && lastPage < totalPages && (
          <>
            {lastPage < totalPages - 1 && (
              <Button
                variant='ghost'
                size='sm'
                disabled
                aria-label='More pages'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant={page === totalPages ? 'default' : 'outline'}
              size='sm'
              onClick={() => navigateToPage(totalPages)}
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={() => handleNavigation('next')}
          disabled={page >= totalPages}
          aria-label='Go to next page'
        >
          <span className='mr-1 hidden sm:inline'>Next</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

export function SimplePagination({
  page,
  totalPages,
  urlParamName = 'page',
  onPageChange,
  preserveScroll = true,
}: Omit<PaginationProps, 'showPageInfo' | 'className'> & {
  preserveScroll?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (preserveScroll && scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant',
        });
      });
    }
  }, [page, preserveScroll]);

  const navigateToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
        return;
      }

      if (preserveScroll) {
        scrollPositionRef.current =
          window.pageYOffset || document.documentElement.scrollTop;
      }

      onPageChange?.(targetPage);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: urlParamName,
        value: String(targetPage),
      });

      router.push(newUrl, preserveScroll ? { scroll: false } : undefined);
    },
    [
      page,
      totalPages,
      onPageChange,
      searchParams,
      urlParamName,
      router,
      preserveScroll,
    ]
  );

  if (totalPages <= 1) return null;

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => navigateToPage(page - 1)}
        disabled={page <= 1}
        className={cn(page <= 1 && 'cursor-not-allowed')}
      >
        <ChevronLeft className='h-4 w-4' /> Prev
      </Button>

      <span className='text-muted-foreground px-2 text-sm'>
        {page} / {totalPages}
      </span>

      <Button
        variant='outline'
        size='sm'
        onClick={() => navigateToPage(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          page >= totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        Next <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}

export { EnhancedPagination as Pagination };
