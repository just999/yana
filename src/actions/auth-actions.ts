'use server';

import { cache } from 'react';

import { getUserByEmail } from '@/actions/user-actions';
import { auth, signIn, signOut } from '@/auth';
import { db } from '@/lib/db';
import { compare, hash } from '@/lib/encrypt';
import { UserProps } from '@/lib/jotai/user-atoms';
import { sendPasswordResetEmail } from '@/lib/mails/mail-password-reset';
import { sendVerificationEmail } from '@/lib/mails/mail-verification';
import {
  registerSchema,
  resetPasswordSchema,
  signInSchema,
  updateUserSchema,
  userContactSchema,
  UserDataSchema,
  userDescriptionActionSchema,
  userDescriptionSchema,
  userInfoSchema,
} from '@/lib/schemas/auth-schemas';
import { generateToken, getTokenByToken } from '@/lib/tokens/tokens';
import { FormErrors, RegistrationRoutes } from '@/lib/types';
import { formatError } from '@/lib/utils';
import { TokenType, User } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UTApi } from 'uploadthing/server';
import { z, ZodIssue } from 'zod';

export const getUserId = cache(async () => {
  const session = await auth();

  return session?.user?.id ? (session.user.id as string) : undefined;
});

export async function logout() {
  await signOut({ redirect: false });

  revalidatePath('/', 'layout');
}

// !REGISTER
export async function register(prevState: unknown, formData: FormData) {
  try {
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);

    const user = registerSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      anonymous: formData.get('anonymous') === 'on',
      avatar: formData.get('avatar') || undefined,
    });
    const plainPassword = user.password;
    user.password = await hash(user.password);
    const existingUser = await db.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return {
        error: true,
        message: 'User with this email already exists',
      };
    }

    await db.user.create({
      data: {
        name: user.name,
        email: user.email,
        hashedPassword: user.password,
        anonymous: user.anonymous,
        avatar: user.avatar,
      },
    });

    for (const [key, value] of formData.entries()) {
      console.log(`Form key: '${key}', value: '${value}'`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
      redirectTo: '/blogs',
    });

    return {
      error: false,
      message: 'Registration success',
    };
  } catch (err: unknown) {
    if (isRedirectError(err)) {
      throw err;
    }
    return { error: true, message: formatError(err) };
  }
}

