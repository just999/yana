// 'use client';

// import { useActionState, useEffect } from 'react';

// import { resetPassword } from '@/actions/auth-actions';
// import SubmitButton from '@/components/submit-button';
// import { InputPassword } from '@/components/ui';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { toast } from 'sonner';

// export function ResetPasswordForm() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');

//   const [state, formAction, isPending] = useActionState(resetPassword, {
//     error: false,
//     message: '',
//   });

//   const router = useRouter();
//   useEffect(() => {
//     if (state.error) {
//       toast.error(state.message);
//     } else if (state.message) {
//       toast.success(state.message);
//     }
//   }, [state]);

//   return (
//     <form action={formAction} className='space-y-6'>
//       <input type='hidden' name='token' defaultValue={token || ''} />

//       <div className='space-y-2'>
//         <Label htmlFor='password'>New Password</Label>
//         <InputPassword id='password' name='password' required />
//       </div>

//       <div className='space-y-2'>
//         <Label htmlFor='confirmPassword'>Confirm Password</Label>
//         <InputPassword id='confirmPassword' name='confirmPassword' required />
//       </div>

//       {state.error && (
//         <div className='bg-destructive/15 text-destructive rounded-md p-3 text-sm'>
//           {state.message || 'Invalid credentials. Please try again.'}
//         </div>
//       )}

//       {/* <Button type='submit' className='w-full' disabled={isPending}>
//         {isPending ? 'Updating...' : 'Reset Password'}
//       </Button> */}
//       <SubmitButton value='reset password' submittingText='resetting...' />

//       <div className='text-center text-sm'>
//         <Button
//           variant={'ghost'}
//           size='sm'
//           className='text-primary underline'
//           onClick={() => router.back()}
//         >
//           Back to login
//         </Button>
//       </div>
//     </form>
//   );
// }

'use client';

import { JSX, useActionState, useEffect, useReducer, useState } from 'react';

import { resetPassword } from '@/actions/auth-actions';
import SubmitButton from '@/components/submit-button';
import { InputPassword } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// TypeScript types
interface FormValues {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password: string | null;
  confirmPassword: string | null;
}

interface FormTouched {
  password: boolean;
  confirmPassword: boolean;
}

interface FormState {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
}

type FormFieldName = keyof FormValues;

// Action types
interface SetFieldValueAction {
  type: 'SET_FIELD_VALUE';
  payload: {
    name: FormFieldName;
    value: string;
  };
}

interface SetFieldTouchedAction {
  type: 'SET_FIELD_TOUCHED';
  payload: {
    name: FormFieldName;
  };
}

interface SetFieldErrorAction {
  type: 'SET_FIELD_ERROR';
  payload: {
    name: FormFieldName;
    error: string | null;
  };
}

interface ValidateFormAction {
  type: 'VALIDATE_FORM';
}

interface SetSubmittingAction {
  type: 'SET_SUBMITTING';
  payload: boolean;
}

interface ResetFormAction {
  type: 'RESET_FORM';
}

interface SetSuccessAction {
  type: 'SET_SUCCESS';
  payload: boolean;
}

interface SetErrorsAction {
  type: 'SET_ERRORS';
  payload: Partial<FormErrors>;
}

type FormAction =
  | SetFieldValueAction
  | SetFieldTouchedAction
  | SetFieldErrorAction
  | ValidateFormAction
  | SetSubmittingAction
  | ResetFormAction
  | SetErrorsAction
  | SetSuccessAction;

// Form state shape
const initialFormState: FormState = {
  values: {
    password: '',
    confirmPassword: '',
  },
  errors: {
    password: null,
    confirmPassword: null,
  },
  touched: {
    password: false,
    confirmPassword: false,
  },
  isValid: false,
  isSubmitting: false,
  isSuccess: false,
};

// Action types enum
const FORM_ACTIONS = {
  SET_FIELD_VALUE: 'SET_FIELD_VALUE',
  SET_FIELD_TOUCHED: 'SET_FIELD_TOUCHED',
  SET_FIELD_ERROR: 'SET_FIELD_ERROR',
  VALIDATE_FORM: 'VALIDATE_FORM',
  SET_SUBMITTING: 'SET_SUBMITTING',
  RESET_FORM: 'RESET_FORM',
  SET_ERRORS: 'SET_ERRORS',
  SET_SUCCESS: 'SET_SUCCESS',
} as const;

