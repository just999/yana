'use client';

import DOMPurify from 'dompurify';
import { Dot, Ellipsis } from 'lucide-react';

type BlogContentProps = {
  content: string;
};

const BlogContent = ({ content }: BlogContentProps) => {
  const contentValue = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'img',
      'div',
      'span',
      'p',
      'a',
      'br',
      'strong',
      'em',
      'ul',
      'li',
      'ol',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: [
      'src',
      'alt',
      'data-image-id',
      'style',
      'class',
      'width',
      'height',
    ],
    ALLOWED_URI_REGEXP: /^data:image\/|^blob:|^https?:\/\//,
  });
  return (
    <div className='flex flex-col items-center justify-center py-8'>
      <div
        className='prose prose-sm max-w-none px-8 py-0 text-justify dark:text-stone-700'
        dangerouslySetInnerHTML={{
          __html: contentValue,
        }}
      />
      <span className='mx-auto flex w-full justify-center text-center'>
        <Ellipsis size={24} className='text-black' />
      </span>
    </div>
  );
};

export default BlogContent;
