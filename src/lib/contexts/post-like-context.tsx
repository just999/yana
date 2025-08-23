// 'use client';

// import { createContext, useCallback, useContext, useState } from 'react';

// import { toast } from 'sonner';

// interface PostReaction {
//   likes: number;
//   dislikes: number;
//   userReaction: 'LIKE' | 'DISLIKE' | null;
// }

// interface PostReactions {
//   [postId: string]: PostReaction;
// }

// interface PostReactionsContextType {
//   reactions: PostReactions;
//   loading: string | null;
//   error: string | null;
//   updatePostReaction: (
//     postId: string,
//     type: 'LIKE' | 'DISLIKE'
//   ) => Promise<void>;
//   setPostInitialReactions: (reactions: PostReactions) => void;
//   clearReactions: () => void;
// }

// const PostReactionsContext = createContext<
//   PostReactionsContextType | undefined
// >(undefined);

// // Provider component
// export const PostReactionsProvider: React.FC<{
//   children: React.ReactNode;
//   // Server actions passed as props
//   updatePostReactionAction: (
//     postId: string,
//     type: 'LIKE' | 'DISLIKE'
//   ) => Promise<{
//     error?: boolean;
//     message: string;
//     data?: PostReaction;
//   }>;
// }> = ({ children, updatePostReactionAction }) => {
//   const [reactions, setReactions] = useState<PostReactions>({});
//   const [loading, setLoading] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Set initial reactions (called from server components)
//   const setPostInitialReactions = useCallback(
//     (initialReactions: PostReactions) => {
//       setReactions((prev) => ({
//         ...prev,
//         ...initialReactions,
//       }));
//     },
//     []
//   );

//   // Update reaction with optimistic updates and server action
//   const updatePostReaction = useCallback(
//     async (postId: string, type: 'LIKE' | 'DISLIKE') => {

//       const currentReaction = reactions[postId];
//       if (!currentReaction) {
//         console.warn(`No reaction data found for post ${postId}`);
//         return;
//       }

//       // Optimistic update
//       const optimisticUpdate = calculateNewReaction(currentReaction, type);
//       setReactions((prev) => ({
//         ...prev,
//         [postId]: optimisticUpdate,
//       }));

//       setLoading(postId);
//       setError(null);

//       try {
//         // Call server action
//         const result = await updatePostReactionAction(postId, type);

//         if (result.error) {
//           toast.error(result.message);
//           // Update with server response

//           setReactions((prev) => ({
//             ...prev,
//             [postId]: currentReaction,
//           }));

//           setError(result.message || 'Failed to update reaction');
//         } else {
//           // Revert optimistic update on error
//           setReactions((prev) => ({
//             ...prev,
//             [postId]: result.data!,
//           }));

//           toast.success(result.message);
//         }
//       } catch (err) {
//         // Revert optimistic update on error
//         setReactions((prev) => ({
//           ...prev,
//           [postId]: currentReaction,
//         }));

//         setError(
//           err instanceof Error ? err.message : 'Failed to update reaction'
//         );
//         console.error('Error updating reaction:', err);
//       } finally {
//         setLoading(null);
//       }
//     },
//     [reactions, updatePostReactionAction]
//   );

//   // Helper function to calculate new reaction state
//   const calculateNewReaction = (
//     currentReaction: PostReaction,
//     type: 'LIKE' | 'DISLIKE'
//   ): PostReaction => {
//     let newLikes = currentReaction.likes;
//     let newDislikes = currentReaction.dislikes;
//     let newUserReaction: 'LIKE' | 'DISLIKE' | null = type;

//     if (type === 'LIKE') {
//       if (currentReaction.userReaction === 'LIKE') {
//         // Remove like
//         newLikes -= 1;
//         newUserReaction = null;
//       } else if (currentReaction.userReaction === 'DISLIKE') {
//         // Switch from dislike to like
//         newLikes += 1;
//         newDislikes -= 1;
//         newUserReaction = 'LIKE';
//       } else {
//         // Add like
//         newLikes += 1;
//         newUserReaction = 'LIKE';
//       }
//     }

//     if (type === 'DISLIKE') {
//       if (currentReaction.userReaction === 'DISLIKE') {
//         // Remove dislike
//         newDislikes -= 1;
//         newUserReaction = null;
//       } else if (currentReaction.userReaction === 'LIKE') {
//         // Switch from like to dislike
//         newDislikes += 1;
//         newLikes -= 1;
//         newUserReaction = 'DISLIKE';
//       } else {
//         // Add dislike
//         newDislikes += 1;
//         newUserReaction = 'DISLIKE';
//       }
//     }

//     return {
//       likes: Math.max(0, newLikes),
//       dislikes: Math.max(0, newDislikes),
//       userReaction: newUserReaction,
//     };
//   };

//   // Clear all reactions
//   const clearReactions = useCallback(() => {
//     setReactions({});
//     setError(null);
//     setLoading(null);
//   }, []);

//   const value = {
//     reactions,
//     loading,
//     error,
//     updatePostReaction,
//     setPostInitialReactions,
//     clearReactions,
//   };

//   return (
//     <PostReactionsContext.Provider value={value}>
//       {children}
//     </PostReactionsContext.Provider>
//   );
// };

// // Hook to use post reactions
// export const usePostReactions = () => {
//   const context = useContext(PostReactionsContext);
//   if (!context) {
//     throw new Error(
//       'usePostReactions must be used within PostReactionsProvider'
//     );
//   }
//   return context;
// };

