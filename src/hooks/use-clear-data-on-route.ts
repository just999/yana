'use client';

import { useEffect } from 'react';

import {
  blogAtom,
  fileAtoms,
  imageAtoms,
  imageUrlAtoms,
} from '@/lib/jotai/blog-atoms';
import { useSetAtom } from 'jotai';
import { usePathname, useSearchParams } from 'next/navigation';

export const useClearDataOnRoute = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setBlogData = useSetAtom(blogAtom);
  const setImages = useSetAtom(imageAtoms);
  const setImageFiles = useSetAtom(fileAtoms);
  const setImgUrls = useSetAtom(imageUrlAtoms);

  useEffect(() => {
    const previousPath = sessionStorage.getItem('previousPath');
    const isNewBlog = pathname.includes('/new-blog');
    const isEdit = pathname.includes('/edit') || pathname.includes('/update');

    const shouldClearData =
      (isNewBlog &&
        previousPath &&
        (previousPath.includes('/edit') || previousPath.includes('/update'))) ||
      (isEdit && previousPath && previousPath.includes('/new-blog'));

    if (shouldClearData) {
      setBlogData({
        title: '',
        slug: '',
        category: '',
        authorId: '',
        author: null,
        anonymous: false,
        content: '',
        images: [],
      });
      setImages([]);
      setImageFiles([]);
      setImgUrls([]);

      sessionStorage.removeItem('blogFormData');
    }

    sessionStorage.setItem('previousPath', pathname);

    if (isEdit && searchParams.get('id')) {
      sessionStorage.setItem('editingBlogId', searchParams.get('id')!);
    }
  }, [
    pathname,
    searchParams,
    setBlogData,
    setImages,
    setImageFiles,
    setImgUrls,
  ]);
};
