// 'use client';

// import { useEffect, useState } from 'react';

// import { useCommentReactions } from '@/lib/contexts/like-context';
// import { usePostReactions } from '@/lib/contexts/post-like-context';
// import { blogAtom } from '@/lib/jotai/blog-atoms';
// import { PostProps, PostReactionsProps, ReactionProps } from '@/lib/types';
// import { cn } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { ThumbsDown, ThumbsUp } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// import LikeButton from './like-button';
// import { Button } from './ui';

// type ThumbsLikeButtonProps = {
//   postId?: string;
//   commentId?: string;
//   reactions?: ReactionProps[] | [];
//   currentUserId: string;
//   likeIds: string[];
//   allLove: string[];
//   blog?: PostProps;
//   iconSize?: number;
//   postInitialReactions?: PostReactionsProps | undefined;
// };

// type ReactionTarget = {
//   id: string;
//   type: 'post' | 'comment';
// };

// type ReactionData = {
//   likes: number;
//   dislikes: number;
//   userReaction: 'LIKE' | 'DISLIKE' | null;
//   isLoading: boolean;
//   targetType: 'post' | 'comment' | null;
//   targetId: string | null;
// };

// const ThumbsLikeButton = ({
//   commentId,
//   postId,
//   reactions,
//   currentUserId,
//   likeIds,
//   blog,
//   allLove,
//   iconSize,
//   postInitialReactions,
// }: ThumbsLikeButtonProps) => {
//   const [type, setType] = useState<'LIKE' | 'DISLIKE' | null>(null);
//   const [bookmarked, setBookmarked] = useState(false);
//   const [formData, setFormData] = useAtom(blogAtom);

//   const {
//     reactions: postReact,
//     updatePostReaction,
//     setPostInitialReactions,
//   } = usePostReactions();

//   const {
//     reactions: commentReact,
//     updateCommentReaction,
//     loading,
//     error,
//   } = useCommentReactions();

//   const authorId = formData.authorId;
//   const blogOwner = authorId === currentUserId;
//   const router = useRouter();

//   useEffect(() => {
//     if (postInitialReactions && Object.keys(postInitialReactions).length > 0) {
//       console.log('Setting initial reactions:', postInitialReactions);
//       setPostInitialReactions(postInitialReactions);
//     }
//   }, [postInitialReactions, setPostInitialReactions]);

//   const hasLiked = commentId && allLove?.includes(commentId);

//   useEffect(() => {
//     const userReaction = reactions?.find((r) => r.userId === currentUserId);
//     setType(userReaction?.type || null);
//   }, [reactions, currentUserId]);

//   const reactionUser = (commentId && commentReact[commentId]) || {
//     likes: 0,
//     dislikes: 0,
//     userReaction: null,
//   };
//   const reactionPostUser = (postId && postReact[postId]) || {
//     likes: 0,
//     dislikes: 0,
//     userReaction: null,
//   };

//   const getReactionTarget = (): ReactionTarget | null => {
//     if (commentId) {
//       return { id: commentId, type: 'comment' };
//     }
//     if (postId) {
//       return { id: postId, type: 'post' };
//     }
//     return null;
//   };

//   const handleReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
//     const target = getReactionTarget();

//     if (!target) {
//       console.error('No valid target (postId or commentId) provided');
//       return;
//     }

//     const previousType = type;
//     setType(reactionType === type ? null : reactionType);

//     console.log(`Handling ${reactionType} for ${target.type}:`, target.id);

//     try {
//       switch (target.type) {
//         case 'comment':
//           console.log('Updating comment reaction for:', target.id);
//           await updateCommentReaction(target.id, reactionType);
//           break;
//         case 'post':
//           console.log('Updating post reaction for:', target.id);
//           await updatePostReaction(target.id, reactionType);
//           break;
//         default:
//           console.error('Unknown reaction target type:', target.type);
//           return;
//       }

//       console.log(
//         `Successfully updated ${reactionType} for ${target.type}:`,
//         target.id
//       );
//     } catch (err) {
//       console.error(`Failed to update ${target.type} reaction:`, error);
//     }
//   };

//   const getReactionData = () => {
//     const target = getReactionTarget();

//     if (!target) {
//       return {
//         likes: 0,
//         dislikes: 0,
//         userReaction: null,
//         isLoading: false,
//         targetType: null,
//         targetId: null,
//       };
//     }

