// 'use client';

// import { MouseEvent, useActionState, useCallback, useEffect, useState } from 'react';

// import { useZodForm } from '@/hooks/use-zod-form';
// // import { bannerAtom } from '@/lib/jotai/banner-atoms';
// import { AvatarResponse } from '@/lib/types';
// import { useUploadThing } from '@/lib/uploadthing';
// import { useDropzone } from '@uploadthing/react';
// import { useAtom } from 'jotai';
// import { TriangleAlert, X } from 'lucide-react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { Controller } from 'react-hook-form';
// import { toast } from 'sonner';
// import {
//   generateClientDropzoneAccept,
//   generatePermittedFileTypes,
// } from 'uploadthing/client';
// import { z } from 'zod';

// import { ImageData } from '../app/(dashboard)/admin/images/image-upload';
// import DeleteDialog from './delete-dialog';
// import { Button, InputCustom } from './ui';
// import { addAvatar, removeAvatar } from '@/actions/auth-actions'

// const formSchema = z.object({
//   images: z.array(
//     z.object({
//       url: z.string(),
//     })
//   ),
// });

// type FormValues = z.infer<typeof formSchema>;

// type Props = {
//   banners: AvatarResponse;
//   maxImages?: number;
// };

// export function CustomDropzone({ banners, maxImages = 5 }: Props) {
//   const [files, setFiles] = useState<File[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [images, setImages] = useState<ImageData[] | []>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // const [bannerImg, setBannerImg] = useAtom(bannerAtom);

//     const [data, action] = useActionState(addAvatar, {
//       error: false,
//       message: '',
//     });

//   const router = useRouter();
//   const form = useZodForm({
//     schema: formSchema,
//     mode: 'onChange',
//     defaultValues: {
//       images: [],
//     },
//   });

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     setFiles(acceptedFiles);
//   }, []);

//   const { startUpload, routeConfig } = useUploadThing('imageUploader', {
//     onClientUploadComplete: () => runUploadThing(files),

//     onUploadError: (error: Error) => {
//       setIsUploading(false);
//       toast.error(`Upload failed: ${error.message}`);
//     },
//     onUploadBegin: (files: string) => {
//       setIsUploading(true);
//       console.log('Upload started for:', files);
//     },
//   });

//   const runUploadThing = async (files: File[]) => {
//     try {
//       setIsUploading(true);
//       const res = await startUpload(files);

//       // safely handle response
//       const newImages = (res ?? [])
//         .map((file) => ({
//           url: file.ufsUrl || file.url,
//           key: file.key,
//         }))
//         .slice(0, maxImages);

//       setImages(newImages);
//       form.setValue('images', newImages, {
//         shouldValidate: true,
//         shouldDirty: true,
//       });

