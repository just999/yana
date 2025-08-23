import { Button } from '@/components/ui';
import { useCommentReactions } from '@/lib/contexts/reactions-context';
import { formatCount } from '@/lib/utils';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface CommentThumbsProps {
  commentId: string;
  type: 'LIKE' | 'DISLIKE';
  showCount?: boolean;
}

const CommentThumbsButton: React.FC<CommentThumbsProps> = ({
  commentId,
  type,
  showCount = true,
}) => {
  const { commentReactions, updateCommentReaction } = useCommentReactions();
  const reaction = commentReactions[commentId];

  if (!reaction) return null;

  const isActive = reaction.userReaction === type;
  const count = type === 'LIKE' ? reaction.likes : reaction.dislikes;

  const handleClick = () => {
    updateCommentReaction(commentId, type);
  };

  const Icon = type === 'LIKE' ? ThumbsUp : ThumbsDown;

  return (
    <Button
      variant={'ghost'}
      type='submit'
      onClick={handleClick}
      className={`group flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isActive
          ? type === 'LIKE'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-red-600 dark:text-red-400'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
      } `}
      title={type === 'LIKE' ? 'Like this comment' : 'Dislike this comment'}
    >
      {/* <Icon
        size={16}
        className={`transition-all duration-200 ${
          isActive ? 'fill-current' : 'group-hover:scale-110'
        }`}
      />
      {showCount && count > 0 && (
        <span className='text-xs font-medium'>{formatCount(count)}</span>
      )} */}
    </Button>
  );
};

export default CommentThumbsButton;
