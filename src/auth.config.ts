// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { compare } from '@/lib/encrypt';
// import { NextAuthConfig } from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import GitHub from 'next-auth/providers/github';
// import Google from 'next-auth/providers/google';

// export default {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//     GitHub({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//     Credentials({
//       credentials: {
//         email: { type: 'email' },
//         password: { type: 'password' },
//         // remember: { type: 'boolean' },
//       },
//       async authorize(credentials) {
//         try {
//           console.log('🔍 Authorize called with:', {
//             email: credentials?.email,
//             hasPassword: !!credentials?.password,
//           });

//           if (!credentials?.email || !credentials?.password) {
//             console.log('❌ Missing credentials');
//             return null;
//           }

//           console.log('🔍 Fetching user from database...');
//           const user = await db.user.findFirst({
//             where: {
//               email: credentials.email as string,
//             },
//           });
//           console.log('🔍 User fetch result:', {
//             found: !!user,
//             hasData: !!user?.hashedPassword,
//             email: user?.email,
//           });

//           if (!user || !user.email) {
//             console.log('❌ User not found or invalid');
//             return null;
//           }

//           console.log('🔍 User data:', {
//             id: user.id,
//             email: user.email,
//             hasPassword: !!user.hashedPassword,
//             emailVerified: user.emailVerified,
//           });

//           if (!user.hashedPassword) {
//             console.log('❌ User has no password hash');
//             return null;
//           }

//           console.log('🔍 Comparing passwords...');
//           const isValidPassword = await compare(
//             credentials.password as string,
//             user.hashedPassword
//           );
//           console.log('🔍 Password comparison result:', isValidPassword);

//           if (!isValidPassword) {
//             console.log('❌ Invalid password');
//             return null;
//           }

//           console.log('✅ Authentication successful, returning user');
//           const returnUser = {
//             id: user.id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//             avatar: user.avatar || localAvatar,
//             anonymous: Boolean(user.anonymous),
//             profileComplete: false,
//             profile: null,
//           };
//           console.log('🔍 Returning user object:', returnUser);

//           return returnUser;
//         } catch (error) {
//           if (error instanceof Error) {
//             console.error('💥 Error in authorize function:', error);
//             console.error('💥 Error message:', error.message);
//             console.error('💥 Error stack:', error.stack);
//           }
//           return null;
//         }
//       },
//     }),
//   ],
// } satisfies NextAuthConfig;

// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { compare } from '@/lib/encrypt';
// import { NextAuthConfig } from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import GitHub from 'next-auth/providers/github';
// import Google from 'next-auth/providers/google';

// // Removed incorrect import of undefined from 'zod'

// export default {
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     GitHub({
//       clientId: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     }),
//     Credentials({
//       name: 'credentials',
//       credentials: {
//         email: {
//           label: 'Email',
//           type: 'email',
//           placeholder: 'Enter your email',
//         },
//         password: {
//           label: 'Password',
//           type: 'password',
//           placeholder: 'Enter your password',
//         },
//       },
//       async authorize(credentials) {
//         try {
//           console.log('🔍 Authorize called with:', {
//             email: credentials?.email,
//             hasPassword: !!credentials?.password,
//           });

//           if (!credentials?.email || !credentials?.password) {
//             console.log('❌ Missing credentials');
//             return null;
//           }

//           console.log('🔍 Fetching user from database...');
//           const user = await db.user.findFirst({
//             where: {
//               email: credentials.email as string,
//             },
//             include: {
//               profile: true, // Include profile data
//             },
//           });

//           console.log('🔍 User fetch result:', {
//             found: !!user,
//             hasData: !!user?.hashedPassword,
//             email: user?.email,
//             hasProfile: !!user?.profile,
//           });

//           if (!user || !user.email) {
//             console.log('❌ User not found or invalid');
//             return null;
//           }

//           // Check if email is verified
//           // if (!user.emailVerified) {
//           //   console.log('❌ Email not verified');
//           //   return null; // You might want to handle this differently
//           // }

//           console.log('🔍 User data:', {
//             id: user.id,
//             email: user.email,
//             hasPassword: !!user.hashedPassword,
//             // emailVerified: user.emailVerified,
//             hasProfile: !!user.profile,
//           });

//           if (!user.hashedPassword) {
//             console.log('❌ User has no password hash');
//             return null;
//           }

//           console.log('🔍 Comparing passwords...');
//           const isValidPassword = await compare(
//             credentials.password as string,
//             user.hashedPassword
//           );
//           console.log('🔍 Password comparison result:', isValidPassword);

//           if (!isValidPassword) {
//             console.log('❌ Invalid password');
//             return null;
//           }

//           console.log('✅ Authentication successful, returning user');
//           const returnUser = {
//             id: user.id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//             image: typeof user.image === 'string' ? user.image : undefined, // For NextAuth compatibility
//             // emailVerified: user.emailVerified,
//             // isTwoFactorEnabled: user.isTwoFactorEnabled,
//             // Profile data
//             avatar:
//               typeof user.profile?.avatar === 'string'
//                 ? user.profile.avatar
//                 : typeof user.image === 'string'
//                   ? user.image
//                   : localAvatar,
//             anonymous: user.profile?.anonymous ?? Boolean(user.anonymous),
//             profileComplete: user.profile?.profileComplete ?? false,
//             // Add any other profile fields you need
//             school:
//               typeof user.profile?.school === 'string'
//                 ? user.profile.school
//                 : undefined,
//             major:
//               typeof user.profile?.major === 'string'
//                 ? user.profile.major
//                 : undefined,
//           };
//           // console.log('🔍 Returning user object:', returnUser);

//           return returnUser;
//         } catch (error) {
//           console.error('💥 Error in authorize function:');
//           if (error instanceof Error) {
//             console.error('💥 Error message:', error.message);
//             console.error('💥 Error stack:', error.stack);
//           } else {
//             console.error('💥 Unknown error:', error);
//           }
//           return null;
//         }
//       },
//     }),
//   ],
// } satisfies NextAuthConfig;
