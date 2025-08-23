// 'use client';

// import path from 'path';
// import { useEffect, useState } from 'react';

// import { RegistrationRoutes } from '@/lib/types';
// import clsx from 'clsx';
// import { ArrowRight } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';

// const steps = [
//   {
//     title: 'User Info',
//     route: 'step-one',
//     link: RegistrationRoutes.USER_INFO,
//   },
//   {
//     title: 'User Description',
//     route: 'step-two',
//     link: RegistrationRoutes.USER_DETAILS,
//   },
//   {
//     title: 'User Contact',
//     route: 'step-three',
//     link: RegistrationRoutes.USER_CONTACT,
//   },
//   { title: 'Review', route: 'review', link: RegistrationRoutes.REVIEW_USER },
// ];

// export default function StepNavigation() {
//   const pathname = usePathname();
//   const currentPath = path.basename(pathname);
//   const [currentStep, setCurrentStep] = useState(0);

//   useEffect(() => {
//     setCurrentStep(steps.findIndex((step) => step.route === currentPath));
//   }, [currentPath]);

//   return (
//     <div className='mt-4 mb-12 min-w-60 flex-col items-center gap-2 lg:mb-0 lg:flex-row'>
//       {/* back button */}
//       <Link
//         href={steps[currentStep - 1]?.link || steps[0].link}
//         className='flex items-center gap-2 text-xl disabled:text-white/50 lg:mb-12 lg:gap-5'
//       >
//         Back
//       </Link>

//       {/* list of form steps */}
//       <div className='relative flex flex-row justify-between lg:flex-col lg:justify-start lg:gap-8'>
//         {steps.map((step, i) => (
//           <Link
//             href={step.link}
//             key={step.link}
//             className='group z-20 flex items-center gap-3 text-sm'
//             prefetch={true}
//           >
//             <span
//               className={clsx(
//                 'flex h-6 w-6 items-center justify-center rounded-full border text-sm transition-colors duration-200 lg:h-8 lg:w-8 lg:text-lg',
//                 {
//                   'border-none bg-teal-500 text-black group-hover:border-none group-hover:text-black':
//                     currentPath === step.route,
//                   'border-white/75 bg-gray-900 text-white/75 group-hover:border-white group-hover:text-white':
//                     currentPath !== step.route,
//                 }
//               )}
//             >
//               {i + 1}
//             </span>
//             <span
//               className={clsx(
//                 'hidden text-white/75 transition-colors duration-200 group-hover:text-white group-hover:underline lg:block',
//                 {
//                   'font-light': currentPath !== step.route,
//                   'font-semibold text-white': currentPath === step.route,
//                 }
//               )}
//             >
//               {step.title}
//             </span>
//           </Link>
//         ))}
//         {/* mobile background dashes */}
//         <div className='absolute top-2 flex h-1 w-full border-b border-dashed border-stone-500 lg:hidden'>
//           <ArrowRight className='absolute -top-2 left-10' />
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import path from 'path';
// import { useEffect, useState } from 'react';

// import { Button } from '@/components/ui';
// import { RegistrationRoutes } from '@/lib/types';
// import { cn } from '@/lib/utils';
// import clsx from 'clsx';
// import { ArrowRight, ChevronRight } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';

// const steps = [
//   {
//     title: 'User Info',
//     id: 1,
//     route: 'step-one',
//     link: RegistrationRoutes.USER_INFO,
//   },
//   {
//     title: 'Description',
//     id: 2,
//     route: 'step-two',
//     link: RegistrationRoutes.USER_DETAILS,
//   },
//   {
//     title: 'Contact',
//     id: 3,
//     route: 'step-three',
//     link: RegistrationRoutes.USER_CONTACT,
//   },
//   {
//     title: 'Review',
//     id: 4,
//     route: 'review',
//     link: RegistrationRoutes.REVIEW_USER,
//   },
// ];

// export default function StepNavigation() {
//   const pathname = usePathname();
//   const currentPath = path.basename(pathname);
//   const [currentStep, setCurrentStep] = useState(0);

//   useEffect(() => {
//     const stepIndex = steps.findIndex((step) => step.route === currentPath);
//     setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
//   }, [currentPath]);

//   const canGoBack = currentStep > 0;

//   return (
//     <div className='mb-0 flex h-screen min-w-60 justify-center gap-4 lg:mb-0 lg:flex-col'>
//       {/* Back button */}

