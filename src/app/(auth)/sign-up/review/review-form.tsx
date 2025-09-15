'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { submitSignInAction } from '@/actions/auth-actions';
import SubmitButton from '@/components/submit-button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Checkbox,
} from '@/components/ui';
import { maxAvatarImages, registerDefaultValues } from '@/lib/constants';
import { useSignInContext } from '@/lib/contexts/user-sign-in-context';
import { fileAvatarAtom, signInErrorAtom } from '@/lib/jotai/auth-atoms';
import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { userAtom } from '@/lib/jotai/user-atoms';
import { useUploadThing } from '@/lib/uploadthing';
import { useDropzone } from '@uploadthing/react';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

type ReviewFormProps = {};

const ReviewForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useAtom(imageAtoms);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [curUser, setCurUser] = useAtom(userAtom);

  const {
    updateUserDetails,
    userSignInData,
    resetLocalStorage,
    resetUserSignInData,
  } = useSignInContext();

  const {
    name,
    email,
    password,
    confirmPassword,
    anonymous,
    avatar,
    avatarFile,
    phone,
    school,
    city,
    address,
    major,
  } = userSignInData;
  const [fileAvatar, setFileAvatar] = useAtom(fileAvatarAtom);
  const [validationErrors, setValidationErrors] = useAtom(signInErrorAtom);
  const [data, action, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      try {
        if (avatarFile && avatarFile?.length === 1) {
          formData.set('avatar', avatarUrl);
        }

        const uploadRes = avatarFile && (await startUpload(avatarFile));

        const newAvatarUrl = uploadRes?.[0].ufsUrl || '';

        setAvatarUrl(newAvatarUrl);

        formData.set('avatar', newAvatarUrl);

        const res = await submitSignInAction(prevState, formData);
        const { redirect, error, message, data: dataErrors } = res;

        if (!error) {
          setFiles([]);
          setPreviewUrl('');
          resetLocalStorage();
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          // const userData = res.data as {
          //   name: string;
          //   email: string;
          //   avatar?: string;
          //   anonymous?: boolean;
          //   role?: string;
          //   school?: string;
          //   major?: string;
          //   phone?: string;
          //   address?: string;
          //   city?: string;
          // };

          // setCurUser({
          //   name: userData.name,
          //   email: userData.email,
          //   avatar: userSignInData.avatar ?? undefined,
          //   anonymous: userSignInData.anonymous,
          //   role: userSignInData.role || 'USER',
          //   school: userSignInData.school ?? undefined,
          //   major: userSignInData.major ?? undefined,
          //   phone: userSignInData.phone ?? undefined,
          //   address: userSignInData.address ?? undefined,
          //   city: userSignInData.city ?? undefined,
          // });
          toast.success(message);
        }
        if (error && message) {
          toast.error(message);
        }

        if (error && data) {
          setValidationErrors(dataErrors as typeof validationErrors);
        }

        if (redirect) {
          router.refresh();
          router.push(redirect);
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
    if (data?.message) {
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

        if (data.result) {
          const userData = data.result as {
            name: string;
            email: string;
            avatar?: string;
            anonymous?: boolean;
            role?: string;
            school?: string;
            major?: string;
            phone?: string;
            address?: string;
            city?: string;
          };

          setCurUser({
            name: userData.name,
            email: userData.email,
            avatar: userSignInData.avatar ?? undefined,
            anonymous: userSignInData.anonymous,
            role: userSignInData.role || 'USER',
            school: userSignInData.school ?? undefined,
            major: userSignInData.major ?? undefined,
            phone: userSignInData.phone ?? undefined,
            address: userSignInData.address ?? undefined,
            city: userSignInData.city ?? undefined,
          });
        }
      }
    }
  }, [
    data.error,
    data.message,
    data.result,
    setCurUser,
    userSignInData.address,
    userSignInData.anonymous,
    userSignInData.avatar,
    userSignInData.city,
    userSignInData.major,
    userSignInData.phone,
    userSignInData.role,
    userSignInData.school,
  ]);

  const { startUpload, routeConfig } = useUploadThing(
    'registrationImageUploader',
    {
      onClientUploadComplete: (res) => {
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
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAvatar = avatar ? (
    <Avatar>
      <AvatarImage
        src={avatarFile && URL.createObjectURL(avatarFile[0])}
        alt='avatar'
      />
      <AvatarFallback>{'sign in avatar'}</AvatarFallback>
    </Avatar>
  ) : (
    ''
  );

  const CHECKBOX_FIELDS = [
    'anonymous',
    'agreeToTerms',
    'newsletter',
    'subscribeToUpdates',
  ];

  return (
    <form action={action} className='space-y-4' ref={formRef}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />

      {Object.entries(userSignInData).map(([key, value]) => {
        // Handle checkbox fields
        if (CHECKBOX_FIELDS.includes(key)) {
          return (
            <input
              key={key}
              type='hidden'
              name={key}
              value={value ? 'true' : 'false'}
            />
          );
        }

        if (key === 'avatar') {
          return (
            <div {...getRootProps()} key={key}>
              <input {...getInputProps()} name='avatar' type='file' />
            </div>
          );
        }

        // Handle regular fields
        return (
          <input
            key={key}
            type='hidden'
            name={key}
            value={String(value || '')}
          />
        );
      })}

      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        Name:
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {' '}
          {name}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        Email:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {email}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        anonymous:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {' '}
          {anonymous ? 'yes' : 'No'}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        avatar: {isAvatar}
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        phone:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {phone}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        school:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {' '}
          {school}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        city:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {' '}
          {city}
        </span>
      </p>
      <p className='flex items-start gap-2 text-nowrap text-white/90'>
        address:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-wrap text-sky-600'>
          {' '}
          {address}
        </span>
      </p>
      <p className='flex items-center gap-2 text-nowrap text-white/90'>
        major:{' '}
        <span className='rounded-sm bg-blue-700/10 px-2 font-semibold text-sky-600'>
          {major}
        </span>
      </p>
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
        <SubmitButton
          value='create account'
          submittingText='Creating account...'
        />
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
      {data && data?.error && (
        <div className='text-destructive text-center'>{data?.message}</div>
      )}
      {!data.error && data?.message && (
        <div className='w-full rounded-lg bg-green-700/20 text-center text-emerald-400'>
          {data?.message}
        </div>
      )}
    </form>
  );
};

export default ReviewForm;
