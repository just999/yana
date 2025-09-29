// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { compare } from '@/lib/encrypt';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import NextAuth, { NextAuthConfig } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';

// // if (!process.env.NEXTAUTH_SECRET) {
// //   throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
// // }

// export const config = {
//   secret:
//     process.env.NEXTAUTH_SECRET ||
//     (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined),
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   adapter: PrismaAdapter(db),
//   providers: [
//     CredentialsProvider({
//       credentials: {
//         email: { type: 'email' },
//         password: { type: 'password' },
//       },
//       async authorize(credentials) {
//         if (credentials === null) return null;

//         const user = await db.user.findFirst({
//           where: {
//             email: credentials.email as string,
//           },
//         });
//         if (user && user.hashedPassword) {
//           const isMatch = await compare(
//             credentials.password as string,
//             user.hashedPassword
//           );

//           if (isMatch) {
//             return {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//               avatar: user.avatar || localAvatar,
//               anonymous: String(user.anonymous),
//               role: user.role,
//             };
//           }
//         }

//         return null;
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, user, trigger, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.role = token.role as string;
//         session.user.name = token.name as string;
//         session.user.avatar = token.avatar as string;
//       }

//       // Always fetch fresh user data for avatar updates
//       if (
//         trigger === 'update' ||
//         !session.user.avatar ||
//         session.user.avatar === localAvatar
//       ) {
//         try {
//           const freshUser = await db.user.findUnique({
//             where: { id: token.sub },
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               avatar: true,
//               role: true,
//               anonymous: true,
//             },
//           });

//           if (freshUser && session.user) {
//             session.user.name = freshUser.name || session.user.name;
//             session.user.avatar = freshUser.avatar || localAvatar;
//             session.user.role = freshUser.role;

//             // Update token as well so it persists
//             token.name = freshUser.name;
//             token.avatar = freshUser.avatar || localAvatar;
//             token.role = freshUser.role;
//           }
//         } catch (error) {
//           console.error('Error fetching fresh user data:', error);
//         }
//       }

//       return session;
//     },

//     async jwt({ token, user, trigger, session }) {
//       if (user) {
//         token.role = user.role;
//         token.avatar = user.avatar || localAvatar;

//         if (user.name === 'NO_NAME') {
//           token.name = user.email!.split('@')[0];

//           await db.user.update({
//             where: {
//               id: user.id,
//             },
//             data: { name: token.name },
//           });
//         }
//       }
//       return token;
//     },
//   },
// } satisfies NextAuthConfig;

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth(config);

// import authConfig from '@/auth.config';
// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { compare } from '@/lib/encrypt';
// import { Profile, Role, User } from '@/lib/generated/prisma/client';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import NextAuth, { NextAuthConfig } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GitHub from 'next-auth/providers/github';

// export const config = {
//   ...authConfig,
//   secret:
//     process.env.NEXTAUTH_SECRET ||
//     (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined),
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },
//   session: {
//     strategy: 'jwt' as const,
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   adapter: PrismaAdapter(db),
//   // providers: [
//   //   GitHub({
//   //     clientId: process.env.GITHUB_CLIENT_ID,
//   //     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   //   }),
//   //   CredentialsProvider({
//   //     credentials: {
//   //       email: { type: 'email' },
//   //       password: { type: 'password' },
//   //       // remember: { type: 'boolean' },
//   //     },
//   //     async authorize(credentials) {
//   //       try {
//   //         console.log('🔍 Authorize called with:', {
//   //           email: credentials?.email,
//   //           hasPassword: !!credentials?.password,
//   //         });

//   //         if (!credentials?.email || !credentials?.password) {
//   //           console.log('❌ Missing credentials');
//   //           return null;
//   //         }

//   //         console.log('🔍 Fetching user from database...');
//   //         const user = await db.user.findFirst({
//   //           where: {
//   //             email: credentials.email as string,
//   //           },
//   //         });
//   //         console.log('🔍 User fetch result:', {
//   //           found: !!user,
//   //           hasData: !!user?.hashedPassword,
//   //           email: user?.email,
//   //         });

