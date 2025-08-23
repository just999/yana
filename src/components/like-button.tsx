// // 'use client';

// // import { toggleLoveComment } from '@/actions/toggle-actions';
// // import { cn } from '@/lib/utils';
// // import { useRouter } from 'next/navigation';
// // import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

// // type LikeButtonProps = {
// //   commentId: string;
// //   hasLiked: boolean;
// // };

// // const LikeButton = ({ commentId, hasLiked }: LikeButtonProps) => {
// //   const router = useRouter();
// //   async function toggleLike() {
// //     await toggleLoveComment(commentId, hasLiked);
// //     router.refresh();
// //   }
// //   return (
// //     <div
// //       onClick={toggleLike}
// //       className='relative cursor-pointer transition hover:opacity-80'
// //     >
// //       <AiOutlineHeart
// //         size={20}
// //         className='absolute -top-[2px] -right-[8px] fill-white'
// //       />
// //       <AiFillHeart
// //         size={18}
// //         className={cn(
// //           'pr-4',
// //           hasLiked ? 'fill-rose-500' : 'fill-neutral-500/70'
// //         )}
// //       />
// //     </div>
// //   );
// // };

// // export default LikeButton;

// 'use client';

// import { useState } from 'react';

// import { toggleLoveComment } from '@/actions/toggle-actions';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// import { blogAtom } from '@/lib/jotai/blog-atoms';
// import { allLoveIdsAtom, loveIdsAtom } from '@/lib/jotai/comment-atoms';
// import { usersAtom } from '@/lib/jotai/session-atoms';
// import { cn } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { Heart } from 'lucide-react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

// type LikeButtonProps = {
//   commentId: string;
// };

// const LikeButton = ({ commentId }: LikeButtonProps) => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [loveIds, setLoveIds] = useAtom(loveIdsAtom);
//   const [allLoveIds, setAllLoveIds] = useAtom(allLoveIdsAtom);
//   const [users, setUsers] = useAtom(usersAtom);
//   const hasLiked = commentId && loveIds.includes(commentId);
//   const [optimisticLiked, setOptimisticLiked] = useState(hasLiked);
//   const [formData, setFormData] = useAtom(blogAtom);
//   const { data: session } = useSession();

//   const blogAuthorAvatar = users.filter(
//     (user) => user.id === formData.authorId
//   )[0];
//   const blogAuthor = formData.authorId === session?.user.id ? formData : null;

//   async function toggleLike() {
//     if (isLoading || !commentId) return; // Add check for commentId

//     try {
//       setIsLoading(true);
//       setOptimisticLiked(!optimisticLiked);

//       // Now TypeScript knows commentId is defined here
//       setLoveIds((prev) =>
//         hasLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
//       );

//       if (hasLiked) await toggleLoveComment(commentId, hasLiked);
//       router.refresh();
//     } catch (error) {
//       setOptimisticLiked(hasLiked);
//       console.error('Error toggling like:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }
//   return (
//     <div
//       onClick={toggleLike}
//       className={cn(
//         'flex cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110',
//         isLoading && 'cursor-not-allowed opacity-50'
//       )}
//     >
//       {/* Option 1: Single icon that changes based on state */}

//       {commentId && allLoveIds.includes(commentId) ? (
//         <div className='relative'>
//           <Avatar className='h-6 w-6'>
//             <AvatarImage
//               src={blogAuthorAvatar?.avatar || localAvatar}
//             />
//             <AvatarFallback>user avatar</AvatarFallback>
//           </Avatar>
//           <Heart
//             size={15}
//             className='absolute -right-0.5 -bottom-0.5 fill-rose-500 stroke-white stroke-2'
//           />
//         </div>
//       ) : (
//         <span>
//           {blogAuthor && (
//             <AiOutlineHeart
//               size={24}
//               className='fill-neutral-500 transition-colors hover:fill-rose-400'
//             />
//           )}
//         </span>
//       )}
//     </div>
//   );
// };

// export default LikeButton;

// 'use client';