//     const baseData =
//       target.type === 'comment'
//         ? reactionUser || { likes: 0, dislikes: 0, userReaction: null }
//         : reactionPostUser || { likes: 0, dislikes: 0, userReaction: null };

//     return {
//       ...baseData,
//       isLoading: loading === target.id,
//       targetType: target.type,
//       targetId: target.id,
//     };
//   };

//   const handleBookmark = () => setBookmarked(!bookmarked);

//   const preventLinkAction = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const reactionData = getReactionData();

//   return (
//     <div className='flex items-center gap-4'>
//       <div className='flex items-center text-stone-300'>
//         <Button
//           variant={'ghost'}
//           size={'sm'}
//           type='button'
//           disabled={reactionData.isLoading}
//           className={`flex h-6 items-center gap-2 rounded-none rounded-l-full px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
//             reactionData.userReaction === 'LIKE'
//               ? 'border border-blue-600/30 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
//               : 'border border-red-700 text-gray-600 hover:bg-gray-100 dark:border-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700'
//           }`}
//           onClick={() => handleReaction('LIKE')}
//         >
//           <ThumbsUp
//             size={iconSize}
//             stroke='white'
//             strokeWidth={1.5}
//             className={cn(
//               'transition-colors',
//               reactionData.userReaction === 'LIKE'
//                 ? 'text-blue-700 dark:text-blue-400'
//                 : 'text-gray-600 dark:text-gray-400'
//             )}
//             style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
//           />
//           <span className='inline-block min-w-[20px] text-center'>
//             {/* {commentId ? reactionUser.likes : reactionPostUser.likes} */}
//             {reactionData.likes}
//           </span>
//         </Button>
//         {/* <CommentThumbsButton commentId={commentId} type={'LIKE'} showCount /> */}
//         <Button
//           variant={'ghost'}
//           size={'sm'}
//           type='button'
//           disabled={reactionData.isLoading}
//           className={cn(
//             'flex h-6 items-center gap-2 rounded-none rounded-r-full px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50',
//             reactionData.userReaction === 'DISLIKE'
//               ? 'border border-red-600/30 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
//               : 'border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700'
//           )}
//           onClick={() => handleReaction('DISLIKE')}
//           aria-label={`Dislike this ${reactionData.targetType || 'content'}`}
//         >
//           <ThumbsDown
//             size={iconSize}
//             stroke='white'
//             strokeWidth={1.5}
//             style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
//           />
//           <span className='inline-block min-w-[20px] text-center'>
//             {commentId ? reactionUser.dislikes : reactionPostUser.dislikes}
//           </span>
//         </Button>{' '}
//       </div>
//       {(blogOwner || hasLiked) && commentId && (
//         <div className='z-50' onClick={preventLinkAction}>
//           <LikeButton commentId={commentId} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ThumbsLikeButton;

'use client';

import { useCallback, useEffect, useState } from 'react';

