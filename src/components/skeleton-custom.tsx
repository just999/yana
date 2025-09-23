import { cn } from '@/lib/utils';

export default function SkeletonCustom({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        `h-4 w-full animate-pulse rounded-md bg-orange-600 dark:bg-gray-700`,
        className
      )}
      {...props}
    ></div>
  );
}
