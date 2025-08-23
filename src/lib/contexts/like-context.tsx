// 'use client';

// import { createContext, useContext, useState } from 'react';

// interface CommentReaction {
//   likes: number;
//   dislikes: number;
//   userReaction: 'LIKE' | 'DISLIKE' | null;
// }

// interface CommentReactions {
//   [commentId: string]: CommentReaction;
// }

// interface CommentReactionsContextType {
//   reactions: CommentReactions;
//   updateReaction: (commentId: string, type: 'LIKE' | 'DISLIKE') => void;
// }

// const CommentReactionsContext = createContext<
//   CommentReactionsContextType | undefined
// >(undefined);

// // Provider component
// export const CommentReactionsProvider: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => {
//   const [reactions, setReactions] = useState<CommentReactions>({
//     'comment-1': { likes: 24, dislikes: 2, userReaction: null },
//     'comment-2': { likes: 156, dislikes: 8, userReaction: 'LIKE' },
//     'comment-3': { likes: 3, dislikes: 0, userReaction: null },
//     'comment-4': { likes: 89, dislikes: 5, userReaction: 'DISLIKE' },
//     'comment-5': { likes: 0, dislikes: 1, userReaction: null },
//   });

//   const updateReaction = (commentId: string, type: 'LIKE' | 'DISLIKE') => {
//     setReactions((prev) => {
//       const currentReaction = prev[commentId];
//       if (!currentReaction) return prev;

//       let newLikes = currentReaction.likes;
//       let newDislikes = currentReaction.dislikes;
//       let newUserReaction: 'LIKE' | 'DISLIKE' | null = type;

//       // Handle like button click
//       if (type === 'LIKE') {
//         if (currentReaction.userReaction === 'LIKE') {
//           // Remove like
//           newLikes -= 1;
//           newUserReaction = null;
//         } else if (currentReaction.userReaction === 'DISLIKE') {
//           // Switch from dislike to like
//           newLikes += 1;
//           newDislikes -= 1;
//           newUserReaction = 'LIKE';
//         } else {
//           // Add like
//           newLikes += 1;
//           newUserReaction = 'LIKE';
//         }
//       }

//       // Handle dislike button click
//       if (type === 'DISLIKE') {
//         if (currentReaction.userReaction === 'DISLIKE') {
//           // Remove dislike
//           newDislikes -= 1;
//           newUserReaction = null;
//         } else if (currentReaction.userReaction === 'LIKE') {
//           // Switch from like to dislike
//           newDislikes += 1;
//           newLikes -= 1;
//           newUserReaction = 'DISLIKE';
//         } else {
//           // Add dislike
//           newDislikes += 1;
//           newUserReaction = 'DISLIKE';
//         }
//       }

//       return {
//         ...prev,
//         [commentId]: {
//           likes: Math.max(0, newLikes),
//           dislikes: Math.max(0, newDislikes),
//           userReaction: newUserReaction,
//         },
//       };
//     });
//   };

//   return (
//     <CommentReactionsContext.Provider value={{ reactions, updateReaction }}>
//       {children}
//     </CommentReactionsContext.Provider>
//   );
// };

// // Hook to use comment reactions
// export const useCommentReactions = () => {
//   const context = useContext(CommentReactionsContext);
//   if (!context) {
//     throw new Error(
//       'useCommentReactions must be used within CommentReactionsProvider'
//     );
//   }
//   return context;
// };

'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { toast } from 'sonner';

interface CommentReaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

interface CommentReactions {
  [commentId: string]: CommentReaction;
}

