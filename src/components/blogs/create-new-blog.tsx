// 'use client';

// import { FormEvent, useRef, useState } from 'react';

// import {
//   Alert,
//   Button,
//   Card,
//   CardContent,
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   InputCustom,
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import QuillResizeImage from 'quill-resize-image';
// import { CircularProgressbar } from 'react-circular-progressbar';
// import slugify from 'slugify';

// import 'react-quill-new/dist/quill.snow.css';
// import 'react-circular-progressbar/dist/styles.css';

// import { createNewBlog, updateBlog } from '@/actions/blog-actions';
// import { useZodForm } from '@/hooks/use-zod-form';
// import { categories } from '@/lib/helpers';
// import { imageAtoms } from '@/lib/jotai/blog-atoms';
// import { BlogSchema, blogSchema } from '@/lib/schemas/blog-schemas';
// import { FormType } from '@/lib/types';
// import { UploadButton } from '@/lib/uploadthing';
// import { useAtom } from 'jotai';
// import { Loader } from 'lucide-react';
// import dynamic from 'next/dynamic';
// import { SubmitHandler, useForm } from 'react-hook-form';
// import { Quill } from 'react-quill-new';
// import { toast } from 'sonner';

// const ReactQuill = dynamic(() => import('react-quill-new'), {
//   ssr: false,
// });

// const toolbarOptions = [
//   ['bold', 'italic', 'underline', 'strike'],
//   ['blockquote', 'code-block'],
//   ['link', 'image', 'video', 'formula'],
//   [
//     { header: 1 },
//     { header: 2 },
//     { header: 3 },
//     { header: 4 },
//     { header: 5 },
//     { header: 6 },
//   ],
//   [{ list: 'ordered' }, { list: 'bullet' }],
//   [{ script: 'sub' }, { script: 'super' }],
//   [{ indent: '-1' }, { indent: '+1' }],
//   [{ direction: 'rtl' }],
//   [{ size: ['small', false, 'large', 'huge'] }],
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ color: [] }, { background: [] }],
//   [{ font: [] }],
//   [{ align: [] }],
// ];

// const formats = [
//   'header',
//   'bold',
//   'italic',
//   'underline',
//   'strike',
//   'blockquote',
//   'code-block',
//   'list',
//   'script',
//   'link',
//   'indent',
//   'direction',
//   'size',
//   'color',
//   'background',
//   'font',
//   'align',
//   'image',
//   'video',
//   'formula',
// ];

// type CreateNewBlogProps = {
//   type: FormType;
//   blogId?: string;
// };

// Quill.register('modules/resize', QuillResizeImage);

// const CreateNewBlog = ({ type, blogId }: CreateNewBlogProps) => {
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [images, setImages] = useAtom(imageAtoms);
//   const router = useRouter();
//   const quillRef = useRef<import('react-quill-new').default | null>(null);
//   const form = useZodForm({
//     schema: blogSchema,
//     mode: 'onChange',
//     defaultValues: {
//       title: '',
//       slug: '',
//       category: '',
//       content: '',
//       images: [],
//     },
//   });

//   const Editor = {
//     modules: {
//       toolbar: {
//         container: [
//           ['bold', 'italic', 'underline', 'strike', 'video'],
//           ['blockquote', 'code-block'],
//           ['link', 'image'],
//           [{ header: [1, 2, 3, 4, 5, 6, false] }],
//           [{ indent: '-1' }, { indent: '+1' }],
//           [{ list: 'ordered' }, { list: 'bullet' }],
//         ],
//       },
//       resize: {
//         locale: {},
//       },
//     },
//     formats: [
//       'bold',
//       'italic',
//       'underline',
//       'strike',
//       'blockquote',
//       'code-block',
//       'image',
//       'video',
//       'header',
//       'indent',
//       'list',
//     ],
//   };

//   const handleImageUpload = async () => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/*');
//     input.setAttribute('multiple', 'true');
//     input.click();

//     input.onchange = async () => {
//       const files = input.files;

//       if (!files) return;

//       if (files) {
//         const formData = new FormData();
//         Array.from(files).forEach((file) => formData.append('file', file));
//         try {
//           setUploadProgress(10); // Start progress
//           const response = await fetch('/api/uploadthing', {
//             method: 'POST',
//             body: formData,
//           });
//           const res = await response.json();
//           if (quillRef.current) {
//             const quill = quillRef.current.getEditor();
//             const range = quill.getSelection(true); // Ensure selection is available
//             if (range) {
//               // Insert each uploaded image into Quill
//               res.forEach((item: { url: string }, index: number) => {
//                 quill.insertEmbed(range.index + index, 'image', item.url);
//               });
//               // Optionally add URLs to form's images field
//               const newImageUrls = res.map((item: { url: string }) => item.url);
//               form.setValue('images', [
//                 ...(form.getValues('images') ?? []),
//                 ...newImageUrls,
//               ]);
//             }
//           }
//           setUploadProgress(100);
//           setTimeout(() => setUploadProgress(0), 1000); // Reset progress
//         } catch (error) {
//           console.error('Quill image upload failed:', error);
//           toast.error('Failed to upload image to editor');
//           setUploadProgress(0);
//         }
//       }
//     };
//   };