//   //         if (!user || !user.email) {
//   //           console.log('❌ User not found or invalid');
//   //           return null;
//   //         }

//   //         console.log('🔍 User data:', {
//   //           id: user.id,
//   //           email: user.email,
//   //           hasPassword: !!user.hashedPassword,
//   //           emailVerified: user.emailVerified,
//   //         });

//   //         if (!user.hashedPassword) {
//   //           console.log('❌ User has no password hash');
//   //           return null;
//   //         }

//   //         console.log('🔍 Comparing passwords...');
//   //         const isValidPassword = await compare(
//   //           credentials.password as string,
//   //           user.hashedPassword
//   //         );
//   //         console.log('🔍 Password comparison result:', isValidPassword);

//   //         if (!isValidPassword) {
//   //           console.log('❌ Invalid password');
//   //           return null;
//   //         }

//   //         console.log('✅ Authentication successful, returning user');
//   //         const returnUser = {
//   //           id: user.id.toString(),
//   //           email: user.email,
//   //           name: user.name,
//   //           role: user.role,
//   //           avatar: user.avatar || localAvatar,
//   //           anonymous: Boolean(user.anonymous),
//   //           profileComplete: false,
//   //           profile: null,
//   //         };
//   //         console.log('🔍 Returning user object:', returnUser);

//   //         return returnUser;
//   //       } catch (error) {
//   //         if (error instanceof Error) {
//   //           console.error('💥 Error in authorize function:', error);
//   //           console.error('💥 Error message:', error.message);
//   //           console.error('💥 Error stack:', error.stack);
//   //         }
//   //         return null;
//   //       }
//   //     },
//   //   }),
//   // ],
//   events: {
//     async linkAccount({ user }: { user: User }) {
//       await db.user.update({
//         where: { id: user.id },
//         data: { emailVerified: new Date() },
//       });
//     },
//   },
//   callbacks: {
//     // async signIn({ user }) {
//     //   const existingUser = await getUserByUserId();

//     //   if (!existingUser || !existingUser.data?.emailVerified) return false;
//     //   return true;
//     // },
//     // async session({ session, token, trigger, user }) {
//     //   console.log('=== Session Callback ===');
//     //   console.log('session before:', session);
//     //   console.log('token:', token);
//     //   console.log('user:', user);

//     //   if (session.user && token.sub) {
//     //     session.user.id = token.sub;
//     //     session.user.role = token.role as Role;
//     //     session.user.name = token.name;
//     //     session.user.avatar = token.avatar as string;
//     //     session.user.anonymous = token.anonymous as boolean;
//     //     session.user.email = token.email;
//     //     session.user.profileComplete = token.profileComplete as boolean;
//     //     // For NextAuth compatibility
//     //     session.user.image = token.avatar as string;

//     //     const profile = await db.profile.findUnique({
//     //       where: { userId: user.id },
//     //     });
//     //     session.user.profile = profile;
//     //   }

//     //   console.log('session after:', session);
//     //   console.log('========================');

//     //   if (trigger === 'update') {
//     //     session.user.name = user.name as string;
//     //   }
//     //   return session;
//     // },

//     async session({ session, token }: { session: any; token: any }) {
//       console.log('=== Session Callback ===');
//       console.log('session before:', session);
//       console.log('token:', token);

//       // Map token data to session - token.sub is the user ID
//       if (token && session.user && token.sub) {
//         session.user.id = token.sub; // Use token.sub instead of user.id
//         session.user.role = token.role;
//         session.user.profileComplete = token.profileComplete;
//         session.user.anonymous = token.anonymous;
//         session.user.avatar = token.avatar;
//         session.user.image = token.picture; // GitHub/Google avatar
//       }

//       console.log('session after:', session);
//       return session;
//     },

