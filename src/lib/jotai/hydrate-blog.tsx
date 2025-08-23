// 'use client';

// import { useEffect, useRef } from 'react';

// import { useUrlToFile } from '@/hooks/use-url-to-file';
// import { useAtom, useAtomValue } from 'jotai';
// import { useHydrateAtoms } from 'jotai/utils';

// import {
//   blogAtom,
//   BlogProps,
//   blogTypesAtom,
//   fileAtoms,
//   imageAtoms,
//   ImageData,
//   imageUrlAtoms,
// } from './blog-atoms';

// type HydrateProps = {
//   imageUrl: string[] | [];
//   imgData: ImageData[] | [];
//   blog: BlogProps;
//   children: React.ReactNode;
//   type: 'create' | 'update';
//   slug: string;
// };

// const HydrateBlog = ({
//   blog,
//   imageUrl,
//   imgData,
//   type,
//   slug,
//   children,
// }: HydrateProps) => {
//   const isHydrated = useRef(false);

//   // useHydrateAtoms([[blogAtom, blog]]);
//   // useHydrateAtoms([[imageUrlAtoms, imageUrl]]);
//   // useHydrateAtoms([[blogTypesAtom, type]]);
//   // useHydrateAtoms([[imageAtoms, imgData]]);

//   // useHydrateAtoms([
//   //   [blogAtom, blog],
//   //   [imageUrlAtoms, imageUrl],
//   //   [blogTypesAtom, type],
//   //   [imageAtoms, imgData || []],
//   // ]);

//   // Only hydrate once when component mounts
//   if (!isHydrated.current) {
//     useHydrateAtoms([
//       [blogAtom, blog],
//       [imageUrlAtoms, imageUrl],
//       [blogTypesAtom, type],
//       [imageAtoms, imgData || []],
//     ]);
//     isHydrated.current = true;
//   }

//   const [imageFiles, setImageFiles] = useAtom(fileAtoms);

//   // const [blogType, setBlogType] = useAtom(blogTypesAtom);
//   // const [images, setImages] = useAtom(imageAtoms);
//   // const [formData, setFormData] = useAtom(blogAtom);
//   // const { files, loading, error: err } = useUrlToFile(images);
//   const { files, loading, error: err } = useUrlToFile(useAtomValue(imageAtoms));

//   // const [data, setData] = useAtom(hydrateBlogAtomWithConversion);

//   // useEffect(() => {
//   //   if (blog && JSON.stringify(blog) !== JSON.stringify(formData)) {
//   //     setFormData(blog);
//   //   }
//   // }, [blog, setFormData]);

//   // useEffect(() => {
//   //   if (files) {
//   //     setImageFiles(files);
//   //   }
//   // }, [files, setImageFiles]);

//   useEffect(() => {
//     if (files) {
//       setImageFiles(files);
//     }
//   }, [files, setImageFiles]);

//   return <>{children}</>;
// };
// export default HydrateBlog;

'use client';

import { useEffect } from 'react';

import { useUrlToFile } from '@/hooks/use-url-to-file';
import { sessionAtom } from '@/lib/jotai/session-atoms';
import { FormType } from '@/lib/types';
import { useAtom, useStore } from 'jotai';
import { Session } from 'next-auth';

import {
  blogAtom,
  BlogProps,
  blogTypesAtom,
  fileAtoms,
  imageAtoms,
  ImageData,
  imageUrlAtoms,
  previewImgAtoms,
} from './blog-atoms';

type HydrateProps = {
  imageUrl: string[] | [];
  imgData: ImageData[] | [];
  blog: BlogProps;
  children: React.ReactNode;
  type: FormType;
  slug: string;
  session: Session;
};

const HydrateBlog = ({
  blog,
  imageUrl,
  imgData,
  type,
  slug,
  children,
  session,
}: HydrateProps) => {
  // Get the store instance from your existing StoreProvider
  const store = useStore();

  // Use store.set to initialize values without causing re-renders
  useEffect(() => {
    store.set(blogAtom, blog);
    store.set(imageUrlAtoms, imageUrl);
    store.set(blogTypesAtom, type);
    store.set(imageAtoms, imgData || []);
    store.set(previewImgAtoms, imageUrl);
    store.set(sessionAtom, session);
  }, [store, blog, imageUrl, type, imgData, session]);

  // Now use the atoms normally
  const [imageFiles, setImageFiles] = useAtom(fileAtoms);
  const [images, setImages] = useAtom(imageAtoms);
  const [formData, setFormData] = useAtom(blogAtom);
  const [userSession, setUserSession] = useAtom(sessionAtom);

  const { files, loading, error: err } = useUrlToFile(images);

  // useEffect(() => {
  //   if (blog && JSON.stringify(blog) !== JSON.stringify(formData)) {
  //     setFormData(blog);
  //   }
  // }, [blog, setFormData]);

  // useEffect(() => {
  //   if (files && files.length > 0) {
  //     setImageFiles(files);
  //   }
  // }, [files, setImageFiles]);

  // Then set initial values
  useEffect(() => {
    setFormData(blog);
    setImages(imgData || []);
    if (session) setUserSession(session);
  }, [blog, imgData, session, setFormData, setImages, setUserSession]);

  useEffect(() => {
    // console.log('Setting session in store:', session);
    store.set(sessionAtom, session);
    // console.log('Session set, current value:', store.get(sessionAtom));
  }, [store, session]);

  return <>{children}</>;
};

export default HydrateBlog;