// !SIGNIN WITH CREDENTIAL
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  const session = await auth();

  if (session) {
    return {
      error: true,
      message: 'You are already logged in',
    };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') === 'on';
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.data?.email) {
      return {
        error: true,
        message: 'Invalid email or password or existing user error',
      };
    }

    // if (!existingUser.data.emailVerified) {
    //   const token = await generateToken(
    //     existingUser.data.email,
    //     TokenType.VERIFICATION
    //   );

    //   await sendVerificationEmail(token.email, token.token);

    //   return {
    //     error: true,
    //     message: 'Please verify your email before logged in',
    //   };
    // }

    // VALIDATE PASSWORD HERE - before calling signIn
    if (!existingUser.data.hashedPassword) {
      return {
        error: true,
        message: 'Invalid email or password',
      };
    }

    const isValidPassword = await compare(
      password,
      existingUser.data.hashedPassword
    );

    if (!isValidPassword) {
      return {
        error: true,
        message: 'Invalid email or password',
      };
    }

    const user = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') === 'on',
    });

    // if (existingUser.data.isTwoFactorEnabled && existingUser.data.email) {
    //   const twoFactorToken = await generateTwoFactorToken(
    //     existingUser.data.email,
    //     TokenType.TWO_FACTOR
    //   );

    //   twoFactorToken &&
    //     (await sendTwoFactorTokenEmail(
    //       twoFactorToken?.email,
    //       twoFactorToken?.token
    //     ));

    //   return { twoFactor: true };
    // }

    const response = await signIn('credentials', {
      // email: user.email,
      // password: user.password,
      ...user,
      redirect: false,
    });

    type SignInResponse = { error?: string | null } | undefined;

    console.log('SignIn response:', JSON.stringify(response, null, 2));

    if (response?.error) {
      console.log('NextAuth error:', response.error);

      switch (response.error) {
        case 'CredentialsSignin':
          return {
            error: true,
            message: 'Invalid email or password',
          };
        case 'CallbackRouteError':
          return {
            error: true,
            message: 'Invalid email or password',
          };
        default:
          return {
            error: true,
            message: 'Authentication failed. Please try again.',
          };
      }
    }

    if (!response) {
      return {
        error: true,
        message: 'Authentication failed',
      };
    }

    // const newSession = await auth();
    // if (!newSession || !newSession.user) {
    //   return {
    //     error: true,
    //     message: 'Invalid credentials',
    //   };
    // }

    if (remember) {
      (await cookies()).set('remember-user', email, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } else {
      (await cookies()).delete('remember-user');
    }

    revalidatePath('/', 'layout');
    revalidatePath('/login');

    return {
      error: false,
      message: 'Signed in successfully',
      redirect: '/',
      data: response as User,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    if (err instanceof z.ZodError) {
      return {
        error: true,
        message: err.errors[0]?.message || 'Invalid form data',
      };
    }

    if (isRedirectError(err)) {
      throw err;
    }

    if (err instanceof Error) {
      if (
        err.message.includes('CredentialsSignin') ||
        err.message.includes('CallbackRouteError')
      ) {
        return {
          error: true,
          message: 'Invalid email or password',
        };
      }
    }

    console.error('Authentication error:', err);
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

export async function getRememberedEmail() {
  const cookieStore = cookies();
  const rememberedEmail = (await cookieStore).get('remember-user');
  return rememberedEmail?.value || '';
}

export async function getAuthUserId() {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) throw new Error('unauthorized');

  return userId;
}

export const addAvatar = async (formData: FormData) => {
  try {
    const userId = await getAuthUserId();
    const avatarUrl = formData.get('avatar');

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return {
        error: true,
        message: 'Invalid avatar URL provided',
      };
    }

    // Check if user exists first
    const existingUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return {
        error: true,
        message: 'User not found',
      };
    }

    // Use transaction to handle avatar update and old file cleanup
    const result = await db.$transaction(async (tx) => {
      // If user has an existing avatar, delete it from UploadThing
      if (existingUser.avatar) {
        try {
          const utapi = new UTApi();
          // Extract file key from URL (assuming URL format: https://utfs.io/f/{fileKey})
          const urlParts = existingUser.avatar.split('/');
          const fileKey = urlParts[urlParts.length - 1];

          if (fileKey && fileKey !== 'user.svg') {
            // Don't delete default avatar
            await utapi.deleteFiles([fileKey]);
          }
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError);
          // Continue with update even if deletion fails
        }
      }

      // Update user with new avatar
      const updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: avatarUrl,
        },
      });

      return updatedUser;
    });

    // Revalidate paths where the avatar might be displayed
    revalidatePath('/'); // Home page
    revalidatePath('/profile'); // Profile page if you have one
    revalidatePath('/dashboard'); // Dashboard if you have one

    // You can also revalidate specific dynamic routes if needed
    // revalidatePath(`/user/${userId}`);

    return {
      error: false,
      message: 'Avatar updated successfully!',
      data: {
        id: result.id,
        avatar: result.avatar,
      },
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const removeAvatar = async (url: string) => {
  const utapi = new UTApi();

  try {
    const userId = await getAuthUserId();

    const res = db.$transaction(async (tx) => {
      const utapi = new UTApi();
      const matchUserAvatar = await tx.user.findFirst({
        where: {
          id: userId,
          avatar: url,
        },
      });

      if (!matchUserAvatar) {
        return {
          error: true,
          message: 'avatar not valid',
        };
      } else {
        const fileKey = url.split('/').pop();
        if (!fileKey) return;

        await utapi.deleteFiles(fileKey);
      }

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: '',
        },
      });

      return {
        error: false,
        message: 'avatar successfully deleted',
      };
    });
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const getUserByAuthUserId = async () => {
  try {
    const userId = await getAuthUserId();

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        posts: true,
        comments: true,
        reactions: true,
      },
    });

    if (!user) {
      return {
        error: true,
        message: 'no user found',
      };
    }
    return {
      error: false,
      message: 'successfully fetch user',
      data: user,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};
export const getUserByUserId = async (userId: string) => {
  try {
    // const userId = await getAuthUserId();

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      // include: {
      //   posts: true,
      //   comments: true,
      //   reactions: true,
      // },
    });

    if (!user) {
      return {
        error: true,
        message: 'Invalid email or password',
      };
    }
    return {
      error: false,
      message: 'successfully fetch user',
      data: user,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const updateUser = async (prevFormData: unknown, formData: FormData) => {
  try {
    const userId = await getAuthUserId();

    const validatedUser = updateUserSchema.parse({
      name: formData.get('name'),
      anonymous: formData.get('anonymous') === 'on',
    });

    const existingUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return {
        error: true,
        message: 'User not found, unAuthorized',
      };
    }

    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: validatedUser.name,
        anonymous: validatedUser.anonymous,
      },
    });

    // Force session refresh by redirecting to the same page
    // This triggers a new JWT token generation with fresh data
    revalidatePath('/', 'layout');
    revalidatePath('my-account');

    return {
      error: false,
      message: 'Successfully updated user',
      data: updatedUser,
      needsRefresh: true,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

function mapZodErrors(issues: ZodIssue[]): FormErrors {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    errors[key] = issue.message;
  }
  return errors;
}