//     // async jwt({ token, user, trigger, account, session, profile }) {
//     //   // On sign in (when user object is available)
//     //   console.log('=== JWT Callback ===');
//     //   console.log('trigger:', trigger);
//     //   console.log('user:', user);
//     //   console.log('account:', account);
//     //   console.log('token before:', token);

//     //   if (user) {
//     //     token.role = user.role;
//     //     token.name = user.name;
//     //     token.profileComplete = user.profileComplete;
//     //     token.anonymous = Boolean(user.anonymous);
//     //     const avatarPath = user.avatar || localAvatar;
//     //     token.avatar = avatarPath;

//     //     console.log('token after:', token);
//     //     console.log('===================');

//     //     if (user.name === 'NO_NAME') {
//     //       token.name = user.email!.split('@')[0];

//     //       await db.user.update({
//     //         where: {
//     //           id: user.id,
//     //         },
//     //         data: { name: token.name },
//     //       });
//     //     }
//     //   }

//     //   if (trigger === 'update' && session) {
//     //     if (session.name) token.name = session.name;
//     //     if (session.avatar) token.avatar = session.avatar;
//     //     if (typeof session.anonymous === 'boolean')
//     //       token.anonymous = session.anonymous;
//     //     if (session.role) token.role = session.role;
//     //   }

//     //   // Handle avatar updates or fetch fresh data when needed
//     //   if (
//     //     trigger === 'update' ||
//     //     !token.avatar ||
//     //     token.avatar === '/avatar/user.svg'
//     //   ) {
//     //     try {
//     //       const freshUser = await db.user.findUnique({
//     //         where: { id: token.sub },
//     //         select: {
//     //           id: true,
//     //           name: true,
//     //           email: true,
//     //           avatar: true,
//     //           role: true,
//     //           anonymous: true,
//     //         },
//     //       });

//     //       if (freshUser) {
//     //         token.name = freshUser.name || token.name;
//     //         const avatarPath = freshUser.avatar || localAvatar;
//     //         token.avatar = avatarPath;
//     //         token.role = freshUser.role;
//     //         token.anonymous = Boolean(freshUser.anonymous);
//     //       }
//     //     } catch (error) {
//     //       console.error(
//     //         'Error fetching fresh user data in JWT callback:',
//     //         error
//     //       );
//     //     }
//     //   }

//     //   // Fallback: if avatar is still the old wrong path, fix it
//     //   if (token.avatar === '/avatar/user.svg') {
//     //     token.avatar = localAvatar;
//     //   }

//     //   return token;
//     // },

//     async jwt({
//       token,
//       user,
//       account,
//       profile,
//       trigger,
//       session,
//     }: {
//       token: any;
//       user?: any;
//       account?: any;
//       profile?: any;
//       trigger?: 'signIn' | 'signUp' | 'update';
//       isNewUser?: boolean;
//       session?: any;
//     }) {
//       console.log('=== JWT Callback ===');
//       console.log('trigger:', trigger);
//       console.log('user:', user);
//       console.log('token before:', token);

//       // Only add user data when user is available (during sign in)
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.profileComplete = user.profileComplete;
//         token.anonymous = user.anonymous;
//         token.avatar = user.avatar;
//       }

//       console.log('token after:', token);
//       return token;
//     },
//   },
// };

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth(config);

// import authConfig from '@/auth.config';
// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { compare } from '@/lib/encrypt';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import NextAuth, { NextAuthConfig } from 'next-auth';
// import { AdapterUser } from 'next-auth/adapters';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GitHub from 'next-auth/providers/github';

// export const config: NextAuthConfig = {
//   ...authConfig,
//   secret:
//     process.env.NEXTAUTH_SECRET ||
//     (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined),
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },
//   session: {
//     strategy: 'jwt' as const,
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   adapter: PrismaAdapter(db),

//   events: {
//     async linkAccount({ user, account, profile }) {
//       // Fix: Use proper NextAuth event signature
//       console.log('Link account event:', { user, account, profile });