// import { useState } from 'react';

// import { toggleLoveComment } from '@/actions/toggle-actions';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// import { blogAtom } from '@/lib/jotai/blog-atoms';
// import { allLoveIdsAtom, loveIdsAtom } from '@/lib/jotai/comment-atoms';
// import { usersAtom } from '@/lib/jotai/session-atoms';
// import { cn } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { Heart } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { AiOutlineHeart } from 'react-icons/ai';
// import { toast } from 'sonner';

// type LikeButtonProps = {
//   commentId: string;
// };

// const LikeButton = ({ commentId }: LikeButtonProps) => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [loveIds, setLoveIds] = useAtom(loveIdsAtom);
//   const [allLove, setAllLove] = useAtom(allLoveIdsAtom);
//   const hasLiked = allLove.includes(commentId);
//   const [formData, setFormData] = useAtom(blogAtom);
//   const [users, setUsers] = useAtom(usersAtom);

//   const toggleLike = async () => {
//     if (isLoading) return;

//     setIsLoading(true);
//     const newLoveIds = hasLiked
//       ? loveIds.filter((id) => id !== commentId)
//       : [...loveIds, commentId];
//     setLoveIds(newLoveIds);

//     try {
//       const res = await toggleLoveComment(commentId, hasLiked);

//       if (res.error) {
//         toast.error(res.message);
//       } else {
//         toast.success(res.message);
//         router.refresh();
//       }
//     } catch (error) {
//       setLoveIds(loveIds); // Revert on error
//       console.error('Error toggling like:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const blogAuthorAvatar = users.filter(
//     (user) => user.id === formData.authorId
//   )[0];

//   return (
//     <div
//       onClick={toggleLike}
//       className={cn(
//         'flex cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110',
//         isLoading && 'cursor-not-allowed opacity-50'
//       )}
//     >
//       {hasLiked ? (
//         <div className='relative'>
//           <Avatar className='h-8 w-8'>
//             <AvatarImage
//               src={blogAuthorAvatar?.avatar || localAvatar}
//             />
//             <AvatarFallback>user avatar</AvatarFallback>
//           </Avatar>
//           <Heart
//             size={15}
//             className='absolute -right-0.5 -bottom-0.5 fill-rose-500 stroke-white stroke-2'
//           />
//         </div>
//       ) : (
//         <AiOutlineHeart
//           size={24}
//           className='fill-neutral-500 transition-colors hover:fill-rose-400'
//         />
//       )}
//     </div>
//   );
// };

// export default LikeButton;

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
  // Use local state instead of global atom for more immediate updates
  // const hasLiked = localHasLiked;

  // Polling approach for real-time updates
  const hasLoved = allLove?.includes(commentId);

  const blogAuthor = users.find((user) => user.id === formData.authorId);

  const authBlogAuthor = blogAuthor?.id === session?.user.id;

  const isDisabled = !authBlogAuthor || isLoading;

  const toggleLike = async () => {
    if (isDisabled) return;

    setIsLoading(true);

    // Store previous values for rollback
    const previousLikeCount = localLikeCount;
    const previousHasLiked = localHasLiked;
    const previousLoveIds = [...loveIds];
    const previousAllLove = [...allLove];

    // Optimistic update
    const newHasLiked = !hasLoved;
    const newLikeCount = hasLoved ? localLikeCount - 1 : localLikeCount + 1;

    setLocalHasLiked(newHasLiked);
    setLocalLikeCount(newLikeCount);

    // Update both love atoms optimistically
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
        // Rollback ALL optimistic updates
        setLocalHasLiked(previousHasLiked);
        setLocalLikeCount(previousLikeCount);
        setLoveIds(previousLoveIds);
        setAllLove(previousAllLove);
        toast.error(res.message);
      } else {
        // Update with server response
        if (res.data) {
          setLocalLikeCount(res.data.likeCount);
          setLocalHasLiked(res.data.hasUserLiked);

          // Ensure both atoms are in sync
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
      // Rollback ALL optimistic updates
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
