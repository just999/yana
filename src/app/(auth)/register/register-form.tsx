'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { register } from '@/actions/auth-actions';
import {
  Button,
  Checkbox,
  InputCustom,
  InputPassword,
  Label,
} from '@/components/ui';
import { maxAvatarImages, registerDefaultValues } from '@/lib/constants';
import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { useDropzone } from '@uploadthing/react';
import { useAtom } from 'jotai';
import { Camera, Loader, Mail, X } from 'lucide-react';
import type { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

type RegisterFormProps = {
  session: Session;
};

const RegisterForm = ({ session }: RegisterFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useAtom(imageAtoms);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [data, action] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      try {
        if (files.length === 1) {
          formData.set('avatar', avatarUrl);
        }

        const uploadRes = await startUpload(files);

        const newAvatarUrl = uploadRes?.[0].ufsUrl || '';

        // Set state for UI updates
        setAvatarUrl(newAvatarUrl);

        // Set FormData with the actual uploaded URL
        formData.set('avatar', newAvatarUrl);

        const res = await register(prevState, formData);

        if (!res.error) {
          setFiles([]);
          setPreviewUrl('');
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
        }

        return res;
      } catch (err) {
        return {
          error: true,
          message: 'Registration failed',
        };
      }
    },
    {
      error: false,
      message: '',
    }
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (data.message) {
      if (data.error) {
        toast.error(data.message, {
          style: {
            backgroundColor: 'var(--destructive)',
            color: 'white',
          },
          description: 'Please try again, mutherfunker',
          descriptionClassName: 'text-xs',
        });
      } else {
        toast.success(data.message, {
          style: {
            backgroundColor: '#22c55e',
            color: 'white',
          },
          description: 'Success',
          descriptionClassName: 'text-xs',
        });
      }
    }
  }, [data.error, data.message]);

  const RegisterButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        disabled={pending}
        className='w-full'
        variant='outline'
        type='submit'
      >
        {pending ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    );
  };

  const { startUpload, routeConfig } = useUploadThing(
    'registrationImageUploader',
    {
      onClientUploadComplete: (res) => {
        // Handle successful upload
        const newImages = (res ?? [])
          .map((file) => ({
            src: file.ufsUrl || file.url,
            id: file.key,
          }))
          .slice(0, maxAvatarImages);

        setImages(newImages);
        const newAvatarUrl = newImages[0]?.src;
        setAvatarUrl(newAvatarUrl);

        setIsUploading(false);
        toast.success('Upload completed successfully!');

        // Continue with form submission after upload
        // handleFormSubmission(avatarUrl);
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
    }
  );

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

    toast.success('Image selected. Click submit to upload and save.');

    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 100); // Small delay to ensure DOM is updated
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
    // form.setValue('avatar', '');
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

      // const res = await addAvatar(formData);

      // if (res?.error) {
      //   toast.error(res?.message);
      // } else {
      //   toast.success(res?.message || 'Avatar updated successfully!');
      //   // Reset form after successful submission
      //   // form.reset();
      //   setImages([]);
      //   setFiles([]);
      //   setPreviewUrl('');
      //   // Close the dialog
      //   // setIsDialogOpen(false);
      // }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session) {
    router.back();
    return null;
  }

  return (
    <form action={action} className='space-y-4' ref={formRef}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='grid w-[398px] grid-cols-2 gap-4'>
        <div className='w-[398px] space-y-2'>
          <Label htmlFor='name'>name</Label>
          <InputCustom
            className='w-full'
            defaultValue={registerDefaultValues.name}
            id='name'
            name='name'
            placeholder='nama'
            // required
          />
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <InputCustom
          defaultValue={registerDefaultValues.email}
          id='email'
          name='email'
          placeholder='m@example.com'
          type='email'
          // required
          suffix={<Mail size={20} className='absolute right-2 text-zinc-400' />}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <InputPassword
          defaultValue={registerDefaultValues.password}
          id='password'
          name='password'
          // required
          autoComplete='off'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>Confirm password</Label>
        <InputPassword
          defaultValue={registerDefaultValues.confirmPassword}
          id='confirmPassword'
          name='confirmPassword'
          // required
          autoComplete='off'
        />
      </div>
      <div
        className={cn(
          'cursor-pointer space-y-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          files.length > 0
            ? 'border-green-500 bg-green-50/10'
            : 'border-gray-300 hover:border-gray-400'
        )}
        {...getRootProps()}
      >
        <Label htmlFor='avatar'>Avatar</Label>
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
                className='absolute -top-1 -right-4 h-6 w-6 cursor-pointer rounded-full border border-red-400 bg-red-200/40 text-white hover:bg-transparent'
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
            <p className='text-muted-foreground text-xs'>Max file size: 4MB</p>
          </div>
        )}
      </div>
      <div className='space-y-2'>
        <Label className='text-base'>Account Privacy</Label>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='anonymous'
            name='anonymous'
            defaultChecked={registerDefaultValues.anonymous}
          />
          <label
            htmlFor='anonymous'
            className='text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Enable anonymous posting (your profile will remain hidden)
          </label>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='terms'
          name='terms'
          defaultChecked={registerDefaultValues.terms}
          required
        />
        <label
          htmlFor='terms'
          className='text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          I agree to the{' '}
          <Link
            href='/terms'
            className='text-primary hover:text-primary/90 underline underline-offset-4'
          >
            terms of service
          </Link>{' '}
          and{' '}
          <Link
            href='/privacy'
            className='text-primary hover:text-primary/90 underline underline-offset-4'
          >
            privacy policy
          </Link>
        </label>
      </div>

      <div className='flex flex-col'>
        {/* <Button className='w-full' variant={'secondary'} type='submit'>
          Create Account
        </Button> */}
        <RegisterButton />
        <p className='text-muted-foreground mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='text-primary font-medium underline-offset-4 hover:underline'
          >
            Sign in
          </Link>
        </p>
      </div>
      {data && data.error && (
        <div className='text-destructive text-center'>{data.message}</div>
      )}
    </form>
  );
};

export default RegisterForm;