//       if (user?.id) {
//         await db.user.update({
//           where: { id: user.id },
//           data: { emailVerified: new Date() },
//         });
//       }
//     },
//     async createUser({ user }) {
//       // Optional: Create default profile when user is created
//       console.log('Create user event:', user);

//       if (user?.id) {
//         await db.profile.create({
//           data: {
//             userId: user.id,
//             profileComplete: false,
//             anonymous: false,
//             avatar: localAvatar,
//           },
//         });
//       }
//     },
//   },

//   callbacks: {
//     async session({ session, token }) {
//       console.log('=== Session Callback ===');
//       console.log('session before:', session);
//       console.log('token:', token);

//       if (token && session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.role = token.role as string;
//         session.user.profileComplete = token.profileComplete as boolean;
//         session.user.anonymous = token.anonymous as boolean;
//         session.user.avatar = token.avatar as string;
//         session.user.image = token.picture as string;
//       }

//       console.log('session after:', session);
//       return session;
//     },

//     async jwt({ token, user, account, profile, trigger, session }) {
//       console.log('=== JWT Callback ===');
//       console.log('trigger:', trigger);
//       console.log('user:', user);
//       console.log('token before:', token);

//       // When user signs in for the first time
//       if (user) {
//         token.id = user.id;
//         token.role = (user as any).role || 'USER';

//         // Fetch profile data from database
//         try {
//           const userWithProfile = await db.user.findUnique({
//             where: { id: user.id },
//             include: { profile: true },
//           });

//           if (userWithProfile?.profile) {
//             token.profileComplete = userWithProfile.profile.profileComplete;
//             token.anonymous = userWithProfile.profile.anonymous;
//             token.avatar = userWithProfile.profile.avatar || localAvatar;
//           } else {
//             // Default values if no profile exists
//             token.profileComplete = false;
//             token.anonymous = false;
//             token.avatar = localAvatar;
//           }
//         } catch (error) {
//           console.error('Error fetching user profile:', error);
//           token.profileComplete = false;
//           token.anonymous = false;
//           token.avatar = localAvatar;
//         }
//       }

//       // Handle profile updates via session update
//       if (trigger === 'update' && session) {
//         if (session.profileComplete !== undefined) {
//           token.profileComplete = session.profileComplete;
//         }
//         if (session.anonymous !== undefined) {
//           token.anonymous = session.anonymous;
//         }
//         if (session.avatar !== undefined) {
//           token.avatar = session.avatar;
//         }
//       }

//       console.log('token after:', token);
//       return token;
//     },

//     async signIn({ user, account, profile, email, credentials }) {
//       console.log('=== SignIn Callback ===');
//       console.log('user:', user);
//       console.log('account:', account);

//       // Allow all sign ins (you can add custom logic here)
//       return true;
//     },
//   },
// };

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth(config);

// // Helper functions for updating user session
// export async function updateUserSession(
//   userId: string,
//   updates: {
//     profileComplete?: boolean;
//     anonymous?: boolean;
//     avatar?: string;
//   }
// ) {
//   // Update database
//   await db.profile.upsert({
//     where: { userId },
//     update: updates,
//     create: {
//       userId,
//       profileComplete: updates.profileComplete ?? false,
//       anonymous: updates.anonymous ?? false,
//       avatar: updates.avatar ?? localAvatar,
//     },
//   });

//   // You can trigger session update on client side using:
//   // import { useSession } from 'next-auth/react';
//   // const { update } = useSession();
//   // await update(updates);
// }

// import { getUserByAuthUserId, getUserByUserId } from '@/actions/auth-actions';
// import authConfig from '@/auth.config';
// import { localAvatar } from '@/lib/constants';
// import { db } from '@/lib/db';
// import { getTwoFactorConfirmationByUserId } from '@/lib/two-factor-confirmation/two-factor';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import NextAuth, { NextAuthConfig } from 'next-auth';

