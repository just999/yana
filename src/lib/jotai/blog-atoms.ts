import { getBlogBySlug } from '@/actions/blog-actions';
import { User } from '@prisma/client';
import { atom } from 'jotai';

import { CommentsProps } from '../types';

export interface BlogProps {
  title: string;
  slug: string;
  content: string;
  category: string;
  authorId: string;
  author?: User | null;
  anonymous: boolean;
  images: string[] | [];
}

export type ImageData = {
  src: string;
  id: string;
  alt?: string;
  file?: File[];
  HTMLAttributes?: {
    'data-image-id': string;
    style: string;
  };
};

enum BlogFormType {
  create = 'create',
  update = 'update',
}

export type PendingImgProps = {
  id: string;
  file: File;
  localUrl: string;
};

type FileOrStringArray = string[] | File[];

export const initializedAtom = atom<boolean>(false);
export const isEditorEmptyAtom = atom<boolean>(true);
export const blogTypesAtom = atom<'create' | 'update' | undefined>(undefined);
export const imageAtoms = atom<ImageData[]>([]);
export const imageUrlAtoms = atom<string[]>([]);
export const previewImgAtoms = atom<string[]>([]);
export const fileAtoms = atom<File[] | []>([]);
export const imageCountAtoms = atom<number>(0);
export const uploadingAtoms = atom<boolean>(false);

export const commentsWithParentAtoms = atom<CommentsProps[]>([]);

export const pendingImgAtoms = atom<PendingImgProps[]>([]);

export const activeStylesAtom = atom<Set<string>>(new Set<string>());
export const typingStylesAtom = atom<Set<string>>(new Set<string>());

export const blogAtom = atom<BlogProps>({
  title: '',
  slug: '',
  content: '',
  category: '',
  authorId: '',
  author: null,
  anonymous: false,
  images: [],
});

// Option 1: If BlogProps and Post should be the same, fix the hydrate atom like this:
export const hydrateBlogAtomWithConversion = atom<
  BlogProps | null,
  [string],
  Promise<void>
>(
  (get) => {
    return get(blogAtom);
  },
  async (get, set, slug: string) => {
    try {
      const res = await getBlogBySlug(slug);
      if (res.data) {
        // Ensure the data matches BlogProps interface
        const blogData: BlogProps = {
          title: res.data.title || '',
          slug: res.data.slug || '',
          content: res.data.content || '',
          category: res.data.category || '',
          authorId: res.data.authorId || '',
          author: res.data.author || null,
          anonymous: res.data.anonymous || false,
          images: res.data.images || [],
        };
        set(blogAtom, blogData);
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
    }
  }
  //   const blog = get(blogAtom);
  //   // Convert BlogProps to Post if needed
  //   return {
  //     ...blog,
  //   } as BlogProps;
  // },
  // async (_get, set, slug: string) => {
  //   const res = await getBlogBySlug(slug);
  //   if (res?.data) {
  //     // Convert Post to BlogProps if needed
  //     const blogData: BlogProps = {
  //       ...res.data,
  //     };
  //     set(blogAtom, blogData);
  //   }
  // }
);
