'use client';

import { useCallback, useEffect, useState } from 'react';

import { getLikeStatus, toggleLoveComment } from '@/actions/toggle-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { useLikeButton } from '@/hooks/use-like-button';
import { localAvatar } from '@/lib/constants';
import { blogAtom } from '@/lib/jotai/blog-atoms';
import { allLoveIdsAtom, loveIdsAtom } from '@/lib/jotai/comment-atoms';
import { usersAtom } from '@/lib/jotai/session-atoms';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AiOutlineHeart } from 'react-icons/ai';
import { toast } from 'sonner';

type LikeButtonProps = {
  commentId: string;
  initialLikeCount?: number;
  initialHasLiked?: boolean;
};

const LikeButton = ({
  commentId,
  initialLikeCount = 0,
  initialHasLiked = false,
}: LikeButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loveIds, setLoveIds] = useAtom(loveIdsAtom);
  const [allLove, setAllLove] = useAtom(allLoveIdsAtom);
  const [localLikeCount, setLocalLikeCount] = useState(initialLikeCount);
  const [localHasLiked, setLocalHasLiked] = useState(initialHasLiked);
  const [formData, setFormData] = useAtom(blogAtom);
  const [users, setUsers] = useAtom(usersAtom);
  const { data: session } = useSession();

  const hasLoved = allLove?.includes(commentId);

  const blogAuthor = users.find((user) => user.id === formData.authorId);

  const authBlogAuthor = blogAuthor?.id === session?.user.id;

  const isDisabled = !authBlogAuthor || isLoading;

  const toggleLike = async () => {
    if (isDisabled) return;

    setIsLoading(true);

    const previousLikeCount = localLikeCount;
    const previousHasLiked = localHasLiked;
    const previousLoveIds = [...loveIds];
    const previousAllLove = [...allLove];

    const newHasLiked = !hasLoved;
    const newLikeCount = hasLoved ? localLikeCount - 1 : localLikeCount + 1;

    setLocalHasLiked(newHasLiked);
    setLocalLikeCount(newLikeCount);

    const newLoveIds = hasLoved
      ? loveIds.filter((id) => id !== commentId)
      : [...loveIds, commentId];
    setLoveIds(newLoveIds);

    setAllLove((prev) => {
      const filtered = prev.filter((id) => id !== commentId);
      return newHasLiked ? [...filtered, commentId] : filtered;
    });

    try {
      const res = await toggleLoveComment(commentId, hasLoved);

      if (res.error) {
        setLocalHasLiked(previousHasLiked);
        setLocalLikeCount(previousLikeCount);
        setLoveIds(previousLoveIds);
        setAllLove(previousAllLove);
        toast.error(res.message);
      } else {
        if (res.data) {
          setLocalLikeCount(res.data.likeCount);
          setLocalHasLiked(res.data.hasUserLiked);

          const shouldHaveLike = res.data.hasUserLiked;
          setLoveIds((prev) => {
            const filtered = prev.filter((id) => id !== commentId);
            return shouldHaveLike ? [...filtered, commentId] : filtered;
          });
          setAllLove((prev) => {
            const filtered = prev.filter((id) => id !== commentId);
            return shouldHaveLike ? [...filtered, commentId] : filtered;
          });
        }
        toast.success(res.message);
        router.refresh();
      }
    } catch (error) {
      setLocalHasLiked(previousHasLiked);
      setLocalLikeCount(previousLikeCount);
      setLoveIds(previousLoveIds);
      setAllLove(previousAllLove);
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <div
        onClick={toggleLike}
        className={cn(
          'flex items-center justify-center',
          isDisabled
            ? 'cursor-not-allowed opacity-110'
            : 'cursor-pointer transition-all duration-200 hover:scale-110'
        )}
      >
        {hasLoved ? (
          <div className='relative'>
            <Avatar className='border-accent/70 h-8 w-8 rounded-full border p-1'>
              <AvatarImage src={blogAuthor?.avatar || localAvatar} />
              <AvatarFallback>user avatar</AvatarFallback>
            </Avatar>
            <Heart
              size={15}
              className='absolute -right-0.5 -bottom-0.5 fill-rose-500 stroke-white stroke-2'
            />
          </div>
        ) : (
          <AiOutlineHeart
            size={24}
            className='fill-neutral-500 transition-colors hover:fill-rose-400'
          />
        )}
      </div>

      {/* Display like count */}
      {localLikeCount > 0 && (
        <span
          className={cn(
            'text-sm transition-colors',
            hasLoved ? 'text-rose-500' : 'text-neutral-600'
          )}
        >
          {/* {localLikeCount} */}
        </span>
      )}
    </div>
  );
};

export default LikeButton;
