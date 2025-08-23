// import { useActionState, useCallback, useEffect, useState } from 'react';

// import { addAvatar } from '@/actions/auth-actions';
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
//   Button,
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   InputCustom,
//   Label,
// } from '@/components/ui';
// import { useZodForm } from '@/hooks/use-zod-form';
// import { fileAtoms } from '@/lib/jotai/blog-atoms';
// import { AvatarSchema, avatarSchema } from '@/lib/schemas/auth-schemas';
// import { useUploadThing } from '@/lib/uploadthing';
// import { useDropzone } from '@uploadthing/react';
// import { useAtom } from 'jotai';
// import { Camera, Loader, TriangleAlert, Upload, X } from 'lucide-react';
// import { Session } from 'next-auth';
// import Image from 'next/image';
// import { useFormStatus } from 'react-dom';
// import { Controller } from 'react-hook-form';
// import { toast } from 'sonner';
// import {
//   generateClientDropzoneAccept,
//   generatePermittedFileTypes,
// } from 'uploadthing/client';

// type ImageData = {
//   url: string;
// };

// type AddAvatarFormProps = {
//   session: Session;
// };

// const AddAvatarForm = ({ session }: AddAvatarFormProps) => {
//   const [data, action] = useActionState(addAvatar, {
//     error: false,
//     message: '',
//   });
//   // const [files, setFiles] = useState<File[]>([]);
//   const [files, setFiles] = useAtom(fileAtoms);
//   const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [images, setImages] = useState<ImageData[] | []>([]);

//   const maxImages = 1;

//   useEffect(() => {
//     if (data?.message) {
//       if (data?.error) {
//         toast.error(data?.message, {
//           style: {
//             backgroundColor: 'var(--destructive)',
//             color: 'white',
//           },
//           description: 'Please try again, mutherfunker',
//           descriptionClassName: 'text-xs',
//         });
//       } else {
//         toast.success(data?.message, {
//           style: {
//             backgroundColor: '#22c55e',
//             color: 'white',
//           },
//           description: 'Success',
//           descriptionClassName: 'text-xs',
//         });
//       }
//     }
//   }, [data?.error, data?.message]);

//   // const form = useZodForm({
//   //   schema: avatarSchema,
//   //   mode: 'onChange',
//   //   defaultValues: {
//   //     avatar:
//   //   },
//   // });

//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       if (acceptedFiles) setFiles(acceptedFiles);
//     },
//     [setFiles]
//   );

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

//       const newAvatar = (res ?? [])
//         .map((file) => ({
//           url: file.ufsUrl || file.url,
//         }))
//         .slice(0, maxImages);

//       setImages(newAvatar);
//       // form.setValue('avatar', newAvatar, {
//       //   shouldValidate: true,
//       //   shouldDirty: true,
//       // });