interface CommentReactionsContextType {
  reactions: CommentReactions;
  loading: string | null;
  error: string | null;
  updateCommentReaction: (
    commentId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<void>;
  setInitialReactions: (reactions: CommentReactions) => void;
  clearReactions: () => void;
}

const CommentReactionsContext = createContext<
  CommentReactionsContextType | undefined
>(undefined);

// Provider component
export const CommentReactionsProvider: React.FC<{
  children: React.ReactNode;
  // Server actions passed as props
  updateReactionAction: (
    commentId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<{
    error?: boolean;
    message: string;
    data?: CommentReaction;
  }>;
}> = ({ children, updateReactionAction }) => {
  const [reactions, setReactions] = useState<CommentReactions>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set initial reactions (called from server components)
  const setInitialReactions = useCallback(
    (initialReactions: CommentReactions) => {
      setReactions((prev) => ({
        ...prev,
        ...initialReactions,
      }));
    },
    []
  );

  // Update reaction with optimistic updates and server action
  const updateCommentReaction = useCallback(
    async (commentId: string, type: 'LIKE' | 'DISLIKE') => {
      const currentReaction = reactions[commentId];
      if (!currentReaction) {
        console.warn(`No reaction data found for comment ${commentId}`);
        return;
      }

      // Optimistic update
      const optimisticUpdate = calculateNewReaction(currentReaction, type);
      setReactions((prev) => ({
        ...prev,
        [commentId]: optimisticUpdate,
      }));

      setLoading(commentId);
      setError(null);

      try {
        // Call server action
        const result = await updateReactionAction(commentId, type);

        if (result.error) {
          toast.error(result.message);
          // Update with server response

          setReactions((prev) => ({
            ...prev,
            [commentId]: currentReaction,
          }));

          setError(result.message || 'Failed to update reaction');
        } else {
          // Revert optimistic update on error
          setReactions((prev) => ({
            ...prev,
            [commentId]: result.data!,
          }));

          toast.success(result.message);
        }
      } catch (err) {
        // Revert optimistic update on error
        setReactions((prev) => ({
          ...prev,
          [commentId]: currentReaction,
        }));

        setError(
          err instanceof Error ? err.message : 'Failed to update reaction'
        );
        console.error('Error updating reaction:', err);
      } finally {
        setLoading(null);
      }
    },
    [reactions, updateReactionAction]
  );

  // Helper function to calculate new reaction state
  const calculateNewReaction = (
    currentReaction: CommentReaction,
    type: 'LIKE' | 'DISLIKE'
  ): CommentReaction => {
    let newLikes = currentReaction.likes;
    let newDislikes = currentReaction.dislikes;
    let newUserReaction: 'LIKE' | 'DISLIKE' | null = type;

    if (type === 'LIKE') {
      if (currentReaction.userReaction === 'LIKE') {
        // Remove like
        newLikes -= 1;
        newUserReaction = null;
      } else if (currentReaction.userReaction === 'DISLIKE') {
        // Switch from dislike to like
        newLikes += 1;
        newDislikes -= 1;
        newUserReaction = 'LIKE';
      } else {
        // Add like
        newLikes += 1;
        newUserReaction = 'LIKE';
      }
    }

    if (type === 'DISLIKE') {
      if (currentReaction.userReaction === 'DISLIKE') {
        // Remove dislike
        newDislikes -= 1;
        newUserReaction = null;
      } else if (currentReaction.userReaction === 'LIKE') {
        // Switch from like to dislike
        newDislikes += 1;
        newLikes -= 1;
        newUserReaction = 'DISLIKE';
      } else {
        // Add dislike
        newDislikes += 1;
        newUserReaction = 'DISLIKE';
      }
    }

    return {
      likes: Math.max(0, newLikes),
      dislikes: Math.max(0, newDislikes),
      userReaction: newUserReaction,
    };
  };

  // Clear all reactions
  const clearReactions = useCallback(() => {
    setReactions({});
    setError(null);
    setLoading(null);
  }, []);

  const value = {
    reactions,
    loading,
    error,
    updateCommentReaction,
    setInitialReactions,
    clearReactions,
  };

  return (
    <CommentReactionsContext.Provider value={value}>
      {children}
    </CommentReactionsContext.Provider>
  );
};

// Hook to use comment reactions
export const useCommentReactions = () => {
  const context = useContext(CommentReactionsContext);
  if (!context) {
    throw new Error(
      'useCommentReactions must be used within CommentReactionsProvider'
    );
  }
  return context;
};