//   const handleSubmit: SubmitHandler<BlogSchema> = async (data) => {
//     if (type === 'create') {
//       const res = await createNewBlog(data);

//       if (!res || res.error) {
//         toast.error(res?.message);
//       } else {
//         toast.success(res.message);

//         router.push('/dashboard/blogs');
//       }
//     }

//     if (type === 'update') {
//       if (!blogId) {
//         router.push('/dashboard/blogs');
//         return;
//       }
//       const res = await updateBlog({ ...data, slug: blogId });

//       if (!res || res.error) {
//         toast.error(res?.message);
//       } else {
//         toast.success(res.message);

//         router.push('/dashboard/blogs');
//       }
//     }
//   };

//   const imagesWatch = form.watch('images');

//   return (
//     <div className='mx-auto min-h-screen max-w-3xl p-3'>
//       <h1 className='my-7 text-center text-3xl font-semibold dark:text-gray-200'>
//         Create New Blog
//       </h1>

//       <Form {...form}>
//         <form
//           method='POST'
//           className='flex flex-col gap-4'
//           onSubmit={form.handleSubmit(handleSubmit)}
//         >
//           <div className='flex flex-col justify-between gap-4 sm:flex-row'>
//             <div className='flex w-full flex-col gap-1'>
//               <FormField
//                 control={form.control}
//                 name='title'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <InputCustom
//                         type='text'
//                         placeholder='Title'
//                         required
//                         className='w-full flex-1'
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name='slug'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <div className='relative flex w-full items-center'>
//                         <InputCustom
//                           type='text'
//                           placeholder='Slug'
//                           required
//                           className='w-full flex-1'
//                           {...field}
//                         />
//                         <Button
//                           type='button'
//                           variant={'outline'}
//                           className='bg-muted/50 absolute -right-40 w-36 hover:bg-gray-600'
//                           onClick={() => {
//                             form.setValue(
//                               'slug',
//                               slugify(form.getValues('title'), {
//                                 lower: true,
//                               }).slice(0, 30)
//                             );
//                           }}
//                         >
//                           Generate slug
//                         </Button>
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <FormField
//               control={form.control}
//               name='category'
//               render={({ field }) => (
//                 <FormItem>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder='Select category' />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {categories.map((cat) => (
//                         <SelectItem key={cat.description} value={cat.name}>
//                           {cat.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           <FormField
//             control={form.control}
//             name='images'
//             render={({ field }) => (
//               <FormItem className='w-full'>
//                 {/* <FormLabel>Images</FormLabel> */}
//                 <Card>
//                   <CardContent>
//                     <div className='flex-start space-x-2'>
//                       {images?.map((img, index) => (
//                         <div
//                           key={typeof img === 'string' ? index : img.id}
//                           className='relative'
//                         >
//                           <Image
//                             src={img.src}
//                             alt='blog images'
//                             priority
//                             className='h-20 w-20 rounded-sm object-cover'
//                             width={100}
//                             height={100}
//                           />
//                           <button
//                             type='button'
//                             onClick={() => {
//                               const newImages = (field.value ?? []).filter(
//                                 (_, i) => i !== index
//                               );
//                               form.setValue('images', newImages);
//                             }}
//                             className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-xs text-white'
//                           >
//                             X
//                           </button>
//                         </div>
//                       ))}

//                       {/* <FormControl>
//                         <div className='flex items-center space-x-2'>
//                           <UploadButton
//                             endpoint='imageUploader'
//                             onClientUploadComplete={(res) => {
//                               const newImageUrls = res.map((item) => item.url);
//                               form.setValue('images', [
//                                 ...(images ?? []),
//                                 ...newImageUrls.map((url) => ({
//                                   src: url,
//                                   id: crypto.randomUUID(),
//                                 })),
//                               ]);
//                               setUploadProgress(0);
//                             }}
//                             onUploadError={(error) => {
//                               console.error('Upload error:', error);
//                               form.setError('images', {
//                                 type: 'manual',
//                                 message: 'Image upload failed',
//                               });
//                               setUploadProgress(0);
//                             }}
//                             onUploadProgress={(progress) =>
//                               setUploadProgress(progress)
//                             }
//                           />
//                           {uploadProgress > 0 && (
//                             <div className='h-12 w-12'>
//                               <CircularProgressbar
//                                 value={uploadProgress}
//                                 text={`${uploadProgress}%`}
//                               />
//                             </div>
//                           )}
//                         </div>
//                       </FormControl> */}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name='content'
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <ReactQuill
//                     modules={Editor.modules}
//                     formats={Editor.formats}
//                     theme='snow'
//                     placeholder='Write something...'
//                     className='mb-12 h-72'
//                     // modules={{ toolbar: toolbarOptions }}
//                     // modules={{
//                     //   toolbar: {
//                     //     container: toolbarOptions,
//                     //     handlers: { image: handleImageUpload },
//                     //   },
//                     // }}
//                     // formats={formats}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button type='submit' disabled={form.formState.isSubmitting}>
//             {form.formState.isSubmitting ? <Loader /> : 'Publish'}
//           </Button>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default CreateNewBlog;
