import z from 'zod';

export const reactionSchema = z
  .object({
    type: z.enum(['LIKE', 'DISLIKE']),
    postId: z.string().optional(),
    commentId: z.string().optional(),
  })
  .refine((data) => data.postId || data.commentId, {
    message: 'Either postId or commentId must be provided',
  })
  .refine((data) => !(data.postId && data.commentId), {
    message: 'Cannot provide both postId and commentId',
  });

export type ReactionSchema = z.infer<typeof reactionSchema>;

export const commentReportSchema = z.object({
  report: z.string().min(1, 'report is required'),
  commentId: z.string(),
  userId: z.string(),
});

export type CommentReportSchema = z.infer<typeof commentReportSchema>;
