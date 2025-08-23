// import { auth } from '@/auth';
// import { createUploadthing, type FileRouter } from 'uploadthing/next';
// import { UploadThingError } from 'uploadthing/server';

// const f = createUploadthing();

// export const ourFileRouter = {
//   imageUploader: f({
//     image: {
//       maxFileSize: '4MB',
//       maxFileCount: 3,
//     },
//   })
//     .middleware(async () => {
//       const session = await auth();
//       if (!session) throw new UploadThingError('Unauthorized');

//       return { userId: session.user.id };
//     })
//     .onUploadComplete(async ({ metadata }) => {
//       return { uploadedBy: metadata.userId };
//     }),
// } satisfies FileRouter;
// export type OurFileRouter = typeof ourFileRouter;

import { auth } from '@/auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 3,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session) {
        throw new UploadThingError('Unauthorized');
      }

      return {
        userId: session?.user?.id,
      };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),

  // For registration (no auth required)
  registrationImageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1, // Only need 1 avatar for registration
    },
  })
    .middleware(async () => {
      // No auth check - anyone can upload during registration
      return { purpose: 'registration' };
    })
    .onUploadComplete(async ({ metadata }) => {
      console.log('Registration avatar uploaded');
      return { purpose: metadata.purpose };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
