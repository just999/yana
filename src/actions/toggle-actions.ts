'use server';

import { error } from 'console';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { reactionSchema } from '@/lib/schemas/reaction-schemas';
import { PostReaction } from '@/lib/types';
import { formatError } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import z from 'zod';

import { getAuthUserId } from './auth-actions';

export const toggleLikeComment = async (
  commentId: string,
  reactionType: 'LIKE' | 'DISLIKE'
) => {
  try {
    // const session = await auth();
    // if (!session) {
    //   return {
    //     error: true,
    //     message: 'unauthorized',
    //   };
    // }

    const userId = await getAuthUserId();

    // Find existing reaction
    const existingReaction = await db.reaction.findFirst({
      where: {
        userId,
        commentId,
      },
    });

    if (reactionType) {
      await db.reaction.delete({
        where: {
          id: existingReaction?.id,
        },
      });
    } else if (reactionType === 'LIKE') {
      await db.reaction.create({
        data: {
          userId: userId,
          commentId,
          type: 'LIKE',
        },
      });
      return {
        error: false,
        message: 'successfully like',
      };
    } else if (reactionType === 'DISLIKE') {
      await db.reaction.create({
        data: {
          userId: userId,
          commentId,
          type: 'DISLIKE',
        },
      });

      return {
        error: false,
        message: 'successfully dislike',
      };
    }
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const getReactionByCommentId = async (commentId: string) => {
  try {
    // const session = await auth();
    // if (!session) {
    //   return {
    //     error: true,
    //     message: 'unauthorized',
    //   };
    // }
    const userId = await getAuthUserId();

    const reaction = await db.reaction.findFirst({
      where: {
        userId,
        commentId,
      },
      include: {
        comment: true,
        user: true,
        post: true,
      },
    });

    if (reaction) {
      return {
        error: true,
        message: 'no comment was found',
        data: reaction,
      };
    }
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// export const toggleLoveComment = async (
//   commentId: string,
//   isLiked: boolean
// ) => {
//   try {
//     const userId = await getAuthUserId();

//     if (isLiked) {
//       await db.like.delete({
//         where: {
//           userId_commentId: {
//             userId,
//             commentId,
//           },
//         },
//       });
//     } else {
//       await db.like.create({
//         data: {
//           userId,
//           commentId,
//         },
//       });
//       revalidatePath('/blogs');
//     }

//     return {
//       error: false,
//       message: 'successfully update ',
//     };
//   } catch (err) {
//     return {
//       error: true,
//       message: formatError(err),
//     };
//   }
// };

export const toggleLoveComment = async (
  commentId: string,
  isLiked: boolean
) => {
  try {
    const userId = await getAuthUserId();

    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return {
        error: true,
        message: 'no comment found',
      };
    }

    if (isLiked) {
      await db.like.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });
    } else {
      await db.like.create({
        data: {
          userId,
          commentId,
          postId: comment.postId,
        },
      });
    }

    // Get updated like count and user IDs
    const [likeCount, likedUsers] = await Promise.all([
      db.like.count({
        where: { commentId },
      }),
      db.like.findMany({
        where: { commentId },
        select: { userId: true },
      }),
    ]);

    const userIds = likedUsers.map((like) => like.userId);

    revalidatePath('/blogs');

    return {
      error: false,
      message: 'Successfully updated',
      data: {
        likeCount,
        userIds,
        hasUserLiked: userIds.includes(userId),
        commentId,
      },
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
      data: null,
    };
  }
};

// Additional server action to get current like status
export const getLikeStatus = async (commentId: string) => {
  try {
    const userId = await getAuthUserId();

    const [likeCount, userLike] = await Promise.all([
      db.like.count({
        where: { commentId },
      }),
      db.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      }),
    ]);

    return {
      error: false,
      data: {
        likeCount,
        hasUserLiked: !!userLike,
        commentId,
      },
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
      data: null,
    };
  }
};

// Server action to get like count for multiple comments
export const getMultipleLikeStatus = async (commentIds: string[]) => {
  try {
    const userId = await getAuthUserId();

    const [likeCounts, userLikes] = await Promise.all([
      db.like.groupBy({
        by: ['commentId'],
        where: { commentId: { in: commentIds } },
        _count: { userId: true },
      }),
      db.like.findMany({
        where: {
          userId,
          commentId: { in: commentIds },
        },
        select: { commentId: true },
      }),
    ]);

    const likeData = commentIds.map((commentId) => {
      const countData = likeCounts.find((item) => item.commentId === commentId);
      const hasUserLiked = userLikes.some(
        (like) => like.commentId === commentId
      );

      return {
        commentId,
        likeCount: countData?._count.userId || 0,
        hasUserLiked,
      };
    });

    return {
      error: false,
      data: likeData,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
      data: null,
    };
  }
};

