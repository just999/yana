// import { useEffect } from 'react';

// import { userAtom, UserProps, userProviderAtom } from '@/lib/jotai/user-atoms';
// import { useAtom } from 'jotai';
// import { useSession } from 'next-auth/react';

// export const useUserState = () => {
//   const { data: session, status } = useSession();
//   const [curUser, setCurUser] = useAtom(userAtom);
//   const [provider, setProvider] = useAtom(userProviderAtom);

//   useEffect(() => {
//     if (status === 'authenticated' && session?.user) {
//       const sessionUser = session.user;

//       const normalizedUser: UserProps = {
//         name: sessionUser.name || 'Unknown User',
//         email: sessionUser.email || '',
//         avatar: sessionUser.avatar || sessionUser.image || undefined,
//         anonymous: sessionUser.anonymous || false,
//         school: sessionUser.school || undefined,
//         role: sessionUser.role || 'USER',
//         major: sessionUser.major || undefined,
//         phone: undefined,
//         address: undefined,
//         city: undefined,
//       };

//       if (sessionUser.provider) {
//         setProvider(sessionUser.provider);
//       }

//       const userChanged =
//         !curUser ||
//         curUser.email !== normalizedUser.email ||
//         curUser.name !== normalizedUser.name ||
//         curUser.avatar !== normalizedUser.avatar ||
//         curUser.role !== normalizedUser.role;

//       if (userChanged) {
//         setCurUser(normalizedUser);
//       }
//     } else if (status === 'unauthenticated') {
//       if (curUser) setCurUser(null);
//       if (provider) setProvider(null);
//     }
//   }, [session, status, setCurUser, setProvider, curUser, provider]);

//   // Return current user with fallback
//   const currentUser =
//     curUser ||
//     (session?.user
//       ? {
//           name: session.user.name || 'Unknown User',
//           email: session.user.email || '',
//           avatar: session.user.avatar || session.user.image || undefined,
//           anonymous: session.user.anonymous || false,
//           school: session.user.school || undefined,
//           role: session.user.role || 'USER',
//           major: session.user.major || undefined,
//           phone: undefined,
//           address: undefined,
//           city: undefined,
//         }
//       : null);

//   return {
//     user: currentUser,
//     provider,
//     status,
//     isLoading: status === 'loading',
//     isAuthenticated: status === 'authenticated' && !!currentUser,
//   };
// };
