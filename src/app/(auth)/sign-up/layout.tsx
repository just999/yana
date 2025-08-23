// import StepNavigation from '@/components/shared/step-navigation';
// import { UserSignInContextProvider } from '@/lib/contexts/user-sign-in-context';

// type UserSignUpLayoutProps = unknown;

// export default function UserSignUpLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className='w-full px-2 pt-0 lg:px-0'>
//       {/* <PageHeader
//         title='Share a Deal'
//         subtitle='Have an amazing deal or discount tailored for developers? Let us know!'
//       /> */}
//       <div className='mb-28 flex w-full flex-col items-center gap-x-2 text-white lg:flex-row lg:justify-center'>
//         <StepNavigation />
//         <UserSignInContextProvider>
//           <div className=''>{children}</div>
//         </UserSignInContextProvider>
//       </div>
//     </div>
//   );
// }

import StepNavigation from '@/components/shared/step-navigation';
import { UserSignInContextProvider } from '@/lib/contexts/user-sign-in-context';

type UserSignUpLayoutProps = unknown;

export default function UserSignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen w-full px-2 pt-4 lg:px-6'>
      <UserSignInContextProvider>
        <div className='mx-auto max-w-5xl'>
          {/* Mobile: Navigation at top */}
          <div className='mb-8 lg:hidden'>
            <StepNavigation />
          </div>

          {/* Desktop: Side-by-side layout */}
          <div className='flex w-full flex-col items-center justify-center lg:flex-row lg:items-start lg:gap-2'>
            {/* Desktop Navigation - Sidebar */}
            <div className='hidden lg:sticky lg:top-6 lg:block lg:w-40'>
              <StepNavigation />
            </div>

            {/* Main Content */}
            <div className='mx-auto max-w-xl flex-1 lg:mx-0'>
              <div className='bg-accent/5 rounded-lg/5 p-0 backdrop-blur-sm lg:py-4'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </UserSignInContextProvider>
    </div>
  );
}
