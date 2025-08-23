import CommentThumbsButton from '@/components/comment-thumbs-button';

interface CommentThumbsContainerProps {
  commentId: string;
  showCounts?: boolean;
  size?: 'sm' | 'md';
}

export const CommentThumbsContainer: React.FC<CommentThumbsContainerProps> = ({
  commentId,
  showCounts = true,
  size = 'sm',
}) => {
  return (
    <div className={`flex items-center ${size === 'md' ? 'gap-2' : 'gap-1'}`}>
      <CommentThumbsButton
        commentId={commentId}
        type='LIKE'
        showCount={showCounts}
      />
      ha ha
      <CommentThumbsButton
        commentId={commentId}
        type='DISLIKE'
        showCount={showCounts}
      />
    </div>
  );
};