//       <Button
//         variant={'ghost'}
//         size={'sm'}
//         asChild
//         className='bg-accent/40 w-fit'
//       >
//         {currentStep === 0 ? (
//           <div>{steps[0].title}</div>
//         ) : (
//           <Link
//             href={steps[currentStep - 1]?.link || steps[0].link}
//             className={cn(
//               'flex items-center gap-2 text-sm text-white/75 transition-colors duration-200 hover:text-white',
//               !canGoBack ? 'invisible' : ''
//             )}
//           >
//             <ArrowRight className='svg h-4 w-4 rotate-180' />
//             Back to{' '}
//             <span className='underline decoration-amber-300 underline-offset-3'>
//               {currentStep === 0
//                 ? steps[0].title
//                 : `${steps[currentStep - 1].title}`}
//             </span>
//           </Link>
//         )}
//       </Button>

//       {/* Desktop Step Navigation - Vertical Layout */}
//       <div className='hidden lg:flex lg:flex-col lg:gap-0'>
//         {steps.map((step, i) => (
//           <div key={step.link} className='relative'>
//             <Link
//               href={step.link}
//               className='group flex items-center gap-3 py-3 text-sm'
//               prefetch={true}
//             >
//               <span
//                 className={clsx(
//                   'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-all duration-200',
//                   {
//                     'border-teal-500 bg-teal-500 text-black': i === currentStep,
//                     'border-teal-500 bg-transparent text-teal-500':
//                       i < currentStep,
//                     'border-white/30 bg-gray-800 text-white/60 group-hover:border-white/50 group-hover:text-white/80':
//                       i > currentStep,
//                   }
//                 )}
//               >
//                 {i < currentStep ? <ChevronRight className='h-4 w-4' /> : i + 1}
//               </span>
//               <span
//                 className={clsx('transition-colors duration-200', {
//                   'font-semibold text-white': i === currentStep,
//                   'font-medium text-teal-400': i < currentStep,
//                   'font-normal text-white/60 group-hover:text-white/80':
//                     i > currentStep,
//                 })}
//               >
//                 {step.id}..
//               </span>
//             </Link>

//             {/* Vertical connecting line for desktop */}
//             {i < steps.length - 1 && (
//               <div
//                 className={clsx(
//                   'absolute top-11 left-4 h-6 w-px transition-colors duration-200',
//                   {
//                     'bg-teal-500': i < currentStep,
//                     'bg-white/20': i >= currentStep,
//                   }
//                 )}
//               />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Mobile Step Navigation */}
//       <div className='flex w-full lg:hidden'>
//         <div className='relative flex w-full items-center justify-between'>
//           {steps.map((step, i) => (
//             <div key={step.link} className='relative flex items-center'>
//               <Link
//                 href={step.link}
//                 className='group flex flex-col items-center gap-2'
//                 prefetch={true}
//               >
//                 <span
//                   className={clsx(
//                     'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium transition-all duration-200',
//                     {
//                       'border-teal-500 bg-teal-500 text-black':
//                         i === currentStep,
//                       'border-teal-500 bg-transparent text-teal-500':
//                         i < currentStep,
//                       'border-white/30 bg-gray-800 text-white/60':
//                         i > currentStep,
//                     }
//                   )}
//                 >
//                   {i < currentStep ? (
//                     <ChevronRight className='h-3 w-3' />
//                   ) : (
//                     i + 1
//                   )}
//                 </span>
//                 <span
//                   className={clsx(
//                     'max-w-16 text-center text-xs transition-colors duration-200',
//                     {
//                       'font-semibold text-white': i === currentStep,
//                       'font-medium text-teal-400': i < currentStep,
//                       'font-normal text-white/60': i > currentStep,
//                     }
//                   )}
//                 >
//                   {step.id}
//                 </span>
//               </Link>

//               {/* Mobile connecting arrow */}
//               {i < steps.length - 1 && (
//                 <div className='absolute top-1 left-6 flex items-center'>
//                   <ArrowRight
//                     className={clsx('h-4 w-4 transition-colors duration-200', {
//                       'text-teal-500': i < currentStep,
//                       'text-white/20': i >= currentStep,
//                     })}
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Progress indicator */}
//       {/* <div className='w-full bg-gray-800 rounded-full h-1 mt-2'>
//         <div
//           className='bg-teal-500 h-1 rounded-full transition-all duration-300 ease-out'
//           style={{
//             width: `${((currentStep + 1) / steps.length) * 100}%`,
//           }}
//         />
//       </div> */}
//     </div>
//   );
// }

'use client';