export const getCurrentUserLoveIds = async () => {
  try {
    const userId = await getAuthUserId();

    const likeIds = await db.like.findMany({
      where: {
        userId,
      },
      select: {
        commentId: true,
      },
    });
    return {
      error: false,
      message: 'successfully fetch user love ids',
      data: likeIds.map((like) => like.commentId),
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// export const commentActionsAtom = atom(
export const getAllLoveIds = async () => {
  try {
    const userId = await getAuthUserId();

    const likeIds = await db.like.findMany({
      select: {
        commentId: true,
      },
    });
    return {
      error: false,
      message: 'successfully fetch user love ids',
      data: likeIds.map((like) => like.commentId),
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// export const commentActionsAtom = atom(
//   null,
//   async (
//     get,
//     set,
//     { commentId, isLiked }: { commentId: string; isLiked: boolean }
//   ) => {
//     const userId = await getAuthUserId();

//     try {
//       if (isLiked) {
//         await db.like.delete({
//           where: { userId_commentId: { userId, commentId } },
//         });
//         set(loveIdsAtom, (prev) => prev.filter((id) => id !== commentId));
//       } else {
//         await db.like.create({ data: { userId, commentId } });
//         set(loveIdsAtom, (prev) => [...prev, commentId]);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }
// );

interface ToggleReactionInput {
  type: 'LIKE' | 'DISLIKE';
  postId?: string;
  commentId?: string;
}

interface ToggleActionResult {
  action: 'removed' | 'updated' | 'created';
  type: 'LIKE' | 'DISLIKE';
}

interface ToggleReactionSuccessData {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
  action: 'removed' | 'updated' | 'created';
}

interface ToggleReactionSuccessResponse {
  success: true;
  data: ToggleReactionSuccessData;
}

interface ToggleReactionErrorResponse {
  success: false;
  error: string;
  details?: z.ZodIssue[];
}
export async function toggleReaction(
  input: ToggleReactionInput
): Promise<ToggleReactionSuccessResponse | ToggleReactionErrorResponse> {
  try {
    // Validate input
    const validatedInput = reactionSchema.parse(input);
    const { type, postId, commentId } = validatedInput;

    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Check if user already has a reaction
    const existingReaction = await db.reaction.findFirst({
      where: {
        userId,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
    });

    let result: ToggleActionResult;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking the same type
        await db.reaction.delete({
          where: { id: existingReaction.id },
        });
        result = { action: 'removed', type };
      } else {
        // Update reaction type if different
        const updatedReaction = await db.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
        result = { action: 'updated', type: updatedReaction.type };
      }
    } else {
      // Create new reaction
      const createdReaction = await db.reaction.create({
        data: {
          userId,
          type,
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      });
      result = { action: 'created', type: createdReaction.type };
    }

    // Get updated counts
    const [likes, dislikes] = await Promise.all([
      db.reaction.count({
        where: {
          type: 'LIKE',
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      }),
      db.reaction.count({
        where: {
          type: 'DISLIKE',
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      }),
    ]);

    // Get user's current reaction
    const userReaction = await db.reaction.findFirst({
      where: {
        userId,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
      select: { type: true },
    });

    // Revalidate relevant paths
    if (postId) {
      revalidatePath(`/posts/${postId}`);
      revalidatePath('/posts'); // if you have a posts list page
    }
    if (commentId) {
      // You might need to revalidate the post page that contains this comment
      const comment = await db.comment.findUnique({
        where: { id: commentId },
        select: { postId: true },
      });
      if (comment?.postId) {
        revalidatePath(`/posts/${comment.postId}`);
      }
    }

    return {
      success: true,
      data: {
        likes,
        dislikes,
        userReaction: userReaction?.type || null,
        action: result.action,
      },
    };
  } catch (error) {
    console.error('Error toggling reaction:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to toggle reaction',
    };
  }
}

// Alternative: Separate functions if you prefer more specific actions
export async function togglePostReaction(
  postId: string,
  type: 'LIKE' | 'DISLIKE'
) {
  return toggleReaction({ postId, type });
}

export async function toggleCommentReaction(
  commentId: string,
  type: 'LIKE' | 'DISLIKE'
) {
  return toggleReaction({ commentId, type });
}

// Get reaction counts for a post or comment
export async function getReactionCounts(postId?: string, commentId?: string) {
  if (!postId && !commentId) {
    throw new Error('Either postId or commentId must be provided');
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;

    const [likes, dislikes, userReaction] = await Promise.all([
      db.reaction.count({
        where: {
          type: 'LIKE',
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      }),
      db.reaction.count({
        where: {
          type: 'DISLIKE',
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      }),
      userId
        ? db.reaction.findFirst({
            where: {
              userId,
              ...(postId && { postId }),
              ...(commentId && { commentId }),
            },
            select: { type: true },
          })
        : null,
    ]);

    return {
      success: true,
      data: {
        likes,
        dislikes,
        userReaction: userReaction?.type || null,
      },
    };
  } catch (error) {
    console.error('Error getting reaction counts:', error);
    return {
      success: false,
      error: 'Failed to get reaction counts',
    };
  }
}

export async function updatePostReaction(
  postId: string,
  type: 'LIKE' | 'DISLIKE'
): Promise<{
  error: boolean;
  message: string;
  data?: PostReaction;
}> {
  try {
    console.log('🔥 POST SERVER: updatePostReaction called:', { postId, type });

    const session = await auth();
    const userId = session?.user?.id;

    console.log('🔥 POST SERVER: User session:', { userId });

    if (!userId) {
      console.log('❌ POST SERVER: No user session found');
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    if (!['LIKE', 'DISLIKE'].includes(type)) {
      console.log('❌ POST SERVER: Invalid reaction type:', type);
      return {
        error: true,
        message: 'no reaction',
      };
    }

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    console.log('🔥 POST SERVER: Post found:', !!post);

    if (!post) {
      console.log('❌ POST SERVER: Post not found:', postId);
      return {
        error: true,
        message: 'no post',
      };
    }

    // await db.$runCommandRaw({
    //   createIndexes: 'Reaction',
    //   indexes: [
    //     {
    //       key: { userId: 1, commentId: 1 },
    //       name: 'userId_commentId_unique',
    //       unique: true,
    //       partialFilterExpression: {
    //         commentId: { $exists: true, $ne: null },
    //       },
    //     },
    //   ],
    // });

    // Find existing reaction
    const existingReaction = await db.reaction.findFirst({
      where: {
        userId,
        postId,
      },
    });

    console.log('🔥 POST SERVER: Existing reaction:', existingReaction);

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking the same type
        console.log('🔥 POST SERVER: Removing existing reaction');
        await db.reaction.delete({
          where: {
            id: existingReaction.id,
            userId,
            postId,
          },
        });
      } else {
        // Update reaction type if different
        console.log(
          '🔥 POST SERVER: Updating reaction type from',
          existingReaction.type,
          'to',
          type
        );
        await db.reaction.update({
          where: {
            id: existingReaction.id,
            userId,
            postId,
          },
          data: {
            type,
          },
        });
      }
    } else {
      // Create new reaction
      console.log('🔥 POST SERVER: Creating new reaction');
      await db.reaction.create({
        data: {
          userId,
          postId,
          type,
        },
      });
    }

    // Get updated counts and user reaction
    const [likesCount, dislikesCount, userReaction] = await Promise.all([
      db.reaction.count({
        where: {
          id: existingReaction?.id,
          userId,
          postId,
          type: 'LIKE',
        },
      }),
      db.reaction.count({
        where: {
          id: existingReaction?.id,
          userId,
          postId,
          type: 'DISLIKE',
        },
      }),
      db.reaction.findFirst({
        where: {
          id: existingReaction?.id,
          userId,
          postId,
        },
        select: {
          type: true,
        },
      }),
    ]);

    console.log('🔥 POST SERVER: Database counts:', {
      likesCount,
      dislikesCount,
    });
    console.log('🔥 POST SERVER: User reaction from DB:', userReaction);

    const reactionData: PostReaction = {
      likes: likesCount,
      dislikes: dislikesCount,
      userReaction: userReaction?.type || null,
    };

    console.log('🔥 POST SERVER: Final reaction data:', reactionData);

    return {
      error: false,
      message: 'successfully to react',
      data: reactionData,
    };
  } catch (err) {
    console.error('❌ POST SERVER: Error updating post reaction:', error);
    return {
      error: true,
      message: formatError(err),
    };
  }
}
