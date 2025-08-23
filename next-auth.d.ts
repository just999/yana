import { Role } from '@prisma/client';

import 'next-auth';

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role: Role;
    avatar: string;
    name: string | null;
    anonymous: boolean;
    profileComplete: boolean;
    image?: string | null;
    email: string | null;
  }

  export interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      avatar: string;
      name: string | null;
      anonymous: boolean;
      profileComplete: boolean;
      email: string;
      image?: string | null;
    } & DefaultSession['user'];
    expires: string;
  }

  interface Account {
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    avatar: string;
    name: string | null;
    anonymous: boolean;
    profileComplete: boolean;
    image?: string | null;
    email: string;
  }
}
