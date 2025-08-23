'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { toast } from 'sonner';

export interface Reaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

interface Reactions {
  posts: { [postId: string]: Reaction };
  comments: { [commentId: string]: Reaction };
}

interface ReactionsContextType {
  reactions: Reactions;
  loading: string | null;
  error: string | null;
  updatePostReaction: (
    postId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<void>;
  updateCommentReaction: (
    commentId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<void>;
  setInitialReactions: (reactions: Partial<Reactions>) => void;
  clearReactions: () => void;
  getPostReaction: (postId: string) => Reaction | undefined;
  getCommentReaction: (commentId: string) => Reaction | undefined;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(
  undefined
);

// Provider component
export const ReactionsProvider: React.FC<{
  children: React.ReactNode;
  // Server actions passed as props
  updatePostReactionAction: (
    postId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<{
    error?: boolean;
    message: string;
    data?: Reaction;
  }>;
  updateCommentReactionAction: (
    commentId: string,
    type: 'LIKE' | 'DISLIKE'
  ) => Promise<{
    error?: boolean;
    message: string;
    data?: Reaction;
  }>;
}> = ({ children, updatePostReactionAction, updateCommentReactionAction }) => {
  const [reactions, setReactions] = useState<Reactions>({
    posts: {},
    comments: {},
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set initial reactions (called from server components)
  const setInitialReactions = useCallback(
    (initialReactions: Partial<Reactions>) => {
      setReactions((prev) => ({
        posts: { ...prev.posts, ...(initialReactions.posts || {}) },
        comments: { ...prev.comments, ...(initialReactions.comments || {}) },
      }));
    },
    []
  );

  // Helper function to calculate new reaction state
  const calculateNewReaction = (
    currentReaction: Reaction,
    type: 'LIKE' | 'DISLIKE'
  ): Reaction => {
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

  // Generic update function
  const updateReaction = async (
    id: string,
    type: 'LIKE' | 'DISLIKE',
    reactionType: 'posts' | 'comments',
    serverAction: (
      id: string,
      type: 'LIKE' | 'DISLIKE'
    ) => Promise<{
      error?: boolean;
      message: string;
      data?: Reaction;
    }>
  ) => {
    const currentReaction = reactions[reactionType][id];
    if (!currentReaction) {
      console.warn(
        `No reaction data found for ${reactionType.slice(0, -1)} ${id}`
      );
      return;
    }

    // Optimistic update
    const optimisticUpdate = calculateNewReaction(currentReaction, type);
    setReactions((prev) => ({
      ...prev,
      [reactionType]: {
        ...prev[reactionType],
        [id]: optimisticUpdate,
      },
    }));

    setLoading(id);
    setError(null);

    try {
      // Call server action
      const result = await serverAction(id, type);

      if (result.error) {
        toast.error(result.message);
        // Revert optimistic update on error
        setReactions((prev) => ({
          ...prev,
          [reactionType]: {
            ...prev[reactionType],
            [id]: currentReaction,
          },
        }));
        setError(result.message || 'Failed to update reaction');
      } else {
        // Update with server response
        setReactions((prev) => ({
          ...prev,
          [reactionType]: {
            ...prev[reactionType],
            [id]: result.data!,
          },
        }));
        toast.success(result.message);
      }
    } catch (err) {
      // Revert optimistic update on error
      setReactions((prev) => ({
        ...prev,
        [reactionType]: {
          ...prev[reactionType],
          [id]: currentReaction,
        },
      }));

      setError(
        err instanceof Error ? err.message : 'Failed to update reaction'
      );
      console.error(`Error updating ${reactionType} reaction:`, err);
    } finally {
      setLoading(null);
    }
  };

  // Update post reaction
  const updatePostReaction = useCallback(
    async (postId: string, type: 'LIKE' | 'DISLIKE') => {
      await updateReaction(postId, type, 'posts', updatePostReactionAction);
    },
    [reactions, updatePostReactionAction]
  );

  // Update comment reaction
  const updateCommentReaction = useCallback(
    async (commentId: string, type: 'LIKE' | 'DISLIKE') => {
      await updateReaction(
        commentId,
        type,
        'comments',
        updateCommentReactionAction
      );
    },
    [reactions, updateCommentReactionAction]
  );

  // Helper functions to get specific reactions
  const getPostReaction = useCallback(
    (postId: string) => reactions.posts[postId],
    [reactions.posts]
  );

  const getCommentReaction = useCallback(
    (commentId: string) => reactions.comments[commentId],
    [reactions.comments]
  );

  // Clear all reactions
  const clearReactions = useCallback(() => {
    setReactions({ posts: {}, comments: {} });
    setError(null);
    setLoading(null);
  }, []);

  const value = {
    reactions,
    loading,
    error,
    updatePostReaction,
    updateCommentReaction,
    setInitialReactions,
    clearReactions,
    getPostReaction,
    getCommentReaction,
  };

  return (
    <ReactionsContext.Provider value={value}>
      {children}
    </ReactionsContext.Provider>
  );
};

// Hook to use reactions
export const useReactions = () => {
  const context = useContext(ReactionsContext);
  if (!context) {
    throw new Error('useReactions must be used within ReactionsProvider');
  }
  return context;
};

// Convenience hooks for specific reaction types
export const usePostReactions = () => {
  const {
    reactions,
    loading,
    error,
    updatePostReaction,
    getPostReaction,
    setInitialReactions,
  } = useReactions();

  return {
    postReactions: reactions.posts,
    loading,
    error,
    updatePostReaction,
    getPostReaction,
    setInitialReactions,
  };
};

export const useCommentReactions = () => {
  const {
    reactions,
    loading,
    error,
    updateCommentReaction,
    getCommentReaction,
    setInitialReactions,
  } = useReactions();

  return {
    commentReactions: reactions.comments,
    loading,
    error,
    updateCommentReaction,
    getCommentReaction,
    setInitialReactions,
  };
};
