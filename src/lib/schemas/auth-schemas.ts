import { maxAvatarImages } from '@/lib/constants';
import { calculateAge } from '@/lib/utils';
import { z } from 'zod';

const passwordBase = z.object({
  password: z.string().min(6, {
    message: 'Password must be 6 characters',
  }),
  confirmPassword: z.string().min(6),
});

export const passwordSchema = passwordBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type PasswordSchema = z.infer<typeof passwordSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    // password: z
    //   .string()
    //   .min(6, { message: 'Password must be at least 6 characters' }),
    // confirmPassword: z
    //   .string()
    //   .min(6, { message: 'Password must be at least 6 characters' }),
    anonymous: z.boolean().default(false),
    avatar: z.string().optional(),
  })
  .merge(passwordBase)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional().default(false),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  anonymous: z.boolean().default(false),
  // avatar: z.string().url().optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const profileSchema = z.object({
  gender: z.string().min(1),
  description: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  dateOfBirth: z
    .string()
    .min(1, {
      message: 'Date of  birth is required',
    })
    .refine(
      (dateString) => {
        const age = calculateAge(new Date(dateString));
        return age >= 18;
      },
      {
        message: 'You must be at least 18 years old to use this apps',
      }
    ),
});

export const userInfoBase = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    // password: z
    //   .string()
    //   .min(6, { message: 'Password must be at least 6 characters' }),
    // confirmPassword: z
    //   .string()
    //   .min(6, { message: 'Password must be at least 6 characters' }),
  })
  .merge(passwordBase);

export const userInfoSchema = userInfoBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
);

export type UserInfoSchema = z.infer<typeof userInfoSchema>;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const avatarSchema = z.object({
  avatar: z.string().optional(),
});
export const avatarFileSchema = z.object({
  avatarFile: z
    .array(z.instanceof(File, { message: 'Invalid file type' }))
    .max(maxAvatarImages, {
      message: `Maximum ${maxAvatarImages} files allowed`,
    })
    .optional(),
});

export type AvatarSchema = z.infer<typeof avatarSchema>;

const baseDescriptionSchema = z.object({
  anonymous: z
    .union([z.boolean(), z.string()])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  school: z
    .string()
    .min(3, { message: 'School must be at least 3 characters' }),
  major: z
    .string()
    .min(3, { message: 'Major/Jurusan must be at least 3 characters' }),
});

export const userDescriptionSchema = baseDescriptionSchema
  .merge(avatarSchema)
  .merge(avatarFileSchema);
export type UserDescriptionSchema = z.infer<typeof userDescriptionSchema>;

export const userDescriptionActionSchema =
  baseDescriptionSchema.merge(avatarSchema);
export type UserDescriptionActionSchema = z.infer<
  typeof userDescriptionActionSchema
>;

export const userContactSchema = z.object({
  phone: z.string().min(8, { message: 'Phone must be at least 8 characters' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters' }),
  city: z.string().min(3, { message: 'City must be at least 3 characters' }),
});

export type UserContactSchema = z.infer<typeof userContactSchema>;

export const userSignInSchema = z.object({
  ...userInfoBase.shape,
  ...userDescriptionSchema.shape,
  ...userContactSchema.shape,
});

export type UserSignInSchema = z.infer<typeof userSignInSchema>;

const roleEnum = z.enum(['USER', 'ADMIN']);

export const userDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  anonymous: z.boolean().optional(),
  avatar: z.string().optional(),
  role: roleEnum.optional(),
  avatarFile: z
    .array(z.instanceof(File, { message: 'Invalid file type' }))
    .optional(),
  school: z.string().optional(),
  major: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});
export type UserDataSchema = z.infer<typeof userDataSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().optional(),
  })
  .merge(passwordBase)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