export const stepOneFormAction = async (
  prevState: FormErrors | undefined,
  formData: FormData
): Promise<FormErrors | undefined> => {
  const data = Object.fromEntries(formData.entries());
  const validated = userInfoSchema.safeParse(data);
  if (!validated.success) {
    const fieldError = validated.error.flatten().fieldErrors;

    const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {});
    return errors;
  } else {
    redirect(RegistrationRoutes.USER_DETAILS);
  }
};

export const stepTwoFormAction = async (
  prevState: FormErrors | undefined,
  formData: FormData
): Promise<FormErrors | undefined> => {
  const data = Object.fromEntries(formData.entries());

  const rawData = {
    school: formData.get('school'),
    major: formData.get('major'),
    anonymous: formData.get('anonymous') === 'on' ? true : false,
  };
  const validated = userDescriptionSchema.safeParse(rawData);
  if (!validated.success) {
    const fieldError = validated.error.flatten().fieldErrors;

    const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {});
    return errors;
  } else {
    redirect(RegistrationRoutes.USER_CONTACT);
  }
};

export const stepThreeFormAction = async (
  prevState: FormErrors | undefined,
  formData: FormData
): Promise<FormErrors | undefined> => {
  const data = Object.fromEntries(formData.entries());
  const validated = userContactSchema.safeParse(data);
  if (!validated.success) {
    const fieldError = validated.error.flatten().fieldErrors;

    const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {});
    return errors;
  } else {
    redirect(RegistrationRoutes.REVIEW_USER);
  }
};

// export const submitSignInAction = async (
//   formData: FormData
// ): Promise<UserSignInResponseProps> => {
//   const stepOneValidation = userInfoSchema.safeParse(formData);
//   if (!stepOneValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_INFO,
//       message: 'Please validate user info',
//     };
//   }

//   const stepTwoValidation = userDescriptionSchema.safeParse(formData);
//   if (!stepTwoValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_DETAILS,
//       message: 'Please validate user description',
//     };
//   }

//   const stepThreeValidation = userContactSchema.safeParse(formData);
//   if (!stepThreeValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_CONTACT,
//       message: 'Please validate user contact',
//     };
//   }

//   return {
//     error: false,
//     redirect: RegistrationRoutes.USER_INFO,
//   };
// };

// export const submitSignInAction = async (
//   prevState: unknown,
//   formData: FormData
// ): Promise<UserSignInResponseProps> => {
//   // Convert FormData to a plain object
//   const formDataObj = Object.fromEntries(formData.entries());

//   // Validate step one
//   const stepOneValidation = userInfoSchema.safeParse(formDataObj);
//   if (!stepOneValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_INFO,
//       message: 'Please validate user info',
//       error: true,
//     };
//   }

//   // Validate step two
//   const stepTwoValidation = userDescriptionSchema.safeParse(formDataObj);
//   if (!stepTwoValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_DETAILS,
//       message: 'Please validate user description',
//       error: true,
//     };
//   }

//   // Validate step three
//   const stepThreeValidation = userContactSchema.safeParse(formDataObj);
//   if (!stepThreeValidation.success) {
//     return {
//       redirect: RegistrationRoutes.USER_CONTACT,
//       message: 'Please validate user contact',
//       error: true,
//     };
//   }

//   return {
//     error: false,
//     message: 'Registration successful',
//   };
// };

type UserSignInResponseProps = {
  error?: boolean;
  redirect?: RegistrationRoutes;
  message?: string;
  data?: unknown;
  result?: UserDataSchema;
};