// lib/contexts/post-like-context.tsx - Add debugging
'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { toast } from 'sonner';

interface PostReaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

interface PostReactions {
  [postId: string]: PostReaction;
}

interface PostReactionsContextType {
  reactions: PostReactions;
  loading: string | null;
  error: string | null;
  updatePostReaction: (
    postId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<void>;
  setPostInitialReactions: (reactions: PostReactions) => void;
  clearReactions: () => void;
}

const PostReactionsContext = createContext<
  PostReactionsContextType | undefined
>(undefined);

export const PostReactionsProvider: React.FC<{
  children: React.ReactNode;
  updatePostReactionAction: (
    postId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<{
    error?: boolean;
    message: string;
    data?: PostReaction;
  }>;
}> = ({ children, updatePostReactionAction }) => {
  const [reactions, setReactions] = useState<PostReactions>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPostInitialReactions = useCallback(
    (initialReactions: PostReactions) => {
      setReactions((prev) => ({
        ...prev,
        ...initialReactions,
      }));
    },
    []
  );

  const updatePostReaction = useCallback(
    async (postId: string, type: 'LIKE' | 'DISLIKE') => {
      const currentReaction = reactions[postId];
      if (!currentReaction) {
        return;
      }

      // Calculate optimistic update
      const optimisticUpdate = calculateNewReaction(currentReaction, type);

      // Apply optimistic update
      setReactions((prev) => {
        const newReactions = {
          ...prev,
          [postId]: optimisticUpdate,
        };

        return newReactions;
      });

      setLoading(postId);
      setError(null);

      try {
        const result = await updatePostReactionAction(postId, type);

        if (result.error) {
          // console.log(
          //   '❌ POST: Server action failed, reverting optimistic update'
          // );
          // console.log('❌ POST: Error:', result.error);
          toast.error(result.message);
          // Revert optimistic update
          setReactions((prev) => ({
            ...prev,
            [postId]: currentReaction,
          }));

          setError(result.message || 'Failed to update post reaction');
        } else {
          // console.log(
          //   '✅ POST: Server action successful, updating with server data:',
          //   result.message
          // );

          toast.success(result.message);

          setReactions((prev) => {
            const finalReactions = {
              ...prev,
              [postId]: result.data!,
            };

            return finalReactions;
          });
        }
      } catch (err) {
        // console.error('❌ POST: Exception in updatePostReaction:', err);

        // Revert optimistic update
        setReactions((prev) => ({
          ...prev,
          [postId]: currentReaction,
        }));

        setError(
          err instanceof Error ? err.message : 'Failed to update post reaction'
        );
      } finally {
        setLoading(null);
      }
    },
    [reactions, updatePostReactionAction]
  );

  const calculateNewReaction = (
    currentReaction: PostReaction,
    type: 'LIKE' | 'DISLIKE'
  ): PostReaction => {
    // console.log('🔄 POST: Calculating new reaction:', {
    //   currentReaction,
    //   type,
    // });

    let newLikes = currentReaction.likes;
    let newDislikes = currentReaction.dislikes;
    let newUserReaction: 'LIKE' | 'DISLIKE' | null = type;

    if (type === 'LIKE') {
      if (currentReaction.userReaction === 'LIKE') {
        // Remove like
        newLikes -= 1;
        newUserReaction = null;
        console.log('🔄 POST: Removing LIKE');
      } else if (currentReaction.userReaction === 'DISLIKE') {
        // Switch from dislike to like
        newLikes += 1;
        newDislikes -= 1;
        newUserReaction = 'LIKE';
        // console.log('🔄 POST: Switching from DISLIKE to LIKE');
      } else {
        // Add like
        newLikes += 1;
        newUserReaction = 'LIKE';
        console.log('🔄 POST: Adding LIKE');
      }
    }

    if (type === 'DISLIKE') {
      if (currentReaction.userReaction === 'DISLIKE') {
        // Remove dislike
        newDislikes -= 1;
        newUserReaction = null;
        console.log('🔄 POST: Removing DISLIKE');
      } else if (currentReaction.userReaction === 'LIKE') {
        // Switch from like to dislike
        newDislikes += 1;
        newLikes -= 1;
        newUserReaction = 'DISLIKE';
        // console.log('🔄 POST: Switching from LIKE to DISLIKE');
      } else {
        // Add dislike
        newDislikes += 1;
        newUserReaction = 'DISLIKE';
        console.log('🔄 POST: Adding DISLIKE');
      }
    }

    const result = {
      likes: Math.max(0, newLikes),
      dislikes: Math.max(0, newDislikes),
      userReaction: newUserReaction,
    };

    // console.log('🔄 POST: Calculated result:', result);
    return result;
  };

  const clearReactions = useCallback(() => {
    setReactions({});
    setError(null);
    setLoading(null);
  }, []);

  const value = {
    reactions,
    loading,
    error,
    updatePostReaction,
    setPostInitialReactions,
    clearReactions,
  };

  return (
    <PostReactionsContext.Provider value={value}>
      {children}
    </PostReactionsContext.Provider>
  );
};

export const usePostReactions = () => {
  const context = useContext(PostReactionsContext);
  if (!context) {
    throw new Error(
      'usePostReactions must be used within PostReactionsProvider'
    );
  }
  return context;
};