//       toast.success('Upload completed successfully!');
//       setFiles([]);
//       // submitAvatarData(newAvatar);
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

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: generateClientDropzoneAccept(
//       generatePermittedFileTypes(routeConfig).fileTypes
//     ),
//   });

//   const handleRemoveImage = (
//     e: React.MouseEvent<HTMLButtonElement>,
//     i: number
//   ) => {
//     e.stopPropagation();
//     setFiles((prev) => prev.filter((_, idx) => idx !== i));
//   };

//   const submitAvatarData = async (imagesToSubmit: ImageData[]) => {
//     if (!imagesToSubmit || imagesToSubmit.length === 0) {
//       toast.error('Please upload at least one image');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append(
//         'imgUrls',
//         JSON.stringify(imagesToSubmit.map((img) => img.url))
//       );

//       console.log('Submitting image data:', {
//         imgUrls: imagesToSubmit.map((img) => img.url),
//       });

//       // const res = await addAvatar(formData);
//     } catch (error) {
//       console.error('Submission error:', error);
//       toast.error('Failed to save images');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setSelectedFile(file);
//     setIsUploading(true);
//     setFiles([file]);
//     try {
//       const uploadResult = await startUpload([file]);

//       if (uploadResult && uploadResult[0]) {
//         const uploadedUrl = uploadResult[0].ufsUrl;
//         setUploadedImageUrl(uploadedUrl);

//         await submitAvatarData(uploadResult);

//         toast.success('Image uploaded successfully!', {
//           style: {
//             backgroundColor: '#22c55e',
//             color: 'white',
//           },
//         });
//       }

//     } catch (error) {
//       console.error('Upload failed:', error);
//       toast.error('Failed to upload image', {
//         style: {
//           backgroundColor: 'var(--destructive)',
//           color: 'white',
//         },
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const SubmitButton = () => {
//     const { pending, data } = useFormStatus();

//     return (
//       <Button disabled={pending} className='' variant='outline' type='submit'>
//         {pending ? (
//           <>
//             <Loader className='mr-2 h-4 w-4 animate-spin' />
//             Submitting...
//           </>
//         ) : (
//           'Add Avatar'
//         )}
//       </Button>
//     );
//   };

//   const onSubmit = async (data: any) => {
//     console.log('onSubmit is triggered!!', data);

//     if (!data.avatar || data.avatar.length === 0) {
//       if (files.length === 0) {
//         toast.error('Please upload at least one image');
//       }
//     } else if (files.length > 0) {
//       setIsUploading(true);
//       await startUpload(files);
//     } else if (data.avatar) {
//       let arrAvatar = [];
//       if (data.avatar) {
//         arrAvatar.push(data.avatar);
//       }
//       const res = arrAvatar.map((a) => ({
//         url: a[0],
//       }));

//       await submitAvatarData(res);
//     }
//   };

//   // const avatar = form.watch('avatar');

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Avatar
//           className='group relative h-14 w-14'
//           onClick={() => console.log('avatar')}
//         >
//           <AvatarImage
//             src={session.user.image || localAvatar}
//             className='group-hover:bg-accent/50 group-hover:cursor-pointer group-hover:backdrop-blur-sm'
//           />
//           <AvatarFallback>{session.user.name}</AvatarFallback>

//           <Camera
//             size={20}
//             className='bg-accent/50 absolute -right-0 bottom-0 hidden w-full text-stone-100/70 group-hover:block group-hover:cursor-pointer'
//           />
//         </Avatar>
//       </DialogTrigger>

//       <DialogContent className='bg-emerald-100/10 shadow-lg backdrop-blur-lg sm:max-w-[425px]'>
//         <form action={action} className='space-y-4'>
//           <DialogHeader>
//             <DialogTitle>Edit profile</DialogTitle>
//             <DialogDescription>
//               Upload a new avatar image. The image will be uploaded
//               automatically when selected.
//             </DialogDescription>
//           </DialogHeader>

//           <div className='grid gap-4'>
//             <div className='grid gap-3' {...getRootProps()}>
//               <Label htmlFor='user-avatar'>Avatar Image</Label>

//               {/* File input */}
//               <InputCustom {...getInputProps()} onChange={handleImageChange} />
//               <div className='space-y-4'>
//                 <p>Drag & drop files here, or click to select files</p>

//                 {/* Display selected files */}
//                 {files.length > 0 && files.length < 6 ? (
//                   <div>
//                     <p>Selected {files.length} file(s)</p>
//                     <div className='mt-2 flex flex-wrap justify-center gap-2'>
//                       {files.map((img, i) => (
//                         <div key={i} className='relative flex flex-col'>
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

//               {/* Upload status */}
//               {isUploading && (
//                 <div className='text-muted-foreground flex items-center gap-2 text-sm'>
//                   <Upload className='h-4 w-4 animate-pulse' />
//                   Uploading image...
//                 </div>
//               )}

//               {/* Preview uploaded image */}
//               {uploadedImageUrl && (
//                 <div className='space-y-2'>
//                   <Label className='text-sm text-green-600'>
//                     Image uploaded successfully!
//                   </Label>
//                   <div className='flex items-center gap-3'>
//                     <Avatar className='h-12 w-12'>
//                       <AvatarImage src={uploadedImageUrl} />
//                       <AvatarFallback>Preview</AvatarFallback>
//                     </Avatar>
//                     <div className='text-muted-foreground text-xs break-all'>
//                       {uploadedImageUrl}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Hidden input to pass the uploaded URL to the form */}
//               {uploadedImageUrl && (
//                 <input
//                   type='hidden'
//                   name='avatarUrl'
//                   value={uploadedImageUrl}
//                 />
//               )}
//             </div>
//           </div>

//           <DialogFooter>
//             <DialogClose asChild>
//               <Button type='button' variant='outline'>
//                 Cancel
//               </Button>
//             </DialogClose>
//             <SubmitButton />
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddAvatarForm;

// import {
//   useActionState,
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import { addAvatar } from '@/actions/auth-actions';
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
//   Button,
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   InputCustom,
//   Label,
// } from '@/components/ui';
// import { fileAtoms } from '@/lib/jotai/blog-atoms';
// import { useUploadThing } from '@/lib/uploadthing';
// import { useDropzone } from '@uploadthing/react';
// import { useAtom } from 'jotai';
// import { Camera, Loader, Upload, X } from 'lucide-react';
// import { Session } from 'next-auth';
// import Image from 'next/image';
// import { useFormStatus } from 'react-dom';
// import { toast } from 'sonner';
// import {
//   generateClientDropzoneAccept,
//   generatePermittedFileTypes,
// } from 'uploadthing/client';

// export type ImageData = {
//   url: string;
//   // key: string;
// };

// type AddAvatarFormProps = {
//   session: Session;
// };

// const AddAvatarForm = ({ session }: AddAvatarFormProps) => {
//   const [data, action] = useActionState(addAvatar, {
//     error: false,
//     message: '',
//   });
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   // State for uploaded image URL and upload status
//   const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [files, setFiles] = useAtom(fileAtoms);
//   const [images, setImages] = useState<ImageData[] | []>([]);

//   const maxImages = 1;

//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       setFiles(acceptedFiles);
//     },
//     [setFiles]
//   );

//   // const {
//   //   startUpload,
//   //   isUploading: utIsUploading,
//   //   routeConfig,
//   // } = useUploadThing('imageUploader', {
//   //   onClientUploadComplete: (res) => {
//   //     console.log('Files uploaded successfully:', res);

//   //     runUploadThing(files);
//   //     if (res?.[0]?.ufsUrl) {
//   //       setUploadedImageUrl(res[0].ufsUrl);
//   //       toast.success('Image uploaded successfully!', {
//   //         style: {
//   //           backgroundColor: '#22c55e',
//   //           color: 'white',
//   //         },
//   //       });
//   //     }

//   //     setIsUploading(false);
//   //   },
//   //   onUploadError: (error) => {
//   //     console.error('Upload error:', error);
//   //     toast.error(`Upload failed: ${error.message}`, {
//   //       style: {
//   //         backgroundColor: 'var(--destructive)',
//   //         color: 'white',
//   //       },
//   //     });
//   //     setIsUploading(false);
//   //   },
//   //   onUploadBegin: (name) => {
//   //     console.log('Upload started for:', name);
//   //     setIsUploading(true);
//   //   },
//   // });

//   const { startUpload, routeConfig } = useUploadThing('imageUploader', {
//     onClientUploadComplete: (res) => {
//       runUploadThing(res);
//       const newAvatar = (res ?? [])
//         .map((file) => ({
//           url: file.ufsUrl || file.url,
//         }))
//         .slice(0, maxImages);
//       // form.setValue('avatar', newAvatar[0]?.url || '', {
//       //   shouldValidate: true,
//       //   shouldDirty: true,
//       // });
//       setFiles([]);
//       setIsUploading(false);
//       toast.success('Upload completed successfully!');
//     },
//     onUploadError: (error) => {
//       setIsUploading(false);
//       console.error('Upload error:', error);
//       if (error.message.includes('Failed to register metadata')) {
//         toast.error('Invalid file selection. Please choose a valid image.');
//       } else {
//         toast.error(`Upload failed: ${error.message}`);
//       }
//     },
//     onUploadBegin: () => {
//       setIsUploading(true);
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
//       // form.setValue('images', newImages, {
//       //   shouldValidate: true,
//       //   shouldDirty: true,
//       // });

//       toast.success('Upload completed successfully!');
//       setFiles([]);
//       // submitBannerData(newImages);
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

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setSelectedFile(file);

//     try {
//       // Just trigger the upload, callbacks will handle the rest
//       const uploaded = await startUpload([file]);
//       uploaded?.forEach((f) => {
//         setImages([{ url: f.ufsUrl }]);
//       });
//       setFiles([file]);
//     } catch (error) {
//       console.error('StartUpload failed:', error);
//       setIsUploading(false);
//     }
//   };

//   useEffect(() => {
//     if (data?.message) {
//       if (data?.error) {
//         toast.error(data?.message, {
//           style: {
//             backgroundColor: 'var(--destructive)',
//             color: 'white',
//           },
//           description: 'Please try again',
//           descriptionClassName: 'text-xs',
//         });
//       } else {
//         toast.success(data?.message, {
//           style: {
//             backgroundColor: '#22c55e',
//             color: 'white',
//           },
//           description: 'Success',
//           descriptionClassName: 'text-xs',
//         });
//         // Reset states after successful submission
//         setUploadedImageUrl('');
//         setSelectedFile(null);
//       }
//     }
//   }, [data?.error, data?.message]);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: generateClientDropzoneAccept(
//       generatePermittedFileTypes(routeConfig).fileTypes
//     ),
//   });

//   const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     setFiles([]);
//   };

//   const SubmitButton = () => {
//     const { pending } = useFormStatus();

//     return (
//       <Button
//         // disabled={pending || !uploadedImageUrl || isUploading || utIsUploading}
//         className=''
//         variant='outline'
//         type='submit'
//       >
//         {pending ? (
//           <>
//             <Loader className='mr-2 h-4 w-4 animate-spin' />
//             Submitting...
//           </>
//         ) : (
//           'Update Avatar'
//         )}
//       </Button>
//     );
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Avatar
//           className='group relative h-14 w-14'
//           onClick={() => console.log('avatar')}
//         >
//           <AvatarImage
//             src={session.user.image || localAvatar}
//             className='group-hover:bg-accent/50 group-hover:cursor-pointer group-hover:backdrop-blur-sm'
//           />
//           <AvatarFallback>{session.user.name}</AvatarFallback>

//           <Camera
//             size={20}
//             className='bg-accent/50 absolute -right-0 bottom-0 hidden w-full text-stone-100/70 group-hover:block group-hover:cursor-pointer'
//           />
//         </Avatar>
//       </DialogTrigger>

//       <DialogContent className='bg-white/5 backdrop-blur-xl sm:max-w-[425px]'>
//         <form action={action}>
//           <DialogHeader>
//             <DialogTitle>Edit profile</DialogTitle>
//             <DialogDescription>
//               Upload a new avatar image. The image will be uploaded
//               automatically when selected.
//             </DialogDescription>
//           </DialogHeader>

//           <div className='grid gap-4'>
//             <div className='grid gap-3' {...getRootProps()}>
//               <Label htmlFor='user-avatar'>Avatar Image</Label>

//               {/* File input */}
//               <InputCustom
//                 {...getInputProps()}
//                 ref={fileInputRef}
//                 type='file'
//                 accept='image/*'
//                 id='user-avatar'
//                 name='avatar'
//                 onChange={handleImageChange}
//                 autoComplete='off'
//                 disabled={isUploading}
//               />

//               {/* Upload status */}
//               {isUploading && (
//                 <div className='text-muted-foreground flex items-center gap-2 text-sm'>
//                   <Upload className='h-4 w-4 animate-pulse' />
//                   Uploading image...
//                 </div>
//               )}

//               {/* Preview uploaded image */}
//               {files.length !== 0 && (
//                 <div className='space-y-2'>
//                   <Label className='text-sm text-green-600'>
//                     Image uploaded successfully!
//                   </Label>
//                   <div className='flex items-center gap-3'>
//                     {/* <Avatar className='h-12 w-12'>
//                       <AvatarImage src={uploadedImageUrl} />
//                       <AvatarFallback>Preview</AvatarFallback>
//                     </Avatar> */}
//                     <div className='relative flex w-full flex-col'>
//                       <Image
//                         src={URL.createObjectURL(files[0]) || '/img/noimg.svg'}
//                         alt='image'
//                         width={100}
//                         height={25}
//                         priority
//                       />
//                       <Button
//                         type='button'
//                         onClick={(e) => handleRemoveImage(e)}
//                         className='absolute top-0 right-0 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
//                         disabled={isUploading}
//                       >
//                         <X className='svg h-4 w-4 cursor-pointer stroke-pink-500 hover:stroke-pink-700 hover:stroke-4' />
//                       </Button>
//                     </div>
//                     <div className='text-muted-foreground text-xs break-all'>
//                       {uploadedImageUrl}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Hidden input to pass the uploaded URL to the form */}
//               {uploadedImageUrl && (
//                 <input
//                   type='hidden'
//                   name='avatarUrl'
//                   value={uploadedImageUrl}
//                 />
//               )}
//             </div>
//           </div>

//           <DialogFooter>
//             <DialogClose asChild>
//               <Button type='button' variant='outline'>
//                 Cancel
//               </Button>
//             </DialogClose>
//             <SubmitButton />
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddAvatarForm;

import { useCallback, useEffect, useRef, useState } from 'react';

import { addAvatar } from '@/actions/auth-actions';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  InputCustom,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { localAvatar, maxAvatarImages } from '@/lib/constants';
import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { userAtom } from '@/lib/jotai/user-atoms';
import { AvatarSchema, avatarSchema } from '@/lib/schemas/auth-schemas';
import { useUploadThing } from '@/lib/uploadthing';
import { useAtom } from 'jotai';
import { Camera, Loader, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

type ImageData = {
  src: string;
  id: string;
};

type AddAvatarFormProps = {};

const AddAvatarForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useAtom(imageAtoms);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // For local preview
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog state
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [user, setUser] = useAtom(userAtom);

  const { data: session, update } = useSession();
  const router = useRouter();
  const form = useZodForm({
    schema: avatarSchema,
    mode: 'onChange',
    defaultValues: {
      avatar: session?.user.avatar || '',
    },
  });

  const { startUpload, routeConfig } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      // Handle successful upload
      const newImages = (res ?? [])
        .map((file) => ({
          src: file.ufsUrl || file.url,
          id: file.key,
        }))
        .slice(0, maxAvatarImages);

      setImages(newImages);

      update({
        ...session,
        user: {
          ...session?.user,
          avatar: newImages[0].src,
        },
      });

      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: newImages[0].src,
        };
      });

      // Set form value to the uploaded URL
      form.setValue('avatar', newImages[0]?.src || '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      setIsUploading(false);
      toast.success('Upload completed successfully!');

      // Continue with form submission after upload
      handleFormSubmission(newImages[0]?.src);
    },
    onUploadError: (error) => {
      setIsUploading(false);
      console.error('Upload error:', error);
      if (error.message.includes('Failed to register metadata')) {
        toast.error('Invalid file selection. Please choose a valid image.');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    },
    onUploadBegin: () => {
      setIsUploading(true);
      toast.info('Uploading image...');
    },
  });

  // Handle file selection without uploading
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.slice(0, maxAvatarImages);
    if (validFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }

    setFiles(validFiles);

    // Create preview URL for selected file
    const file = validFiles[0];
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);

    // Set a temporary value in the form to indicate file is selected
    form.setValue('avatar', 'file-selected', {
      shouldValidate: true,
      shouldDirty: true,
    });

    toast.success('Image selected. Click submit to upload and save.');

    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 100); // Small delay to ensure DOM is updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
    maxFiles: maxAvatarImages,
  });
  const handleRemoveImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    i?: string
  ) => {
    e.stopPropagation();
    setFiles([]);
    if (previewUrl === i) setPreviewUrl('');
    form.setValue('avatar', '');
  };
  // Handle the actual form submission after upload
  const handleFormSubmission = async (avatarUrl: string) => {
    if (!avatarUrl) {
      toast.error('Upload failed - no URL received');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('avatar', avatarUrl);

      console.log('Submitting avatar URL:', avatarUrl);

      const res = await addAvatar(formData);

      if (res?.error) {
        toast.error(res?.message);
      } else {
        toast.success(res?.message || 'Avatar updated successfully!');
        // Reset form after successful submission
        form.reset();
        setImages([]);
        setFiles([]);
        setPreviewUrl('');
        // Close the dialog
        router.refresh();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    const hasSelectedFile = files.length > 0;

    return (
      <Button
        ref={submitButtonRef}
        disabled={pending || isUploading || isSubmitting || !hasSelectedFile}
        variant='outline'
        type='submit'
        className='focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      >
        {isUploading ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Uploading...
          </>
        ) : isSubmitting ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Saving...
          </>
        ) : (
          'Upload & Save Avatar'
        )}
      </Button>
    );
  };

  // Form submission handler - triggers upload first
  const onSubmit = async (data: AvatarSchema) => {
    if (files.length === 0) {
      toast.error('Please select an image first');
      return;
    }

    // Start the upload process
    try {
      await startUpload(files);
      // The rest will be handled in onClientUploadComplete
    } catch (error) {
      console.error('Failed to start upload:', error);
      toast.error('Failed to start upload');
      setIsUploading(false);
    }
  };

  // Focus submit button when file is selected
  useEffect(() => {
    if (files.length > 0) {
      // Small delay to ensure the button is rendered and enabled
      const timeoutId = setTimeout(() => {
        submitButtonRef.current?.focus();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [files.length]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Cleanup function when dialog closes
  const handleDialogClose = () => {
    // Reset all states when dialog closes
    setFiles([]);
    setPreviewUrl('');
    form.reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const imgAvatar =
    (session?.user.avatar ? session?.user.avatar : user?.avatar) || localAvatar;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          handleDialogClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Avatar
          className='group relative h-14 w-14 cursor-pointer border'
          onClick={() => setIsDialogOpen(true)}
        >
          <AvatarImage
            src={user?.avatar}
            className='group-hover:bg-accent/50 rounded-full p-1 group-hover:backdrop-blur-sm'
          />
          <AvatarFallback>{user?.name}</AvatarFallback>
          <Camera
            size={20}
            className='bg-accent/50 absolute -right-0 bottom-0 hidden w-full text-stone-100/70 group-hover:block'
          />
        </Avatar>
      </DialogTrigger>

      <DialogContent className='bg-white/5 backdrop-blur-xl sm:max-w-[425px]'>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
            <DialogDescription>
              Select an image file. It will be uploaded when you click submit.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Dropzone area */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${files.length > 0 ? 'border-green-500 bg-green-50/10' : 'border-gray-300 hover:border-gray-400'} `}
            >
              <InputCustom {...getInputProps()} />
              {files.length > 0 ? (
                <div className='space-y-2'>
                  <p className='text-sm text-green-600'>
                    ✓ Image selected: {files[0].name}
                  </p>
                  <div className='relative mx-auto w-fit'>
                    <Image
                      src={URL.createObjectURL(files[0])}
                      width={0}
                      height={0}
                      priority
                      alt='preview avatar'
                      className='svg'
                      style={{ width: '100px', height: 'auto' }}
                    />
                    <Button
                      type='button'
                      onClick={(e) => handleRemoveImage(e, previewUrl)}
                      className='absolute top-0 -right-0 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
                      disabled={isUploading}
                    >
                      <X className='svg h-4 w-4 cursor-pointer stroke-pink-500 hover:stroke-pink-700 hover:stroke-4' />
                    </Button>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Click submit to upload and save
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Camera className='text-muted-foreground mx-auto h-8 w-8' />
                  <p className='text-muted-foreground text-sm'>
                    Drop an image here, or click to select
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Max file size: 4MB
                  </p>
                </div>
              )}
            </div>

            {/* Preview selected image */}
            {/* {previewUrl && (
              <div className='flex justify-center'>
                <div className='relative space-y-2'>
                  <Label className='text-sm'>Preview:</Label>
                  <Avatar className='h-20 w-20'>
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>

                  <Button
                    type='button'
                    onClick={(e) => handleRemoveImage(e, previewUrl)}
                    className='absolute top-8 -right-2 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
                    disabled={isUploading}
                  >
                    <X className='svg h-4 w-4 cursor-pointer stroke-pink-500 hover:stroke-pink-700 hover:stroke-4' />
                  </Button>
                </div>
              </div>
            )} */}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AddAvatarForm;
