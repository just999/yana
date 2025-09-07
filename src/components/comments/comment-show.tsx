import { getBlogsByUserId } from '@/actions/blog-actions';
import {
  getCommentByPostId,
  getCommentReportByCommentId,
  toggleComment,
} from '@/actions/comment-actions';
import {
  getAllLoveIds,
  getCurrentUserLoveIds,
  getReactionByCommentId,
} from '@/actions/toggle-actions';
import { auth } from '@/auth';
import CommentEditForm from '@/components/comments/comment-edit-form';
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui';
import { localAvatar } from '@/lib/constants';
import { CommentReactionsProps, CommentsProps, PostProps } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Session } from 'next-auth';

import CommentForm from './comment-form';
import CommentToggleButton from './comment-toggle-button';
import CommentUpdateDropdown from './comment-update-dropdown';

type CommentShowProps = {
  topCommentId?: string;
  commentId: string;
  postId: string;
  depth?: number;
  maxDepth?: number;
  allComments?: CommentsProps[];
  commentsWithReaction?: CommentsProps[];
  blog: PostProps;
  startOpen?: boolean;
  child: CommentsProps;
  initialCommentReactions: CommentReactionsProps | undefined;
};

const CommentShow = async ({
  commentId,
  postId,
  depth = 0,
  maxDepth = 1,
  allComments,
  commentsWithReaction,
  topCommentId,
  blog,
  child,
  startOpen,
  initialCommentReactions,
}: CommentShowProps) => {
  const comments = (await getCommentByPostId(postId)).data;
  const comment = comments?.find((c) => c.id === commentId);

  const session = (await auth()) as Session;
  const post = (await getBlogsByUserId(session.user.id)).data;

  const canShowReplies = depth < maxDepth;
  const children = comments?.filter((c) => c.parentId === commentId);
  const hasChildren = children && children.length > 0;
  const allLoveIds = (await getAllLoveIds()).data || [];
  const likeIds = (await getCurrentUserLoveIds()).data || [];
  const reactions = comments?.flatMap((comment) => comment.reactions);

  const getReaction = await getReactionByCommentId(commentId);
  const reportResult =
    (comment?.id && (await getCommentReportByCommentId(comment?.id)).data) ||
    null;
  // const report = (reportResult || []).filter(
  //   (r): r is typeof r & { report: string } => r.report !== null
  // );

  const renderedChildren =
    canShowReplies && hasChildren
      ? children.map((child) => {
          return (
            <CommentShow
              key={child.id}
              commentId={child?.id}
              postId={postId}
              depth={depth + 1}
              maxDepth={maxDepth}
              allComments={comments}
              commentsWithReaction={comments}
              topCommentId={topCommentId}
              blog={blog}
              child={child}
              initialCommentReactions={initialCommentReactions}
            />
          );
        })
      : [];

  if (!comment) return null;
  return (
    <div className='mt-2 mb-1 w-full rounded-none border-b p-0'>
      <div className='flex gap-1 pb-0'>
        <Avatar className='h-8 w-8'>
          <AvatarImage src={comment.user.avatar || localAvatar} />
          <AvatarFallback>{'user avatar'}</AvatarFallback>
        </Avatar>
        <div className='relative w-full'>
          <div className=' '>
            <div className='mb-2 flex items-center space-x-2'>
              <Badge className='dark:bg-accent h-4 text-[12px] font-medium text-blue-200'>
                @{comment.user.email.split('@')[0]}
              </Badge>
              <span className='text-xs text-stone-400'>
                {formatDate.relative(comment.createdAt.toString())}
              </span>
            </div>

            <CommentEditForm
              comment={comment}
              postId={comment.postId}
              session={session}
              topCommentId={topCommentId}
              parentId={comment.id}
              startOpen={startOpen}
            />
            {/* <pre>{JSON.stringify(comment, null, 2)}</pre> */}
            {/* <p className='pr-6 text-xs dark:text-gray-200'>{comment.comment}</p> */}
            <CommentForm
              postId={comment.postId}
              parentId={comment.id}
              depth={depth + 1}
              maxDepth={maxDepth}
              commentsWithReaction={commentsWithReaction}
              session={session}
              likeIds={likeIds}
              allLoveIds={allLoveIds}
              topCommentId={topCommentId}
              blog={blog}
              initialCommentReactions={initialCommentReactions}
              path='comment'
              // comment={comment}
              // child={child}
            />
          </div>
          <div className='absolute top-0 right-0 w-fit'>
            <CommentUpdateDropdown
              comment={comment}
              report={reportResult}
              // handleRemoveComment={handleRemoveComment}
            />
          </div>
        </div>
      </div>
      {children && children?.length > 0 && (
        <>
          <CommentToggleButton
            text='Replay'
            startOpen={false}
            onDataSend={toggleComment}
            commentCount={children.length}
            icon={<ChevronDown />}
            openIcon={<ChevronUp />}
            closedIcon={<ChevronDown />}
            renderedChildren={renderedChildren}
          />
        </>
      )}
    </div>
  );
};

export default CommentShow;