export const submitSignInAction = async (
  prevState: unknown, // Add this parameter for useActionState
  formData: FormData
): Promise<UserSignInResponseProps> => {
  // Log all form data entries
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value} (${typeof value})`);
  }

  // Convert FormData to object for easier debugging
  const formDataObj = Object.fromEntries(formData.entries());

  try {
    const stepOneValidation = userInfoSchema.safeParse(formDataObj);

    const fieldError = stepOneValidation.error?.flatten().fieldErrors;

    const errors = stepOneValidation.error?.issues.reduce(
      (acc: FormErrors, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      },
      {}
    );

    if (!stepOneValidation.success) {
      console.log(
        '❌ Step 1 validation failed:',
        stepOneValidation.error.issues
      );
      return {
        error: true,
        redirect: RegistrationRoutes.USER_INFO,
        message:
          'Please validate user info: ' +
          stepOneValidation.error.issues.map((i) => i.message).join(', '),
        data: fieldError,
      };
    }

    const stepTwoValidation =
      userDescriptionActionSchema.safeParse(formDataObj);

    const fieldTwoError = stepTwoValidation.error?.flatten().fieldErrors;

    if (!stepTwoValidation.success) {
      console.log(
        '❌ Step 2 validation failed:',
        stepTwoValidation.error.issues
      );
      return {
        error: true,
        redirect: RegistrationRoutes.USER_DETAILS,
        message:
          'Please validate user description: ' +
          stepTwoValidation.error.issues.map((i) => i.message).join(', '),
        data: fieldTwoError,
      };
    }

    const stepThreeValidation = userContactSchema.safeParse(formDataObj);

    const fieldThreeError = stepThreeValidation.error?.flatten().fieldErrors;

    if (!stepThreeValidation.success) {
      console.log(
        '❌ Step 3 validation failed:',
        stepThreeValidation.error.issues
      );
      return {
        error: true,
        redirect: RegistrationRoutes.USER_CONTACT,
        message:
          'Please validate user contact: ' +
          stepThreeValidation.error.issues.map((i) => i.message).join(', '),
        data: fieldThreeError,
      };
    }

    console.log('✅ All validations passed');

    // if (stepTwoValidation.data.avatar) {
    //   [stepTwoValidation.data.avatar].map(async (av) => {
    //     const key = av.split('/').pop();
    //     if (!key) return;
    //     return await utapi.deleteFiles(key);
    //   });
    // }

    const session = await auth();
    if (session) {
      return {
        error: true,
        message:
          'You Already Logged in, to registered new account u need to logged out',
      };
    }

    let password = stepOneValidation.data.password;

    const plainPassword = password;
    password = await hash(password);

    const existingUser = await db.user.findUnique({
      where: {
        email: stepOneValidation.data.email,
      },
    });

    if (existingUser) {
      return {
        error: true,
        redirect: RegistrationRoutes.USER_INFO,
        message: 'User with this email already exists',
        data: { email: 'Email already registered' },
      };
    }

    const user = await db.user.create({
      data: {
        name: stepOneValidation.data.name,
        email: stepOneValidation.data.email,
        hashedPassword: password,
        ...stepTwoValidation.data,
        ...stepThreeValidation.data,
      },
    });

    for (const [key, value] of formData.entries()) {
      console.log(`Form key: '${key}', value: '${value}'`);
    }

    const verificationToken = await generateToken(
      stepOneValidation.data.email,
      TokenType.VERIFICATION
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await signIn('credentials', {
      email: stepOneValidation.data.email,
      password: plainPassword,
      redirectTo: '/blogs',
    });

    revalidatePath('/', 'layout');

    return {
      error: false,
      message: 'Registration completed successfully',
      result: user as UserProps,
    };
  } catch (err: unknown) {
    if (isRedirectError(err)) {
      throw err;
    }
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export async function verifyEmail(token: string) {
  try {
    const existingToken = await getTokenByToken(token);

    if (!existingToken) {
      return {
        error: true,
        message: 'invalid token',
      };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      return {
        error: true,
        message: 'token expired',
      };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
      return {
        error: true,
        message: 'no user',
      };
    }

    await db.user.update({
      where: {
        id: existingUser.data?.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    await db.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    return {
      error: false,
      message: 'successfully create a token',
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function generateResetPassword(
  prevState: unknown,
  formData: FormData
) {
  try {
    const data = Object.fromEntries(formData.entries());

    const validated = emailSchema.safeParse(data);
    if (!validated.success) {
      return {
        error: true,
        message: 'invalid email',
      };
    }

    const existingUser = await getUserByEmail(validated.data.email);
    if (existingUser.error) {
      return {
        error: true,
        message: 'invalid user or email',
      };
    }

    const token = await generateToken(
      validated.data.email,
      TokenType.PASSWORD_RESET
    );

    await sendPasswordResetEmail(token.email, token.token);

    return {
      error: false,
      message: 'token successfully created',
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  try {
    const validated = resetPasswordSchema.safeParse(data);

    // if (!validated.success) {
    //   const errors = validated.error.issues.reduce((acc: FormErrors, issue) => {
    //     acc[issue.path[0]] = issue.message;
    //     return acc;
    //   }, {});
    //   return {
    //     error: true,
    //     message: errors,
    //   };
    // }

    if (!validated.success) {
      return {
        error: true,
        message: 'password not the same,...',
      };
    }

    if (!validated.data.token) {
      return {
        error: true,
        message: 'no token was found or something went wrong',
      };
    }

    const existingToken = await getTokenByToken(validated.data.token);

    if (!existingToken) {
      return {
        error: true,
        message: 'token invalid',
      };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      return {
        error: true,
        message: 'token expired please get new token',
      };
    }

    const plainPassword = validated.data.password;
    validated.data.password = await hash(validated.data.password);

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
      return {
        error: true,
        message: 'user not found',
      };
    }

    const updatedUserPassword = await db.user.update({
      where: { id: existingUser.data?.id },
      data: {
        hashedPassword: validated.data.password,
      },
    });

    await db.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    return {
      error: false,
      message: 'password successfully changed',
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
