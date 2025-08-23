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
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

      form.setValue('avatar', newImages[0]?.src || '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      setIsUploading(false);
      toast.success('Upload completed successfully!');

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.slice(0, maxAvatarImages);
    if (validFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }

    setFiles(validFiles);

    const file = validFiles[0];
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);

    form.setValue('avatar', 'file-selected', {
      shouldValidate: true,
      shouldDirty: true,
    });

    toast.success('Image selected. Click submit to upload and save.');

    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 100);
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

        form.reset();
        setImages([]);
        setFiles([]);
        setPreviewUrl('');

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

  const onSubmit = async (data: AvatarSchema) => {
    if (files.length === 0) {
      toast.error('Please select an image first');
      return;
    }

    try {
      await startUpload(files);
    } catch (error) {
      console.error('Failed to start upload:', error);
      toast.error('Failed to start upload');
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      const timeoutId = setTimeout(() => {
        submitButtonRef.current?.focus();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [files.length]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDialogClose = () => {
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
