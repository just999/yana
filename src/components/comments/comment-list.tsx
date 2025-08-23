import { getCommentByPostId } from '@/actions/comment-actions';
import { CommentReactionsProps, PostProps } from '@/lib/types';

import CommentShow from './comment-show';

type CommentListProps = {
  postId: string;
  depth?: number;
  maxDepth?: number;
  blog: PostProps;
  initialCommentReactions: CommentReactionsProps | undefined;
  path: 'post' | 'comment';
};
const CommentList = async ({
  postId,
  depth = 0,
  maxDepth = 1,
  blog,
  initialCommentReactions,
  path,
}: CommentListProps) => {
  const comm = (await getCommentByPostId(postId)).data;
  const topLevelComments = comm?.filter((comment) => comment.parentId === null);

  const renderedComments = topLevelComments?.map((comment) => {
    return (
      <CommentShow
        key={comment.id}
        topCommentId={comment.id}
        commentId={comment.id}
        postId={comment.postId}
        depth={depth}
        maxDepth={maxDepth}
        allComments={comm}
        blog={blog}
        child={comment}
        initialCommentReactions={initialCommentReactions}
      />
    );
  });
  return <div className='flex flex-col space-x-4'>{renderedComments}</div>;
};

export default CommentList;