// // Helper function to ensure user has a profile
// async function ensureUserProfile(userId: string) {
//   try {
//     const existingProfile = await db.profile.findUnique({
//       where: { userId },
//     });

//     if (!existingProfile) {
//       await db.profile.create({
//         data: {
//           userId,
//           profileComplete: false,
//           anonymous: false,
//           avatar: localAvatar,
//         },
//       });
//       console.log(`✅ Created profile for user: ${userId}`);
//     }
//   } catch (error) {
//     console.error('Error ensuring user profile:', error);
//   }
// }

// // Helper function to get user with profile data
// async function getUserWithProfile(userId: string) {
//   try {
//     return await db.user.findUnique({
//       where: { id: userId },
//       include: { profile: true },
//     });
//   } catch (error) {
//     console.error('Error fetching user with profile:', error);
//     return null;
//   }
// }

// export const config: NextAuthConfig = {
//   ...authConfig,
//   secret:
//     process.env.NEXTAUTH_SECRET ||
//     (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined),
//   pages: {
//     signIn: '/sign-up',
//     error: '/sign-up',
//   },
//   session: {
//     strategy: 'jwt' as const,
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   adapter: PrismaAdapter(db),

//   events: {
//     async linkAccount({ user, account, profile }) {
//       // console.log('🔗 Link account event:', {
//       //   userId: user.id,
//       //   provider: account.provider,
//       // });

//       if (user?.id) {
//         // Update email verification for social logins
//         await db.user.update({
//           where: { id: user.id },
//           data: { emailVerified: new Date() },
//         });

//         // Ensure profile exists
//         await ensureUserProfile(user.id);
//       }
//     },

//     async createUser({ user }) {
//       // console.log('👤 Create user event:', {
//       //   userId: user.id,
//       //   email: user.email,
//       // });

//       if (user?.id) {
//         // Create default profile for new users
//         await ensureUserProfile(user.id);
//       }
//     },

//     async signIn({ user, account, profile, isNewUser }) {
//       // console.log('📝 Sign in event:', {
//       //   userId: user.id,
//       //   provider: account?.provider,
//       //   isNewUser,
//       // });

//       if (user?.id && isNewUser) {
//         // Ensure new users have profiles
//         await ensureUserProfile(user.id);
//       }
//     },
//   },

//   callbacks: {
//     async signIn({ user, account, profile, email, credentials }) {
//       console.log('=== SignIn Callback ===');
//       console.log('provider:', account?.provider);
//       console.log('user:', user);

//       // For credentials login, additional validation is done in the provider
//       // if (account?.provider === 'credentials') {
//       //   return true;
//       // }

//       // For social logins, you can add additional validation here
//       if (account?.provider === 'google' || account?.provider === 'github') {
//         // Check if user email is allowed, etc.
//         return true;
//       }

//       const existingUser = await getUserByUserId(user.id);
//       const authUser = await getUserByAuthUserId();

//       if (
//         existingUser?.data?.isTwoFactorEnabled &&
//         account?.provider === 'credentials'
//       ) {
//         const twoFactorConfirmation =
//           existingUser.data?.id &&
//           (await getTwoFactorConfirmationByUserId(existingUser.data.id));

//         if (!twoFactorConfirmation) return false;

//         await db.twoFactor.delete({
//           where: { id: twoFactorConfirmation.id },
//         });
//       }
//       return true;
//     },
//     async session({ session, token }) {
//       // console.log('=== Session Callback ===');
//       // console.log('session before:', session);
//       // console.log('token:', token);

//       if (token && session.user && token.sub) {
//         session.user.id = token.sub;
//         session.user.role = token.role as string;
//         session.user.profileComplete = token.profileComplete as boolean;
//         session.user.anonymous = token.anonymous as boolean;
//         // session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
//         session.user.avatar = token.avatar as string;
//         session.user.image =
//           (token.picture as string) || (token.image as string);

