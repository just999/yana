'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import { stepOneFormAction } from '@/actions/auth-actions';
import LoadingPage from '@/app/loading';
import SubmitButton from '@/components/submit-button';
import { InputCustom, InputPassword, Label } from '@/components/ui';
import { registerDefaultValues } from '@/lib/constants';
import { useSignInContext } from '@/lib/contexts/user-sign-in-context';
import { signInErrorAtom } from '@/lib/jotai/auth-atoms';
import { FormErrors } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';

type StepOneFormProps = unknown;

const StepOneForm = () => {
  const initialState: FormErrors = {};
  const [state, action] = useActionState(stepOneFormAction, initialState);
  const [clearedErrors, setClearedErrors] = useState<Set<string>>(new Set());
  const { userSignInData, updateUserDetails, dataLoaded } = useSignInContext();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [validationErrors, setValidationErrors] = useAtom(signInErrorAtom);
  const getFieldErrorFromJotai = (fieldName: string): string | null => {
    // Assuming validationErrors has structure like:
    // { fieldErrors: { name: "error message", email: "error message" } }
    // or { name: "error message", email: "error message" }

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

    // If direct field structure
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

  // Combined error checking from both state and Jotai
  const getFieldError = (fieldName: string): string | null => {
    // Don't show error if user has started typing (cleared the error)
    if (clearedErrors.has(fieldName)) {
      return null;
    }

    // Check Jotai errors first (more recent)
    const jotaiError = getFieldErrorFromJotai(fieldName);
    if (jotaiError) {
      return jotaiError;
    }

    // Fallback to useActionState errors
    return state?.[fieldName] || null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    // Update the context data
    updateUserDetails({ [fieldName]: fieldValue });

    // Clear the error for this specific field
    setClearedErrors((prev) => new Set(prev).add(fieldName));

    // Clear the specific field error from Jotai - Now with proper types
    if (validationErrors?.fieldErrors?.[fieldName]) {
      setValidationErrors((prev) => {
        if (!prev?.fieldErrors) return prev;

        return {
          ...prev,
          fieldErrors: {
            ...prev.fieldErrors,
            [fieldName]: null,
          },
        };
      });
    }
  };

  useEffect(() => {
    const initializeDefaults = () => {
      const defaultsToSet: Record<string, string> = {};
      const LOCAL_STORAGE_KEY = 'multi-page-form-user-sign-in';
      // Only set defaults if current context values are empty/undefined
      if (
        (!userSignInData?.name || userSignInData.name === '') &&
        registerDefaultValues.name
      ) {
        defaultsToSet.name = registerDefaultValues.name;
      }
      if (
        (!userSignInData?.email || userSignInData.email === '') &&
        registerDefaultValues.email
      ) {
        defaultsToSet.email = registerDefaultValues.email;
      }
      if (
        (!userSignInData?.password || userSignInData.password === '') &&
        registerDefaultValues.password
      ) {
        defaultsToSet.password = registerDefaultValues.password;
      }
      if (
        (!userSignInData?.confirmPassword ||
          userSignInData.confirmPassword === '') &&
        registerDefaultValues.confirmPassword
      ) {
        defaultsToSet.confirmPassword = registerDefaultValues.confirmPassword;
      }

      // Update context with defaults if any were found
      if (Object.keys(defaultsToSet).length > 0) {
        updateUserDetails(defaultsToSet);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultsToSet));
      }
    };

    initializeDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Helper function to check if field should show error
  const shouldShowError = (fieldName: string) => {
    return state?.[fieldName] && !clearedErrors.has(fieldName);
  };

  // Reset cleared errors when new validation errors come in
  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setClearedErrors(new Set());
    }
  }, [validationErrors]);

  // Focus on first error field when validation errors appear
  useEffect(() => {
    if (validationErrors?.fieldErrors) {
      const firstErrorField = Object.keys(validationErrors.fieldErrors)[0];
      if (firstErrorField && inputRefs.current[firstErrorField]) {
        inputRefs.current[firstErrorField]?.focus();
      }
    }
  }, [validationErrors]);

  // Helper function to get error className
  const getErrorClassName = (fieldName: string) => {
    return shouldShowError(fieldName)
      ? 'border-2 border-red-700/50 bg-pink-900/5'
      : '';
  };

  // Helper function to get label className
  const getLabelClassName = (fieldName: string) => {
    const hasError = getFieldError(fieldName);
    return hasError ? 'text-red-700 font-medium' : 'text-gray-700';
  };

  if (!dataLoaded) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  return (
    <form action={action} className='space-y-4'>
      {/* <BackButton value='back' /> */}
      <div className='grid w-[398px] grid-cols-2 gap-4'>
        <div className='w-[398px] space-y-2'>
          <Label htmlFor='name'>name</Label>
          <InputCustom
            defaultValue={registerDefaultValues.name}
            id='name'
            ref={(el) => {
              inputRefs.current.name = el;
            }}
            name='name'
            placeholder='nama'
            // required
            onChange={handleInputChange}
            aria-invalid={!!state?.name}
            aria-describedby={getFieldError('name') ? 'name-error' : undefined}
            className={cn(
              'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
              getFieldError('name')
                ? 'border-2 border-red-700 bg-red-800/10'
                : '',
              getErrorClassName('name')
            )}
          />
          {getFieldError('name') && (
            <div id='name-error' className='mt-1 flex items-start gap-1'>
              <AlertCircle
                size={14}
                className='mt-0.5 flex-shrink-0 text-red-500'
              />
              <p className='text-sm text-red-600'>{getFieldError('name')}</p>
            </div>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <InputCustom
          defaultValue={registerDefaultValues.email}
          id='email'
          name='email'
          ref={(el) => {
            inputRefs.current.email = el;
          }}
          placeholder='m@example.com'
          onChange={handleInputChange}
          // type='email'
          // required
          suffix={<Mail size={20} className='absolute right-2 text-zinc-400' />}
          aria-invalid={!!state?.email}
          aria-describedby={getFieldError('email') ? 'email-error' : undefined}
          className={cn(
            'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
            getFieldError('email')
              ? 'border-2 border-red-700 bg-red-800/10'
              : '',
            getErrorClassName('email')
          )}
        />
        {getFieldError('email') && (
          <div id='email-error' className='mt-1 flex items-start gap-1'>
            <AlertCircle
              size={14}
              className='mt-0.5 flex-shrink-0 text-red-500'
            />
            <p className='text-sm text-red-600'>{getFieldError('email')}</p>
          </div>
        )}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <InputPassword
          defaultValue={registerDefaultValues.password}
          id='password'
          name='password'
          placeholder='******'
          ref={(el) => {
            inputRefs.current.password = el;
          }}
          onChange={handleInputChange}
          // required
          autoComplete='off'
          aria-invalid={!!state?.password}
          aria-describedby={
            getFieldError('password') ? 'password-error' : undefined
          }
          className={cn(
            'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
            getFieldError('password')
              ? 'border-2 border-red-700 bg-red-800/10'
              : '',
            getErrorClassName('password')
          )}
        />
        {getFieldError('password') && (
          <div id='password-error' className='mt-1 flex items-start gap-1'>
            <AlertCircle
              size={14}
              className='mt-0.5 flex-shrink-0 text-red-500'
            />
            <p className='text-sm text-red-600'>{getFieldError('password')}</p>
          </div>
        )}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>Confirm password</Label>
        <InputPassword
          defaultValue={registerDefaultValues.confirmPassword}
          id='confirmPassword'
          name='confirmPassword'
          placeholder='******'
          onChange={handleInputChange}
          ref={(el) => {
            inputRefs.current.confirmPassword = el;
          }}
          // required
          autoComplete='off'
          aria-invalid={!!state?.confirmPassword}
          aria-describedby={
            getFieldError('confirmPassword')
              ? 'confirm-password-error'
              : undefined
          }
          className={cn(
            'placeholder:text-accent-foreground/20 w-full transition-all duration-200 placeholder:font-light',
            getFieldError('confirmPassword')
              ? 'border-2 border-red-700 bg-red-800/10'
              : '',
            getErrorClassName('confirmPassword')
          )}
        />
        {getFieldError('confirmPassword') && (
          <div
            id='confirm-password-error'
            className='mt-1 flex items-start gap-1'
          >
            <AlertCircle
              size={14}
              className='mt-0.5 flex-shrink-0 text-red-500'
            />
            <p className='text-sm text-red-600'>
              {getFieldError('confirmPassword')}
            </p>
          </div>
        )}
      </div>
      <div className='flex flex-col'>
        {/* <Button className='w-full' variant={'secondary'} type='submit'>
                Create Account
              </Button> */}
        <SubmitButton
          value='continue...'
          submittingText='continue to user description...'
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
      {/* Display global error */}
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

      {/* <SubmitButton
        value='continue...'
        submittingText='continue to user description...'
      /> */}
    </form>
  );
};

export default StepOneForm;
