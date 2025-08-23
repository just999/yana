'use server';

import { getAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { commentSchema } from '@/lib/schemas/blog-schemas';
import { commentReportSchema } from '@/lib/schemas/reaction-schemas';
import {
  CommentReaction,
  CommentReactionsProps,
  CommentsProps,
  PostReactionsProps,
} from '@/lib/types';
import { formatError } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export const getCommentByPostId = async (postId: string) => {
  try {
    const session = await auth();

    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }

    const comments = await db.comment.findMany({
      where: {
        postId,
      },
      include: {
        user: true,
        reactions: {
          include: {
            user: true,
            post: true,
            comment: true,
          },
        },
        post: {
          include: {
            author: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
        children: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!comments)
      return {
        error: true,
        message: 'no comment was found',
      };

    return {
      error: false,
      message: 'successfully fetch comments',
      data: comments,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const createComment = async (
  {
    postId,
    topCommentId,
  }: {
    postId: string;
    topCommentId: string | undefined;
  },
  formData: FormData
) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }

    const validated = commentSchema.safeParse({
      comment: formData.get('comment'),
    });

    if (!validated.success) {
      return {
        error: true,
        message: 'no comment',
      };
    }

    // Ensure comment exists and is not undefined
    if (!validated.data.comment) {
      return {
        error: true,
        message: 'comment is required',
      };
    }

    const data = await db.comment.create({
      data: {
        comment: validated.data?.comment,
        postId: postId,
        parentId: topCommentId || undefined,
        userId: session.user.id,
      },
    });

    return {
      error: false,
      message: 'Comment created successfully',
      data: data,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const editComment = async (
  {
    commentId,
    postId,
  }: {
    commentId: string | undefined;
    postId: string;
  },
  formData: FormData
) => {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }

    const validated = commentSchema.safeParse({
      comment: formData.get('comment'),
    });

    if (!validated.success) {
      return {
        error: true,
        message: 'no comment',
      };
    }

    // Ensure comment exists and is not undefined
    if (!validated.data.comment) {
      return {
        error: true,
        message: 'comment is required',
      };
    }

    const data = await db.comment.update({
      where: {
        id: commentId,
        postId: postId,
      },
      data: {
        comment: validated.data?.comment,
      },
    });

    return {
      error: false,
      message: 'Comment edited successfully',
      data: data,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

export const toggleComment = async (data: boolean) => {
  console.log(data);
  // Add logic (e.g., update DB)
};

export const deleteComment = async (data: CommentsProps) => {
  console.log({ data });
  try {
    const userId = await getAuthUserId();

    return await db.$transaction(async (tx) => {
      const comments = await tx.comment.findMany({
        where: {
          id: data.id,
          userId,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      const hasChildren = comments.map((com) => {
        return com.children.filter((c) => c.parentId === com.id);
      });

      if (hasChildren) {
        await tx.comment.deleteMany({
          where: {
            parentId: data.id,
          },
        });
        await tx.comment.delete({
          where: {
            id: data.id,
          },
        });
      } else {
        await tx.comment.delete({
          where: {
            id: data.id,
          },
        });
      }

      revalidatePath('/blogs');

      return {
        error: false,
        message: 'comments successfully deleted',
      };
    });
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};

// Fetch reactions for multiple comments
// export async function getCommentReactions(
//   commentIds: string[]
// ): Promise<CommentReactions> {
//   try {
//     const session = await auth();
//     const userId = session?.user?.id;

//     if (!Array.isArray(commentIds) || commentIds.length === 0) {
//       return {};
//     }

//     // Fetch reaction counts and user's reactions for each comment
//     const reactions = await Promise.all(
//       commentIds.map(async (commentId) => {
//         const [likesCount, dislikesCount, userReaction] = await Promise.all([
//           db.reaction.count({
//             where: {
//               commentId,
//               type: 'LIKE',
//             },
//           }),
//           db.reaction.count({
//             where: {
//               commentId,
//               type: 'DISLIKE',
//             },
//           }),
//           userId
//             ? db.reaction.findUnique({
//                 where: {
//                   userId_commentId: {
//                     userId,
//                     commentId,
//                   },
//                 },
//                 select: {
//                   type: true,
//                 },
//               })
//             : null,
//         ]);

//         return {
//           [commentId]: {
//             likes: likesCount,
//             dislikes: dislikesCount,
//             userReaction: userReaction?.type || null,
//           } as CommentReaction,
//         };
//       })
//     );

//     // Merge all reaction objects into one
//     return reactions.reduce(
//       (acc, reaction) => ({
//         ...acc,
//         ...reaction,
//       }),
//       {}
//     );
//   } catch (error) {
//     console.error('Error fetching comment reactions:', error);
//     return {};
//   }
// }

// Update a comment reaction
export async function updateCommentReaction(
  commentId: string,
  type: 'LIKE' | 'DISLIKE'
): Promise<{
  error?: boolean;
  message: string;
  data?: CommentReaction;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    if (!['LIKE', 'DISLIKE'].includes(type)) {
      return {
        error: true,
        message: 'error type',
      };
    }

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return {
        error: true,
        message: 'no comment',
      };
    }

    // Find existing reaction
    const existingReaction = await db.reaction.findFirst({
      where: {
        userId,
        commentId,
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking the same type

        await db.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Update reaction type if different

        await db.reaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            type,
          },
        });
      }
    } else {
      // Create new reaction

      await db.reaction.create({
        data: {
          userId,
          commentId,
          type,
        },
      });
    }

    // Get updated counts and user reaction
    const [likesCount, dislikesCount, userReaction] = await Promise.all([
      db.reaction.count({
        where: {
          commentId,
          type: 'LIKE',
        },
      }),
      db.reaction.count({
        where: {
          commentId,
          type: 'DISLIKE',
        },
      }),
      db.reaction.findFirst({
        where: {
          userId,
          commentId,
        },
        select: {
          type: true,
        },
      }),
    ]);

    const reactionData: CommentReaction = {
      likes: likesCount,
      dislikes: dislikesCount,
      userReaction: userReaction?.type || null,
    };

    // Optional: Revalidate the page to sync server state
    // revalidatePath('/posts/[slug]'); // Adjust path as needed

    return {
      error: false,
      message: 'successfully update like/dislike',
      data: reactionData,
    };
  } catch (err) {
    console.error('Error updating comment reaction:', err);
    return {
      error: true,
      message: formatError(err),
    };
  }
}
// Update a comment reaction
export async function updatePostReaction(
  postId: string,
  type: 'LIKE' | 'DISLIKE'
): Promise<{
  error?: boolean;
  message: string;
  data?: CommentReaction;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    if (!['LIKE', 'DISLIKE'].includes(type)) {
      return {
        error: true,
        message: 'error type',
      };
    }

    // Check if comment exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return {
        error: true,
        message: 'no post',
      };
    }

    // Find existing reaction
    const existingReaction = await db.reaction.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking the same type

        await db.reaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Update reaction type if different

        await db.reaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            type,
          },
        });
      }
    } else {
      // Create new reaction

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
          postId,
          type: 'LIKE',
        },
      }),
      db.reaction.count({
        where: {
          postId,
          type: 'DISLIKE',
        },
      }),
      db.reaction.findFirst({
        where: {
          id: existingReaction?.id,
        },
        select: {
          type: true,
        },
      }),
    ]);

    const reactionData: CommentReaction = {
      likes: likesCount,
      dislikes: dislikesCount,
      userReaction: userReaction?.type || null,
    };
    // Optional: Revalidate the page to sync server state
    // revalidatePath('/posts/[slug]'); // Adjust path as needed

    return {
      error: false,
      message: 'successfully update like/dislike',
      data: reactionData,
    };
  } catch (err) {
    console.error('Error updating comment reaction:', err);
    return {
      error: true,
      message: formatError(err),
    };
  }
}

