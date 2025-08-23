// 'use client';

// import { useState } from 'react';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
//   Button,
// } from '@/components/ui';
// import { cn } from '@/lib/utils';
// import { LucideIcon, Trash, X } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// type AlertDialogButtonProps = {
//   remove: () => void;
//   className?: string;
//   action?: string;
//   icon: LucideIcon;
// };

// const AlertDialogButton = ({
//   remove,
//   className,
//   action,
//   icon: Icon,
// }: AlertDialogButtonProps) => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const router = useRouter();
//   const handleRemove = async () => {
//     await remove();
//     setIsDialogOpen(false);
//     router.refresh();
//   };
//   return (
//     <AlertDialog
//       open={isDialogOpen}
//       onOpenChange={(open) => {
//         setIsDialogOpen(open);
//       }}
//     >
//       <AlertDialogTrigger asChild>
//         <Button
//           variant={'ghost'}
//           type='button'
//           size={'sm'}
//           className={cn(
//             'flex w-full cursor-pointer justify-start gap-4 overflow-hidden font-normal',
//             className
//           )}
//           aria-label='remove'
//         >
//           <Icon size={24} className='svg text-stone-200' /> {action}
//         </Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//           <AlertDialogDescription>
//             This action cannot be undone. This will permanently delete your
//             account and remove your data from our servers.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction type='button' onClick={handleRemove}>
//             Continue
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };

// export default AlertDialogButton;

import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader, LucideIcon, Trash2 } from 'lucide-react';

type AlertDialogButtonProps = {
  icon?: LucideIcon;
  iconClassName?: string;
  remove: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  destructive?: boolean;
  action?: string;
};

const AlertDialogButton = ({
  icon: Icon = Trash2,
  iconClassName = '',
  remove,
  disabled = false,
  className,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  destructive = true,
  action,
}: AlertDialogButtonProps) => {
  const handleConfirm = () => {
    remove();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          disabled={disabled}
          className={cn(
            'group flex cursor-pointer items-center justify-start gap-4 overflow-hidden font-normal dark:hover:text-gray-100',
            destructive &&
              'text-gray-100 hover:text-red-700 dark:group-hover:text-amber-200',
            className
          )}
        >
          <Icon
            size={16}
            className={cn('svg dark:group-hover:text-stone-200', iconClassName)}
          />{' '}
          <span className='dark:group-hover:text-stone-200'>{action}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled}
            className={cn(
              destructive &&
                'bg-red-600 text-amber-100 hover:bg-red-700 focus:ring-red-600'
            )}
          >
            {disabled ? (
              <>
                <Loader className='animate-spin' /> {action}...
              </>
            ) : (
              `${action}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogButton;