//         // Add any additional profile fields
//         // session.user.school = token.school as string;
//         // session.user.major = token.major as string;
//         // session.user.bio = token.bio as string;
//       }

//       // console.log('session after:', session);
//       return session;
//     },

//     async jwt({ token, user, account, profile, trigger, session }) {
//       // console.log('=== JWT Callback ===');
//       // console.log('trigger:', trigger);
//       // console.log('user:', user);
//       // console.log('account:', account?.provider);

//       // When user signs in for the first time or token is created
//       if (user) {
//         console.log('🔄 Processing user data for JWT');

//         token.id = user.id;
//         token.role = (user as any).role || 'USER';

//         // For credentials login, user object already contains profile data
//         if (account?.provider === 'credentials') {
//           token.profileComplete = (user as any).profileComplete || false;
//           token.anonymous = (user as any).anonymous || false;
//           token.isTwoFactorEnabled = (user as any).isTwoFactorEnabled || false;
//           token.avatar = (user as any).avatar || localAvatar;
//           token.school = (user as any).school;
//           token.major = (user as any).major;
//           token = (user as any).bio;
//         } else {
//           // For social logins, fetch profile data from database
//           const userWithProfile = await getUserWithProfile(user.id);

//           if (userWithProfile?.profile) {
//             token.profileComplete = userWithProfile.profile.profileComplete;
//             token.anonymous = userWithProfile.profile.anonymous;
//             token.avatar = userWithProfile.profile.avatar || localAvatar;
//             token.school = userWithProfile.profile.school as string;
//             token.major = userWithProfile.profile.major as string;
//           } else {
//             // Default values if no profile exists yet
//             token.profileComplete = false;
//             token.anonymous = false;
//             token.avatar = localAvatar;
//           }
//         }

//         // Store social login image
//         if (user.image) {
//           token.image = user.image;
//         }
//       }

//       // Handle profile updates via session update
//       if (trigger === 'update' && session.user) {
//         // console.log('🔄 Updating token with session data:', session);

//         if (session.profileComplete !== undefined) {
//           token.profileComplete = session.profileComplete;
//         }
//         if (session.anonymous !== undefined) {
//           token.anonymous = session.anonymous;
//         }
//         if (session.isTwoFactorEnabled !== undefined) {
//           token.isTwoFactorEnabled = session.isTwoFactorEnabled;
//         }
//         if (session.avatar !== undefined) {
//           token.avatar = session.avatar;
//         }
//         if (session.school !== undefined) {
//           token.school = session.school;
//         }
//         if (session.major !== undefined) {
//           token.major = session.major;
//         }
//         if (session.bio !== undefined) {
//           token.bio = session.bio;
//         }
//       }
//       if (token.name === 'NO_NAME' && user.email) {
//         const newName = user.email.split('@')[0];
//         token.name = newName;
//         try {
//           await db.user.update({
//             where: { id: user.id },
//             data: { name: newName },
//           });
//         } catch (err) {
//           console.error('Failed to update user name:', err);
//         }
//       }

//       // console.log('token after:', token);
//       return token;
//     },
//   },
// };

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth(config);

// // Helper function for updating user profile from client
// export async function updateUserProfile(
//   userId: string,
//   updates: {
//     profileComplete?: boolean;
//     anonymous?: boolean;
//     avatar?: string;
//     school?: string;
//     major?: string;
//     bio?: string;
//     [key: string]: any;
//   }
// ) {
//   try {
//     await db.profile.upsert({
//       where: { userId },
//       update: updates,
//       create: {
//         userId,
//         profileComplete: updates.profileComplete ?? false,
//         anonymous: updates.anonymous ?? false,
//         avatar: updates.avatar ?? localAvatar,
//         school: updates.school,
//         major: updates.major,
//       },
//     });

//     console.log('✅ Profile updated successfully');
//     return { success: true };
//   } catch (error) {
//     console.error('❌ Error updating profile:', error);
//     return { success: false, error };
//   }
// }