// Optional: Bulk update reactions (useful for initial data)
export async function initializeCommentReactions(
  commentIds: string[]
): Promise<CommentReactionsProps> {
  return getCommentReactions(commentIds);
}

// actions/comment-actions.ts - Enhanced getCommentReactions
export async function getCommentReactions(
  commentIds: string[]
): Promise<CommentReactionsProps> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      console.log('❌ No comment IDs provided');
      return {};
    }

    // Verify all comments exist
    const existingComments = await db.comment.findMany({
      where: {
        id: {
          in: commentIds,
        },
      },
      select: {
        id: true,
      },
    });

    // Fetch reaction counts and user's reactions for each comment
    const reactions = await Promise.all(
      commentIds.map(async (commentId) => {
        try {
          const [likesCount, dislikesCount, userReaction] = await Promise.all([
            db.reaction.count({
              where: {
                commentId,
                type: 'LIKE',
              },
            }),
            db.reaction.count({
              where: {
                commentId,
                type: 'DISLIKE',
              },
            }),
            userId
              ? db.reaction.findFirst({
                  where: {
                    userId,
                    commentId,
                  },
                  select: {
                    type: true,
                  },
                })
              : null,
          ]);

          return {
            [commentId]: {
              likes: likesCount,
              dislikes: dislikesCount,
              userReaction: userReaction?.type || null,
            } as CommentReaction,
          };
        } catch (error) {
          console.error(`❌ Error processing comment ${commentId}:`, error);
          // Return default reaction for this comment
          return {
            [commentId]: {
              likes: 0,
              dislikes: 0,
              userReaction: null,
            } as CommentReaction,
          };
        }
      })
    );

    // Merge all reaction objects into one
    const mergedReactions = reactions.reduce(
      (acc, reaction) => ({
        ...acc,
        ...reaction,
      }),
      {}
    );

    return mergedReactions;
  } catch (error) {
    console.error('❌ Error fetching comment reactions:', error);

    // Return default reactions for all comments
    const defaultReactions = commentIds.reduce(
      (acc, commentId) => ({
        ...acc,
        [commentId]: {
          likes: 0,
          dislikes: 0,
          userReaction: null,
        },
      }),
      {}
    );

    return defaultReactions;
  }
}