import path from 'path';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui';
import { RegistrationRoutes } from '@/lib/types';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const steps = [
  {
    title: 'User Info',
    id: 1,
    route: 'step-one',
    link: RegistrationRoutes.USER_INFO,
  },
  {
    title: 'Description',
    id: 2,
    route: 'step-two',
    link: RegistrationRoutes.USER_DETAILS,
  },
  {
    title: 'Contact',
    id: 3,
    route: 'step-three',
    link: RegistrationRoutes.USER_CONTACT,
  },
  {
    title: 'Review',
    id: 4,
    route: 'review',
    link: RegistrationRoutes.REVIEW_USER,
  },
];

export default function StepNavigation() {
  const pathname = usePathname();
  const currentPath = path.basename(pathname);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepIndex = steps.findIndex((step) => step.route === currentPath);
    setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
  }, [currentPath]);

  const canGoBack = currentStep > 0;

  return (
    <div className='w-full pt-28 lg:w-auto lg:min-w-60'>
      {/* Back button */}
      <div className='mb-2'>
        <Button
          variant={'ghost'}
          size={'sm'}
          asChild
          className='bg-accent/40 w-fit'
        >
          {currentStep === 0 ? (
            <div>{steps[0].title}</div>
          ) : (
            <Link
              href={steps[currentStep - 1]?.link || steps[0].link}
              className={cn(
                'flex items-center gap-2 text-sm text-white/75 transition-colors duration-200 hover:text-white',
                !canGoBack ? 'invisible' : ''
              )}
            >
              <ArrowRight className='svg h-4 w-4 rotate-180' />
              Back to{' '}
              <span className='underline decoration-amber-300 underline-offset-3'>
                {currentStep === 0
                  ? steps[0].title
                  : `${steps[currentStep - 1].title}`}
              </span>
            </Link>
          )}
        </Button>
      </div>

      {/* Desktop Step Navigation - Vertical Layout */}
      <div className='hidden lg:flex lg:flex-col lg:gap-0'>
        {steps.map((step, i) => (
          <div key={step.link} className='relative'>
            <Link
              href={step.link}
              className='group flex items-center gap-3 py-3 text-sm'
              prefetch={true}
            >
              <span
                className={clsx(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-all duration-200',
                  {
                    'border-teal-500 bg-teal-500 text-black': i === currentStep,
                    'border-teal-500 bg-transparent text-teal-500':
                      i < currentStep,
                    'border-white/30 bg-gray-800 text-white/60 group-hover:border-white/50 group-hover:text-white/80':
                      i > currentStep,
                  }
                )}
              >
                {i < currentStep ? <ChevronRight className='h-4 w-4' /> : i + 1}
              </span>
              <span
                className={clsx('transition-colors duration-200', {
                  'font-semibold text-white': i === currentStep,
                  'font-medium text-teal-400': i < currentStep,
                  'font-normal text-white/60 group-hover:text-white/80':
                    i > currentStep,
                })}
              >
                {step.title}
              </span>
            </Link>

            {/* Vertical connecting line for desktop */}
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'absolute top-11 left-4 h-6 w-px transition-colors duration-200',
                  {
                    'bg-teal-500': i < currentStep,
                    'bg-white/20': i >= currentStep,
                  }
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Navigation - Horizontal */}
      <div className='lg:hidden'>
        <div className='mb-4 flex items-center justify-between'>
          {steps.map((step, i) => (
            <div key={step.link} className='relative flex items-center'>
              <Link
                href={step.link}
                className='group flex flex-col items-center gap-2'
                prefetch={true}
              >
                <span
                  className={clsx(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-all duration-200',
                    {
                      'border-teal-500 bg-teal-500 text-black':
                        i === currentStep,
                      'border-teal-500 bg-transparent text-teal-500':
                        i < currentStep,
                      'border-white/30 bg-gray-800 text-white/60':
                        i > currentStep,
                    }
                  )}
                >
                  {i < currentStep ? (
                    <ChevronRight className='h-3 w-3' />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={clsx(
                    'max-w-16 text-center text-xs transition-colors duration-200',
                    {
                      'font-semibold text-white': i === currentStep,
                      'font-medium text-teal-400': i < currentStep,
                      'font-normal text-white/60': i > currentStep,
                    }
                  )}
                >
                  {step.title}
                </span>
              </Link>

              {/* Mobile connecting line */}
              {i < steps.length - 1 && (
                <div className='flex items-center px-2'>
                  <div
                    className={clsx(
                      'h-px flex-1 transition-colors duration-200',
                      {
                        'bg-teal-500': i < currentStep,
                        'bg-white/20': i >= currentStep,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar for mobile */}
        <div className='h-1 w-full rounded-full bg-gray-800'>
          <div
            className='h-1 rounded-full bg-teal-500 transition-all duration-300 ease-out'
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
