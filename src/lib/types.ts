import { Reaction, ReactionType, User } from '@prisma/client';
import { Control } from 'react-hook-form';
import { ClientUploadedFileData, ExpandedRouteConfig } from 'uploadthing/types';

import { AvatarSchema } from './schemas/auth-schemas';
import type { BlogSchema } from './schemas/blog-schemas';

// import { BlogSchema, UpdateBlogSchema } from './schemas/blog-schemas';

export type Theme = 'system' | 'dark' | 'light';

export type FormType = 'create' | 'update';

export type UploadedImage = ClientUploadedFileData<{ uploadedBy: string }> & {
  url: string;
  key: string;
};

type StartUploadFn = (files: File[]) => Promise<UploadedImage[] | undefined>;

export interface RichTextEditorRef {
  focus: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
  getDOMElement: () => HTMLDivElement | null;
}

export interface PostProps {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  content: string;
  authorId: string;
  reactions?: Reaction[];
  featured?: boolean;
  anonymous: boolean;
  author?: User;
  images: string[];
  comments?: PostComment[];
  createdAt: Date;
}

export interface RichTextEditorProps {
  value?: string;
  type: FormType;
  slug?: string;
  blog?: PostProps;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  // onImageFilesChange?: (files: File[]) => void;
  placeholder?: string;
  error?: string;
  control?: Control<BlogFormValues>;
  // watch: UseFormWatch<BlogFormValues>;
  // form: UseFormReturn<BlogFormValues>;
  name?: string;
  startUpload?: StartUploadFn;
  routeConfig?: ExpandedRouteConfig | undefined;
  className?: string;
  maxImages?: number;
  editorRef?: React.RefObject<HTMLDivElement | null> | undefined;
  fileToImageIdMap?: Map<File, string>;
  rules?: {
    required: string;
  };
  updateContent?: (value?: string) => void;
}

export interface ToolbarButtonProps {
  title: string;
  shortcut?: string;
  icon: React.ComponentType<{ size: number }>;
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  getRootProps?: () => React.HTMLProps<HTMLElement>;
  getInputProps?: () => React.InputHTMLAttributes<HTMLInputElement>;
  onTriggerUpload?: () => void;
  className?: string;
}

export interface ExtendedRichTextEditorProps extends RichTextEditorProps {
  onReset?: () => void;
  onImageFilesChange?: (files: File[]) => void;
}
export type BlogFormValues = {
  title: string;
  slug: string;
  category: string;
  content: string;
  images?: string[];
};

export type ImageData = {
  id: string;
  src: string;
};

export type UploadedFileResponse = {
  name: string; // Original file name
  key: string; // Unique UploadThing file key
  url: string; // Publicly accessible URL
  size: number; // File size in bytes
  type: string; // MIME type
  // optionally:
  ufsUrl?: string; // For some UploadThing setups (like ufs.io)
};

export interface PostComment {
  id: string;
  comment: string;
  user?: User;
  username?: string;
}

export interface PostData {
  id?: string;
  title: string;
  content: string;
  author: string;
  images?: string[];
  date: string;
  comments: PostComment[];
}

export type AnalyticsItem = {
  name: string;
  uv: number;
  pv: number;
  amt: number;
};

// app/types/blog.ts
// export type BlogType = 'create' | 'update';

export interface BlogImage {
  src: string;
  id: string;
}

export type CreateBlogData = {
  type: 'create';
  title: string;
  slug: string;
  content: string;
  category: string;
  images?: { src: string; id: string }[];
};

export type UpdateBlogData = {
  type: 'update';
  title: string;
  slug: string;
  content: string;
  category: string;
  images?: { src: string; id: string }[];
};

// export interface UpdateBlogData extends CreateBlogData {
//   id: string;
// }

// export type CreateOrUpdateBlogData<T extends BlogType> = T extends 'create'
//   ? CreateBlogData
//   : UpdateBlogData;

// export type BlogBase = {
//   title: string;
//   slug: string;
//   category: string;
//   content: string;
//   images?: ImageData[];
// };

// type CreateBlog = BlogBase & {
//   type: 'create';
// };
// type UpdateBlog = BlogBase & {
//   id: string;
//   type: 'update';
// };

// export type CreateOrUpdateBlogData<T> = T extends 'create'
//   ? BlogSchema
//   : UpdateBlogSchema;

export type ReactionProps = {
  id: string;
  userId: string;
  user: User;
  postId: string;
  post: PostProps;
  commentId?: string;
  comment?: CommentsProps;
  type?: ReactionType;
  createdAt: Date;
};

export type CommentsProps = {
  id: string;
  comment: string;
  parentId: string | null;
  postId: string;
  userId: string;
  user: User;
  children?: CommentsProps[];
  reaction?: ReactionProps;
  createdAt: Date;
};

export type AvatarResponse = {
  error: boolean;
  message: string;
  data: AvatarSchema;
};

export interface CommentReaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}
export interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

export interface CommentReactionsProps {
  [commentId: string]: CommentReaction;
}
export interface PostReactionsProps {
  [postId: string]: PostReaction;
}

export enum RegistrationRoutes {
  USER_INFO = '/sign-up/step-one',
  USER_DETAILS = '/sign-up/step-two',
  USER_CONTACT = '/sign-up/step-three',
  REVIEW_USER = '/sign-up/review',
  USER_SUCCESS = '/',
  USER_ERROR = '',
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export type BlogActionResult = {
  success?: boolean;
  error: boolean;
  errors?: Record<string, string[]>;
  message: string;
  inputs?: BlogSchema;
  data?: PostProps;
};

export type RangeType = 'today' | 'w' | 'm' | 'y';
export type TransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'SAVING'
  | 'INVESTMENT'
  | null;

export type TradingViewWidgetProps = {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
};