// !actions/post-actions.ts - Enhanced getCommentReactions
export async function getPostReactions(
  postId: string
): Promise<PostReactionsProps> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!postId) {
      console.log('❌ No post IDs provided');
      return {};
    }

    // Verify all comments exist
    const existingPosts = await db.post.findMany({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });

    // Fetch reaction counts and user's reactions for each comment
    const reactions = await Promise.all(
      [postId].map(async (pid) => {
        try {
          const [likesCount, dislikesCount, userReaction] = await Promise.all([
            db.reaction.count({
              where: {
                postId,
                type: 'LIKE',
              },
            }),
            db.reaction.count({
              where: {
                postId,
                type: 'DISLIKE',
              },
            }),
            userId
              ? db.reaction.findFirst({
                  where: {
                    userId,
                    postId,
                  },

                  select: {
                    type: true,
                  },
                })
              : null,
          ]);

          return {
            [postId]: {
              likes: likesCount,
              dislikes: dislikesCount,
              userReaction: userReaction?.type || null,
            } as CommentReaction,
          };
        } catch (error) {
          console.error(`❌ Error processing comment ${postId}:`, error);
          // Return default reaction for this comment
          return {
            [postId]: {
              likes: 0,
              dislikes: 0,
              userReaction: null,
            } as CommentReaction,
          };
        }
      })
    );

    // Merge all reaction objects into one
    const mergedReactions = reactions.reduce(
      (acc, reaction) => ({
        ...acc,
        ...reaction,
      }),
      {}
    );

    return mergedReactions;
  } catch (error) {
    console.error('❌ Error fetching comment reactions:', error);

    // Return default reactions for all comments
    const defaultReactions = [postId].reduce(
      (acc, commentId) => ({
        ...acc,
        [commentId]: {
          likes: 0,
          dislikes: 0,
          userReaction: null,
        },
      }),
      {}
    );

    return defaultReactions;
  }
}

