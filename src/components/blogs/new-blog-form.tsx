// 'use client';

// import { useEffect, useState } from 'react';

// import { createNewBlog } from '@/actions/blog-actions';
// import { Loader } from 'lucide-react';
// import { toast } from 'sonner';

// import Editor from '../editor/editor';
// import { Button, InputCustom } from '../ui';

// export const defaultValue = {
//   type: 'doc',
//   content: [
//     {
//       type: 'paragraph',
//       content: [
//         {
//           type: 'text',
//           text: 'Type "/" for commends or start writing.. ',
//         },
//       ],
//     },
//   ],
// };

// type NewBlogFormProps = unknown;

// const NewBlogForm = () => {
//   const [title, setTitle] = useState('');
//   const [slug, setSlug] = useState('');
//   const [category, setCategory] = useState('');
//   const [content, setContent] = useState<string>('');
//   const [pending, setPending] = useState(false);

//   useEffect(() => {
//     const name = title
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');

//     setSlug(name);
//   }, [title]);

//   async function handleSubmit() {
//     // TODO: validate the data

//     setPending(true);

//     const result = await createNewBlog({ title, slug, content, category });

//     if (result?.error) {
//       toast.error(result.error);
//     }

//     setPending(false);
//   }
//   return (
//     <div className='mt-6 flex max-w-2xl flex-col gap-4'>
//       <div className='flex gap-4'>
//         <InputCustom
//           type='text'
//           placeholder='Title'
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <InputCustom
//           type='text'
//           placeholder='Slug'
//           value={slug}
//           onChange={(e) => setSlug(e.target.value)}
//         />
//         <InputCustom
//           type='text'
//           placeholder='Category'
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         />
//       </div>
//       <Editor initialValue={defaultValue} onChange={setContent} />
//       <Button onClick={handleSubmit} disabled={pending}>
//         {pending ? <Loader /> : 'Create'}
//       </Button>
//     </div>
//   );
// };

// export default NewBlogForm;
