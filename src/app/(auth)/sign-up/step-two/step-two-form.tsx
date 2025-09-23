'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { stepTwoFormAction } from '@/actions/auth-actions';
import SubmitButton from '@/components/submit-button';
import { Button, Checkbox, InputCustom, Label } from '@/components/ui';
import { maxAvatarImages, registerDefaultValues } from '@/lib/constants';
import { useSignInContext } from '@/lib/contexts/user-sign-in-context';
import { fileAvatarAtom, signInErrorAtom } from '@/lib/jotai/auth-atoms';
import { imageAtoms } from '@/lib/jotai/blog-atoms';
import { FormErrors } from '@/lib/types';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { AlertCircle, Camera, Mail, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

import RegisterFormSkeleton from '../../loading';

type StepTwoFormProps = unknown;

const StepTwoForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileAvatar, setFileAvatar] = useAtom(fileAvatarAtom);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useAtom(imageAtoms);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [clearedErrors, setClearedErrors] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useAtom(signInErrorAtom);
  const initialState: FormErrors = {};
  const [state, action] = useActionState(stepTwoFormAction, initialState);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { userSignInData, updateUserDetails, dataLoaded } = useSignInContext();

  const getFieldErrorFromJotai = (fieldName: string): string | null => {
    if (
      validationErrors?.fieldErrors &&
      typeof validationErrors.fieldErrors === 'object'
    ) {
      return (
        (validationErrors.fieldErrors as Record<string, string | undefined>)[
          fieldName
        ] || null
      );
    }

    if (
      validationErrors &&
      typeof validationErrors === 'object' &&
      !validationErrors.fieldErrors
    ) {
      return (
        (validationErrors as Record<string, string | null>)[fieldName] || null
      );
    }

    return null;
  };

  const getFieldError = (fieldName: string): string | null => {
    if (clearedErrors.has(fieldName)) {
      return null;
    }

    const jotaiError = getFieldErrorFromJotai(fieldName);
    if (jotaiError) {
      return jotaiError;
    }

    return state?.[fieldName] || null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | boolean,
    fieldName?: string
  ) => {
    let targetFieldName: string;
    let fieldValue: any;

    if (typeof e === 'boolean' && fieldName) {
      targetFieldName = fieldName;
      fieldValue = e;
    } else if (typeof e === 'object' && e.target) {
      const { name, value, type, checked, files } = e.target;
      targetFieldName = name;

      switch (type) {
        case 'checkbox':
          fieldValue = checked;
          break;
        case 'file':
          fieldValue = files?.[0] || null;
          break;
        case 'number':
          fieldValue = value ? parseFloat(value) : '';
          break;
        case 'email':
        case 'text':
        case 'password':
        default:
          fieldValue = value;
          break;
      }
    } else {
      console.error('Invalid input change event', e);
      return;
    }

    updateUserDetails({ [targetFieldName]: fieldValue });

    setClearedErrors((prev) => new Set(prev).add(targetFieldName));

    if (validationErrors?.fieldErrors?.[targetFieldName]) {
      setValidationErrors((prev) => {
        if (!prev?.fieldErrors) return prev;

        return {
          ...prev,
          fieldErrors: {
            ...prev.fieldErrors,
            [targetFieldName]: null,
          },
        };
      });
    }
  };

  useEffect(() => {
    const initializeDefaults = () => {
      const defaultsToSet: Record<string, string> = {};
      const LOCAL_STORAGE_KEY = 'multi-page-form-user-sign-in';

      if (
        (!userSignInData?.school || userSignInData.school === '') &&
        registerDefaultValues.school
      ) {
        defaultsToSet.school = registerDefaultValues.school;
      }
      if (
        (!userSignInData?.major || userSignInData.major === '') &&
        registerDefaultValues.major
      ) {
        defaultsToSet.major = registerDefaultValues.major;
      }
      if (
        (!userSignInData?.avatar || userSignInData.avatar === '') &&
        registerDefaultValues.avatar
      ) {
        defaultsToSet.avatar = registerDefaultValues.avatar;
      }
      if (
        (!userSignInData?.anonymous || userSignInData.anonymous === null) &&
        registerDefaultValues.anonymous
      ) {
        defaultsToSet.anonymous = String(registerDefaultValues.anonymous);
      }

      if (Object.keys(defaultsToSet).length > 0) {
        updateUserDetails(defaultsToSet);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultsToSet));
      }
    };

    initializeDefaults();
  }, []);

  const shouldShowError = (fieldName: string) => {
    return state?.[fieldName] && !clearedErrors.has(fieldName);
  };

  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setClearedErrors(new Set());
    }
  }, [validationErrors]);

  useEffect(() => {
    if (validationErrors?.fieldErrors) {
      const firstErrorField = Object.keys(validationErrors.fieldErrors)[0];
      if (firstErrorField && inputRefs.current[firstErrorField]) {
        inputRefs.current[firstErrorField]?.focus();
      }
    }
  }, [validationErrors]);

  const getErrorClassName = (fieldName: string) => {
    return shouldShowError(fieldName)
      ? 'border-2 border-red-700/50 bg-pink-900/5'
      : '';
  };

  const handleCheckboxChange = (
    checked: boolean | string,
    fieldName: string
  ) => {
    let booleanValue: boolean;

    if (typeof checked === 'string') {
      booleanValue = checked === 'true' || checked === 'on';
    } else {
      booleanValue = checked === true;
    }

    updateUserDetails({ [fieldName]: booleanValue });
  };
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.slice(0, maxAvatarImages);
      if (validFiles.length === 0) {
        toast.error('No valid files selected');
        return;
      }

      const file = validFiles[0];
      const previewURL = URL.createObjectURL(file);

      setFiles(validFiles);
      setFileAvatar(validFiles);
      setPreviewUrl(previewURL);

      updateUserDetails({
        avatarFile: validFiles,
        avatar: previewURL,
      });

      toast.success('Image selected. Click submit to upload and save.');

      setTimeout(() => {
        submitButtonRef.current?.focus();
      }, 100);
    },
    [updateUserDetails]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
    maxFiles: maxAvatarImages,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (userSignInData.avatar?.startsWith('blob:')) {
        URL.revokeObjectURL(userSignInData.avatar);
      }
    };
  }, [previewUrl, userSignInData.avatar]);

  const handleRemoveImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    i?: string
  ) => {
    e.stopPropagation();
    setFiles([]);
    setFileAvatar([]);
    if (previewUrl === i) setPreviewUrl('');
  };

  if (!dataLoaded) {
    return <RegisterFormSkeleton />;
  }

  return (
    <form action={action} className='space-y-4'>
      <div className='grid w-[398px] grid-cols-2 gap-4'>
        <div className='w-[398px] space-y-2'>
          <Label htmlFor='school'>school/uni</Label>
          <InputCustom
            value={registerDefaultValues.school || ''}
            id='school'
            name='school'
            placeholder='Universitas Sumatra Utara'
            onChange={handleInputChange}
            aria-invalid={!!state?.school}
            aria-describedby={
              getFieldError('school') ? 'school-error' : undefined
            }
            className={cn(
              'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
              getFieldError('school')
                ? 'border-2 border-red-700 bg-red-800/10'
                : '',
              getErrorClassName('school')
            )}
          />
          {getFieldError('school') && (
            <div id='school-error' className='mt-1 flex items-start gap-1'>
              <AlertCircle
                size={14}
                className='mt-0.5 flex-shrink-0 text-red-500'
              />
              <p className='text-sm text-red-600'>{getFieldError('school')}</p>
            </div>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='major'>Major/Fakultas</Label>
        <InputCustom
          value={registerDefaultValues.major || ''}
          id='major'
          name='major'
          placeholder='Sastra Inggris'
          onChange={handleInputChange}
          type='text'
          suffix={<Mail size={20} className='absolute right-2 text-zinc-400' />}
          aria-invalid={!!state?.major}
          aria-describedby={getFieldError('major') ? 'major-error' : undefined}
          className={cn(
            'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
            getFieldError('major')
              ? 'border-2 border-red-700 bg-red-800/10'
              : '',
            getErrorClassName('major')
          )}
        />
        {getFieldError('major') && (
          <div id='major-error' className='mt-1 flex items-start gap-1'>
            <AlertCircle
              size={14}
              className='mt-0.5 flex-shrink-0 text-red-500'
            />
            <p className='text-sm text-red-600'>{getFieldError('major')}</p>
          </div>
        )}
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
        <InputCustom {...getInputProps()} aria-invalid={!!state?.avatar} />
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
            onCheckedChange={(checked) => {
              const isChecked = checked === true;
              handleCheckboxChange(isChecked, 'anonymous');
            }}
            checked={Boolean(userSignInData.anonymous)}
            aria-invalid={!!state?.anonymous}
          />
          {state?.anonymous && (
            <p className='mt-1 text-sm text-red-500'>{state.anonymous}</p>
          )}
          <label
            htmlFor='anonymous'
            className='text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Enable anonymous posting (your profile will remain hidden)
          </label>
        </div>
      </div>

      <div className='flex flex-col'>
        <SubmitButton
          value='continue...'
          submittingText='continue to user contact...'
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

      {state?.global && (
        <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
          <AlertCircle
            className='mt-0.5 flex-shrink-0 text-red-500'
            size={16}
          />
          <div>
            <h3 className='text-sm font-medium text-red-800'>
              Validation Error
            </h3>
            <p className='mt-1 text-sm text-red-700'>{state.global}</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default StepTwoForm;