// Also add this helper function to check if reactions are properly initialized
export async function debugCommentReactions(commentIds: string[]) {
  console.log('=== DEBUG COMMENT REACTIONS ===');

  const session = await auth();
  const userId = session?.user?.id;

  console.log('User ID:', userId);
  console.log('Comment IDs:', commentIds);

  for (const commentId of commentIds) {
    console.log(`\n--- Comment ${commentId} ---`);

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });
    console.log('Comment exists:', !!comment);

    // Check all reactions for this comment
    const allReactions = await db.reaction.findMany({
      where: { commentId },
      include: {
        user: {
          select: { name: true, id: true },
        },
      },
    });
    console.log('All reactions:', allReactions);

    // Check user's specific reaction
    if (userId) {
      const userReaction = await db.reaction.findFirst({
        where: {
          userId,
          commentId,
        },
      });
      console.log('User reaction:', userReaction);
    }

    // Check counts
    const likesCount = await db.reaction.count({
      where: { commentId, type: 'LIKE' },
    });
    const dislikesCount = await db.reaction.count({
      where: { commentId, type: 'DISLIKE' },
    });

    console.log('Counts:', { likesCount, dislikesCount });
  }

  console.log('=== END DEBUG ===\n');
}

export async function commentReport(prevState: unknown, formData: FormData) {
  console.log('🚀 ~ commentReport ~ formData:', formData);

  const data = Object.fromEntries(formData.entries());
  console.log('🚀 ~ commentReport ~ data:', data);
  const validated = commentReportSchema.safeParse(data);
  console.log('🚀 ~ commentReport ~ validated:', validated);
  if (!validated.success) {
    const fieldError = validated.error.flatten().fieldErrors;
    console.log('🚀 ~ commentReport ~ fieldError:', fieldError);
    return {
      error: true,
      message: 'invalid data comment report',
    };
  }
  try {
    const userId = await getAuthUserId();

    const existingReport = await db.reportComment.findFirst({
      where: {
        commentId: validated.data.commentId,
        userId: validated.data.userId,
      },
    });

    if (existingReport) {
      const report = await db.reportComment.update({
        where: {
          id: existingReport.id,
        },
        data: {
          ...validated.data,
          report: validated.data.report,
        },
      });

      return {
        error: false,
        message: 'successfully report',
        data: report,
      };
    } else {
      const report = await db.reportComment.create({
        data: {
          report: validated.data.report,
          commentId: validated.data.commentId,
          userId: userId,
        },
      });

      return {
        error: false,
        message: 'successfully report',
        data: report,
      };
    }
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
export async function getCommentByUserId() {}

export async function getCommentReportByCommentId(commentId: string) {
  try {
    const userId = await getAuthUserId();
    const existingReport = await db.reportComment.findFirst({
      where: {
        commentId: commentId,
        userId,
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
        comment: {
          select: { comment: true },
        },
      },
    });
    console.log(
      '🚀 ~ getCommentReportByCommentId ~ existingReport:',
      existingReport
    );

    return {
      error: false,
      message: existingReport ? 'Report found' : 'No report exists',
      data: existingReport,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
      data: undefined,
    };
  }
}

export async function removeCommentReport(commentId: string) {
  try {
    const userId = await getAuthUserId();
    const existingReport = await db.reportComment.findFirst({
      where: {
        commentId,
        userId: userId,
      },
    });
    console.log('🚀 ~ removeCommentReport ~ existingReport:', existingReport);

    if (!existingReport) {
      return {
        error: true,
        message: 'no report found or unauthorized',
      };
    }

    await db.reportComment.delete({
      where: {
        id: existingReport.id,
        userId,
      },
    });

    return {
      error: false,
      message: 'successfully delete report',
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
      data: undefined,
    };
  }
}
