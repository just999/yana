// 'use client';

// import { useEffect } from 'react';

// import {
//   blogAtom,
//   fileAtoms,
//   imageAtoms,
//   imageUrlAtoms,
// } from '@/lib/jotai/blog-atoms';
// import { useSetAtom } from 'jotai';
// import { usePathname } from 'next/navigation';

// export const useClearDataOnRoute = () => {
//   const pathname = usePathname();
//   const setBlogData = useSetAtom(blogAtom);
//   const setImages = useSetAtom(imageAtoms);
//   const setImageFiles = useSetAtom(fileAtoms);
//   const setImgUrls = useSetAtom(imageUrlAtoms);
//   useEffect(() => {
//     // Clear data when navigating to new-blog from any other page
//     if (pathname.includes('/dashboard/blogs/new-blog')) {
//       const previousPath = sessionStorage.getItem('previousPath');
//       // Only clear if coming from update/edit page
//       if (previousPath && previousPath.includes('/dashboard/blogs/edit-blog')) {
//         setBlogData({
//           title: '',
//           slug: '',
//           category: '',
//           content: '',
//           images: [],
//         });
//         setImages([]);
//         setImageFiles([]);
//         setImgUrls([]);
//       }
//     }

//     // Store current path for next navigation
//     sessionStorage.setItem('previousPath', pathname);
//   }, [pathname, setBlogData, setImages, setImageFiles, setImgUrls]);
// };

// hooks/useClearDataOnRoute.ts
// hooks/useClearDataOnRoute.ts
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

    // Clear conditions
    const shouldClearData =
      // Coming to new-blog from edit/update
      (isNewBlog &&
        previousPath &&
        (previousPath.includes('/edit') || previousPath.includes('/update'))) ||
      // Coming to edit/update from new-blog
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

      // Force clear any cached data
      sessionStorage.removeItem('blogFormData');
    }

    // Store current path for next navigation
    sessionStorage.setItem('previousPath', pathname);

    // Also store in sessionStorage if we're loading an edit page with ID
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