import { useCommentReactions } from '@/lib/contexts/like-context';
import { usePostReactions } from '@/lib/contexts/post-like-context';
import { blogAtom } from '@/lib/jotai/blog-atoms';
import { PostProps, PostReactionsProps, ReactionProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

import LikeButton from './like-button';
import { Button } from './ui';

type ThumbsLikeButtonProps = {
  postId?: string;
  commentId?: string;
  reactions?: ReactionProps[] | [];
  currentUserId: string;
  likeIds: string[];
  allLove: string[];
  blog?: PostProps;
  iconSize?: number;
  postInitialReactions?: PostReactionsProps | undefined;
};

type ReactionTarget = {
  id: string;
  type: 'post' | 'comment';
};

const ThumbsLikeButton = ({
  commentId,
  postId,
  reactions,
  currentUserId,
  likeIds,
  blog,
  allLove,
  iconSize = 16,
  postInitialReactions,
}: ThumbsLikeButtonProps) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [formData, setFormData] = useAtom(blogAtom);

  const {
    reactions: postReact,
    updatePostReaction,
    setPostInitialReactions,
    loading: postLoading,
  } = usePostReactions();

  const {
    reactions: commentReact,
    updateCommentReaction,
    loading: commentLoading,
    error,
  } = useCommentReactions();

  const authorId = formData.authorId;
  const blogOwner = authorId === currentUserId;
  const router = useRouter();

  // Set initial post reactions
  useEffect(() => {
    if (postInitialReactions && Object.keys(postInitialReactions).length > 0) {
      setPostInitialReactions(postInitialReactions);
    }
  }, [setPostInitialReactions]);

  const hasLiked = commentId && allLove?.includes(commentId);

  // Get current reaction data from context
  const reactionUser = (commentId && commentReact[commentId]) || {
    likes: 0,
    dislikes: 0,
    userReaction: null,
  };

  const reactionPostUser = (postId && postReact[postId]) || {
    likes: 0,
    dislikes: 0,
    userReaction: null,
  };

  const getReactionTarget = (): ReactionTarget | null => {
    if (commentId) {
      return { id: commentId, type: 'comment' };
    }
    if (postId) {
      return { id: postId, type: 'post' };
    }
    return null;
  };

  const handleReaction = useCallback(
    async (reactionType: 'LIKE' | 'DISLIKE') => {
      const target = getReactionTarget();

      if (!target) {
        console.error('No valid target (postId or commentId) provided');
        return;
      }

      try {
        switch (target.type) {
          case 'comment':
            // console.log('Updating comment reaction for:', target.id);
            await updateCommentReaction(target.id, reactionType);
            break;
          case 'post':
            // console.log('Updating post reaction for:', target.id);
            await updatePostReaction(target.id, reactionType);
            break;
          default:
            console.error('Unknown reaction target type:', target.type);
            return;
        }

        console.log(
          `Successfully updated ${reactionType} for ${target.type}:`,
          target.id
        );
      } catch (err) {
        console.error(`Failed to update ${target.type} reaction:`, err);
      }
    },
    [updateCommentReaction, updatePostReaction]
  );

  const getReactionData = () => {
    const target = getReactionTarget();

    if (!target) {
      return {
        likes: 0,
        dislikes: 0,
        userReaction: null,
        isLoading: false,
        targetType: null,
        targetId: null,
      };
    }

    const baseData =
      target.type === 'comment' ? reactionUser : reactionPostUser;

    const isLoading =
      target.type === 'comment'
        ? commentLoading === target.id
        : postLoading === target.id;

    return {
      ...baseData,
      isLoading,
      targetType: target.type,
      targetId: target.id,
    };
  };

  const handleBookmark = () => setBookmarked(!bookmarked);

  const preventLinkAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const reactionData = getReactionData();

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center text-stone-300'>
        {/* LIKE Button */}
        <Button
          variant={'ghost'}
          size={'sm'}
          type='button'
          disabled={reactionData.isLoading}
          className={`flex h-6 items-center gap-2 rounded-none rounded-l-full px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
            reactionData.userReaction === 'LIKE'
              ? 'border border-blue-600/30 bg-blue-100 text-blue-700 dark:bg-indigo-700/40 dark:text-blue-400'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleReaction('LIKE')}
          aria-label={`Like this ${reactionData.targetType || 'content'}`}
        >
          <ThumbsUp
            size={iconSize}
            stroke='white'
            strokeWidth={1.5}
            className={cn(
              'svg transition-colors',
              reactionData.userReaction === 'LIKE'
                ? 'stroke-1 text-blue-700 dark:stroke-indigo-200 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          />

          <span className='inline-block min-w-[20px] text-center'>
            {reactionData.likes}
          </span>
        </Button>

        {/* DISLIKE Button */}
        <Button
          variant={'ghost'}
          size={'sm'}
          type='button'
          disabled={reactionData.isLoading}
          className={`flex h-6 items-center gap-2 rounded-none rounded-r-full px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
            reactionData.userReaction === 'DISLIKE'
              ? 'border border-red-600/30 bg-red-100 text-red-700 dark:bg-pink-800/20 dark:text-red-300'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleReaction('DISLIKE')}
          aria-label={`Dislike this ${reactionData.targetType || 'content'}`}
        >
          <ThumbsDown
            size={iconSize}
            stroke='white'
            strokeWidth={1.5}
            className={cn(
              'transition-colors',
              reactionData.userReaction === 'DISLIKE'
                ? 'stroke-1 text-red-700 dark:stroke-pink-200 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          />
          <span className='inline-block min-w-[20px] text-center'>
            {reactionData.dislikes}
          </span>
        </Button>
      </div>

      {(blogOwner || hasLiked) && commentId && (
        <div className='z-50' onClick={preventLinkAction}>
          <LikeButton commentId={commentId} />
        </div>
      )}
    </div>
  );
};

export default ThumbsLikeButton;
