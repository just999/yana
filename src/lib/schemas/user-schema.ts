import z from 'zod';

export const profileSchema = z.object({
  anonymous: z.boolean().optional(),
  avatar: z.string().optional(),
  avatarFile: z
    .array(z.instanceof(File, { message: 'Invalid file type' }))
    .optional(),
  school: z.string().optional(),
  major: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});
export type ProfileSchema = z.infer<typeof profileSchema>;