// Validation rules
const validateField = (
  name: FormFieldName,
  value: string,
  allValues: FormValues
): string | null => {
  switch (name) {
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;

    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== allValues.password) return 'Passwords do not match';
      return null;

    default:
      return null;
  }
};

// Helper function to check if form is valid
const checkFormValidity = (errors: FormErrors, values: FormValues): boolean => {
  const hasNoErrors = Object.values(errors).every((error) => !error);
  const hasAllValues = Object.values(values).every(
    (value) => value.trim() !== ''
  );
  return hasNoErrors && hasAllValues;
};

// Reducer function
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD_VALUE: {
      const { name, value } = action.payload;
      const newValues: FormValues = { ...state.values, [name]: value };

      // Use gentle validation for real-time feedback
      const fieldError = validateField(name, value, newValues);

      // Also gently revalidate confirmPassword if password changes
      let errors: FormErrors = { ...state.errors, [name]: fieldError };
      if (name === 'password' && state.values.confirmPassword) {
        const confirmError = validateField(
          'confirmPassword',
          state.values.confirmPassword,
          newValues
        );
        errors.confirmPassword = confirmError;
      }

      // For submit button, use strict validation to check if form is ready
      const strictErrors: FormErrors = {
        password: validateField('password', newValues.password, newValues),
        confirmPassword: validateField(
          'confirmPassword',
          newValues.confirmPassword,
          newValues
        ),
      };
      const isValid = checkFormValidity(strictErrors, newValues);

      return {
        ...state,
        values: newValues,
        errors, // Show gentle errors to user
        isValid, // But use strict validation for form validity
      };
    }

    case FORM_ACTIONS.SET_FIELD_TOUCHED: {
      const { name } = action.payload;
      return {
        ...state,
        touched: { ...state.touched, [name]: true },
      };
    }

    case FORM_ACTIONS.SET_FIELD_ERROR: {
      const { name, error } = action.payload;
      const newErrors = { ...state.errors, [name]: error };
      return {
        ...state,
        errors: newErrors,
        isValid: checkFormValidity(newErrors, state.values),
      };
    }

    case FORM_ACTIONS.VALIDATE_FORM: {
      const errors: FormErrors = {
        password: validateField(
          'password',
          state.values.password,
          state.values
        ),
        confirmPassword: validateField(
          'confirmPassword',
          state.values.confirmPassword,
          state.values
        ),
      };

      const touched: FormTouched = {
        password: true,
        confirmPassword: true,
      };

      const isValid = checkFormValidity(errors, state.values);

      return {
        ...state,
        errors,
        touched,
        isValid,
      };
    }

    case FORM_ACTIONS.SET_SUBMITTING: {
      return {
        ...state,
        isSubmitting: action.payload,
      };
    }

    case FORM_ACTIONS.RESET_FORM: {
      return initialFormState;
    }

    case FORM_ACTIONS.SET_ERRORS: {
      const newErrors = { ...state.errors, ...action.payload };
      return {
        ...state,
        errors: newErrors,
        isValid: checkFormValidity(newErrors, state.values),
      };
    }

    case FORM_ACTIONS.SET_SUCCESS: {
      return {
        ...state,
        isSuccess: action.payload,
      };
    }

    default:
      return state;
  }
};

// Server state type (adjust based on your actual server action return type)
interface ServerState {
  error: boolean;
  message: string;
}

