import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { toast } from 'sonner';

type Props = {
  blogAuthor?: User;
  session: Session | null;
  isLoading: boolean;
};

export const useLikeButton = ({ blogAuthor, session, isLoading }: Props) => {
  const isOwnPost = blogAuthor?.id === session?.user.id;
  const canLike = !isOwnPost && !isLoading;

  const getClickHandler = (toggleLike: () => void) => {
    if (!canLike) {
      return () => {
        if (isOwnPost) {
          toast.info("You can't like your own post");
        }
      };
    }
    return toggleLike;
  };

  const getStyles = () => ({
    container: cn(
      'flex items-center justify-center transition-all duration-200',
      canLike
        ? 'cursor-pointer hover:scale-110'
        : 'cursor-not-allowed opacity-50'
    ),
    heart: cn(
      'transition-colors',
      canLike ? 'fill-neutral-500 hover:fill-rose-400' : 'fill-neutral-300'
    ),
  });

  return {
    isOwnPost,
    canLike,
    getClickHandler,
    getStyles,
  };
};