//       toast.success('Upload completed successfully!');
//       setFiles([]);
//       submitBannerData(newImages);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         toast.error(err.message || 'Upload failed.');
//       } else {
//         toast.error('Upload failed.');
//       }
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   useEffect(() => {
//     console.log('Form state:', {
//       isDirty: form.formState.isDirty,
//       isValid: form.formState.isValid,
//       errors: form.formState.errors,
//       values: form.getValues(),
//     });
//   }, [form.formState, form]);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: generateClientDropzoneAccept(
//       generatePermittedFileTypes(routeConfig).fileTypes
//     ),
//   });
//   const handleRemoveImage = (e: MouseEvent<HTMLButtonElement>, i: number) => {
//     e.stopPropagation();
//     setFiles((prev) => prev.filter((_, idx) => idx !== i));
//   };

//   const handleRemoveUploadedImage = async (url: string) => {
//     const updatedImages = images.filter((img, idx) => img.url !== url);
//     setImages(updatedImages);

//     const res = await removeAvatar(url);
//     if (res.error) {
//       toast.error(res.message);
//     } else {
//       toast.success(res.message);
//       form.reset();
//       router.refresh();
//     }

//     // Update form value after removing image
//     form.setValue('images', updatedImages, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//   };

//   // Separate function to handle the actual data submission
//   // const submitBannerData = async (imagesToSubmit: ImageData[]) => {
//   //   if (!imagesToSubmit || imagesToSubmit.length === 0) {
//   //     toast.error('Please upload at least one image');
//   //     return;
//   //   }

//   //   setIsSubmitting(true);

//   //   try {
//   //     const formData = new FormData();
//   //     formData.append(
//   //       'imgUrls',
//   //       JSON.stringify(imagesToSubmit.map((img) => img.url))
//   //     );

//   //     console.log('Submitting image data:', {
//   //       imgUrls: imagesToSubmit.map((img) => img.url),
//   //     });

//   //     const res = await addAvatar(formData);

//   //     if (res.error) {
//   //       toast.error(res.message);
//   //     } else {
//   //       toast.success(res.message);
//   //       // Reset form after successful submission
//   //       form.reset();
//   //       setImages([]);
//   //     }
//   //   } catch (error) {
//   //     console.error('Submission error:', error);
//   //     toast.error('Failed to save images');
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

//   // Handle the initial form submission - this uploads files first
//   // const onSubmit = async (data: FormValues) => {
//   //   console.log('onSubmit is triggered!!', data);

//   //   // Check if we have valid form data
//   //   if (!data.images || data.images.length === 0) {
//   //     if (files.length === 0) {
//   //       toast.error('Please upload at least one image');
//   //       return;
//   //     }

//   //     // If there are files but no data.images, proceed with upload
//   //     setIsUploading(true);
//   //     await startUpload(files);
//   //   } else if (files.length > 0) {
//   //     // If we have both form data and new files, upload the new files first
//   //     setIsUploading(true);
//   //     await startUpload(files);
//   //   } else {
//   //     // If we only have form data but no new files, submit directly
//   //     await submitBannerData(data.images);
//   //   }
//   // };

//   // Initialize with existing banners
//   useEffect(() => {
//     if (banners.data && banners.data.length > 0) {
//       setBannerImg(banners.data);

//       // Pre-populate the form with existing banner images
//       const existingImages = banners.data.flatMap((banner) => {
//         return banner.bannersUrl.map((url, index) => ({
//           url,
//           key: banner.bannersKey?.[index] || url, // Use URL as key if bannersKey is not available
//         }));
//       });

//       if (existingImages.length > 0) {
//         setImages(existingImages);

//         // Make sure to set the form value
//         form.setValue('images', existingImages, {
//           shouldValidate: true,
//           shouldDirty: false,
//         });
//       }
//     }
//   }, [banners.data, setBannerImg, form]);

//   // Debug - log form errors
//   const formErrors = form.formState.errors;
//   useEffect(() => {
//     if (Object.keys(formErrors).length > 0) {
//       console.log('Form errors:', formErrors);
//     }
//   }, [formErrors]);

//   console.log('Form is valid:', form.formState.isValid);
//   console.log('Form values:', form.getValues());

//   return (
//     <form
//       // onSubmit={(e) => {
//       //   console.log('Form submit event triggered');
//       //   form.handleSubmit(onSubmit)(e);
//       // }}
//       action={action}
//       className='flex w-full flex-col items-start justify-center space-y-4'
//     >
//       {/* Display existing uploaded images */}
//       {images.length > 0 && (
//         <div className='flex'>
//           {/* <p>Uploaded Images:</p> */}
//           <div className='mt-2 grid w-full grid-cols-3 content-center gap-2'>
//             {bannerImg.map((img, i) =>
//               img.bannersUrl.map((i, idx) => (
//                 <div key={i} className='relative gap-2 justify-self-auto'>
//                   <Image
//                     src={i}
//                     alt='uploaded image'
//                     width={300}
//                     height={75}
//                     priority
//                   />
//                   <Button
//                     type='button'
//                     onClick={() => handleRemoveUploadedImage(i)}
//                     className='absolute top-0 right-0 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
//                   >
//                     <X className='svg h-4 w-4 cursor-pointer stroke-pink-500 hover:stroke-pink-700 hover:stroke-4' />
//                   </Button>
//                   <DeleteDialog
//                     className='absolute right-0'
//                     // actionTitle='test'
//                     type='delete'
//                     action={removeImage}
//                     id={i}
//                   />
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       <Controller
//         name='images'
//         control={form.control}
//         render={({ field, fieldState: { error } }) => (
//           <div className='w-full space-y-4'>
//             {/* Dropzone area */}
//             <div
//               {...getRootProps()}
//               className='cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:border-gray-400'
//             >
//               <InputCustom {...getInputProps()} />

//               <div className='space-y-4'>
//                 <p>Drag & drop files here, or click to select files</p>

//                 {/* Display selected files */}
//                 {files.length > 0 && files.length < 6 ? (
//                   <div>
//                     <p>Selected {files.length} file(s)</p>
//                     <div className='mt-2 flex flex-wrap gap-2'>
//                       {files.map((img, i) => (
//                         <div key={i} className='relative flex w-full flex-col'>
//                           <Image
//                             src={URL.createObjectURL(img)}
//                             alt='image'
//                             width={100}
//                             height={25}
//                             priority
//                           />
//                           <Button
//                             type='button'
//                             onClick={(e) => handleRemoveImage(e, i)}
//                             className='absolute top-0 right-0 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
//                             disabled={isUploading}
//                           >
//                             <X className='svg h-4 w-4 cursor-pointer stroke-pink-500 hover:stroke-pink-700 hover:stroke-4' />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : files.length > 5 ? (
//                   <div className='text-destructive flex items-center justify-center gap-2 font-bold underline'>
//                     <TriangleAlert />
//                     Max files: 5, files chosen: {files.length}
//                   </div>
//                 ) : (
//                   ''
//                 )}
//               </div>
//             </div>

//             {/* Error display */}
//             {error && <p className='text-sm text-red-500'>{error.message}</p>}

//             {/* Submit button outside the dropzone */}
//             <Button
//               type='submit'
//               variant={'outline'}
//               disabled={isUploading || isSubmitting || files.length === 0}
//               className='w-full cursor-pointer rounded-sm bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
//             >
//               {isUploading
//                 ? 'Uploading...'
//                 : isSubmitting
//                   ? 'Saving...'
//                   : files.length > 0
//                     ? `Upload & Save ${files.length} files`
//                     : 'Save Banner to Database'}
//             </Button>
//           </div>
//         )}
//       />
//     </form>
//   );
// }
