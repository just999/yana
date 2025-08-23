import { localAvatar } from '@/lib/constants';
import { db } from '@/lib/db';
import { compare } from '@/lib/encrypt';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Role, User } from '@prisma/client';
import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const config = {
  trustHost: true,
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : undefined),
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        const user = await db.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        if (user && user.hashedPassword) {
          const isMatch = await compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar || localAvatar,
              anonymous: Boolean(user.anonymous),
              role: user.role,
              profileComplete: Boolean((user as User).profileComplete),
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
      }

      if (
        trigger === 'update' ||
        !session.user.avatar ||
        session.user.avatar === localAvatar
      ) {
        try {
          const freshUser = await db.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              anonymous: true,
            },
          });

          if (freshUser && session.user) {
            session.user.name = freshUser.name || session.user.name;
            session.user.avatar = freshUser.avatar || localAvatar;
            session.user.role = freshUser.role;

            token.name = freshUser.name;
            token.avatar = freshUser.avatar || localAvatar;
            token.role = freshUser.role;
          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
        }
      }

      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.avatar = user.avatar || localAvatar;

        if (user.name === 'NO_NAME') {
          const rawName = user.email!.split('@')[0];
          const filteredName = rawName.replace(/^\d+/, '');

          token.name = filteredName;
          await db.user.update({
            where: {
              id: user.id,
            },
            data: { name: token.name, avatar: token.avatar },
          });
        }
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