export function ResetPasswordForm(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  // Form state management
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Countdown state for redirect
  const [countdown, setCountdown] = useState<number>(0);

  // Server action state
  const [serverState, formAction, isPending] = useActionState(resetPassword, {
    error: false,
    message: '',
  } as ServerState);

  // Handle server response
  useEffect(() => {
    if (serverState.error) {
      toast.error(serverState.message);
      dispatch({ type: FORM_ACTIONS.SET_SUBMITTING, payload: false });
    } else if (serverState.message) {
      toast.success(serverState.message);
      dispatch({ type: FORM_ACTIONS.RESET_FORM });
      dispatch({ type: FORM_ACTIONS.SET_SUCCESS, payload: true });

      // Start countdown for redirect
      setCountdown(5);
    }
  }, [serverState, router]);

  // Countdown effect for redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && formState.isSuccess) {
      // Redirect when countdown reaches 0
      router.push('/login');
    }
  }, [countdown, formState.isSuccess, router]);

  // Manual redirect function
  const handleRedirectNow = (): void => {
    router.push('/login');
  };

  // Handle form submission
  const handleSubmit = async (formData: FormData): Promise<void> => {
    dispatch({ type: FORM_ACTIONS.VALIDATE_FORM });

    if (!formState.isValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    dispatch({ type: FORM_ACTIONS.SET_SUBMITTING, payload: true });
    await formAction(formData);
  };

  // Handle input changes
  const handleInputChange = (name: FormFieldName, value: string): void => {
    dispatch({
      type: FORM_ACTIONS.SET_FIELD_VALUE,
      payload: { name, value },
    });
  };

  // Handle input blur (touch)
  const handleInputBlur = (name: FormFieldName): void => {
    dispatch({
      type: FORM_ACTIONS.SET_FIELD_TOUCHED,
      payload: { name },
    });
  };

  // Helper to show errors - only show gentle errors while typing, strict errors after submit attempt
  const shouldShowError = (fieldName: FormFieldName): boolean => {
    // Always show errors if field was touched and has gentle validation error
    // OR if form was submitted (all fields touched) and has any error
    return formState.touched[fieldName] && Boolean(formState.errors[fieldName]);
  };

  return (
    <div>
      {/* Success State */}
      {formState.isSuccess && (
        <div className='space-y-6 text-center'>
          <div className='rounded-md border border-green-200 bg-green-50 p-4 text-green-800'>
            <h3 className='mb-2 font-semibold'>
              Password Reset Successful! 🎉
            </h3>
            <p className='mb-4 text-sm'>
              Your password has been updated successfully.
            </p>
            <p className='text-sm'>
              Redirecting to login page in{' '}
              <span className='font-bold text-green-600'>{countdown}</span>{' '}
              seconds...
            </p>
          </div>

          <Button
            onClick={handleRedirectNow}
            className='w-full'
            variant='default'
          >
            Go to Login Now
          </Button>
        </div>
      )}

      {/* Form State - only show if not successful */}
      {!formState.isSuccess && (
        <form action={handleSubmit} className='space-y-6'>
          <input type='hidden' name='token' defaultValue={token || ''} />

          <div className='space-y-2'>
            <Label htmlFor='password'>New Password</Label>
            <InputPassword
              id='password'
              name='password'
              value={formState.values.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('password', e.target.value)
              }
              onBlur={() => handleInputBlur('password')}
              className={shouldShowError('password') ? 'border-red-500' : ''}
              required
            />
            {shouldShowError('password') && (
              <p className='text-destructive text-sm font-medium'>
                {formState.errors.password}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <InputPassword
              id='confirmPassword'
              name='confirmPassword'
              value={formState.values.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              onBlur={() => handleInputBlur('confirmPassword')}
              className={
                shouldShowError('confirmPassword') ? 'border-red-500' : ''
              }
              required
            />
            {shouldShowError('confirmPassword') && (
              <p className='text-destructive text-sm font-medium'>
                {formState.errors.confirmPassword}
              </p>
            )}
          </div>

          {serverState.error && (
            <div className='bg-destructive/15 text-destructive rounded-md p-3 text-sm'>
              {serverState.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className='rounded bg-gray-800 p-2 text-xs'>
              <details>
                <summary>Form State (Debug)</summary>
                <pre>{JSON.stringify(formState, null, 2)}</pre>
              </details>
            </div>
          )}

          <SubmitButton
            value='reset password'
            submittingText='resetting...'
            disabled={!formState.isValid || formState.isSubmitting || isPending}
          />

          <div className='text-center text-sm'>
            <Button
              type='button'
              variant={'ghost'}
              size='sm'
              className='text-primary underline'
              onClick={() => router.back()}
            >
              Back to login
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
