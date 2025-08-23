import React, { createContext, useContext, useState } from 'react';

import { ThumbsDown, ThumbsUp } from 'lucide-react';

// Types
interface CommentReaction {
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
}

interface CommentReactions {
  [commentId: string]: CommentReaction;
}

// Context for managing comment reactions
interface CommentReactionsContextType {
  reactions: CommentReactions;
  updateReaction: (commentId: string, type: 'like' | 'dislike') => void;
}

const CommentReactionsContext = createContext<
  CommentReactionsContextType | undefined
>(undefined);

// Provider component
const CommentReactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reactions, setReactions] = useState<CommentReactions>({
    'comment-1': { likes: 24, dislikes: 2, userReaction: null },
    'comment-2': { likes: 156, dislikes: 8, userReaction: 'like' },
    'comment-3': { likes: 3, dislikes: 0, userReaction: null },
    'comment-4': { likes: 89, dislikes: 5, userReaction: 'dislike' },
    'comment-5': { likes: 0, dislikes: 1, userReaction: null },
  });

  const updateReaction = (commentId: string, type: 'like' | 'dislike') => {
    setReactions((prev) => {
      const currentReaction = prev[commentId];
      if (!currentReaction) return prev;

      let newLikes = currentReaction.likes;
      let newDislikes = currentReaction.dislikes;
      let newUserReaction: 'like' | 'dislike' | null = type;

      // Handle like button click
      if (type === 'like') {
        if (currentReaction.userReaction === 'like') {
          // Remove like
          newLikes -= 1;
          newUserReaction = null;
        } else if (currentReaction.userReaction === 'dislike') {
          // Switch from dislike to like
          newLikes += 1;
          newDislikes -= 1;
          newUserReaction = 'like';
        } else {
          // Add like
          newLikes += 1;
          newUserReaction = 'like';
        }
      }

      // Handle dislike button click
      if (type === 'dislike') {
        if (currentReaction.userReaction === 'dislike') {
          // Remove dislike
          newDislikes -= 1;
          newUserReaction = null;
        } else if (currentReaction.userReaction === 'like') {
          // Switch from like to dislike
          newDislikes += 1;
          newLikes -= 1;
          newUserReaction = 'dislike';
        } else {
          // Add dislike
          newDislikes += 1;
          newUserReaction = 'dislike';
        }
      }

      return {
        ...prev,
        [commentId]: {
          likes: Math.max(0, newLikes),
          dislikes: Math.max(0, newDislikes),
          userReaction: newUserReaction,
        },
      };
    });
  };

  return (
    <CommentReactionsContext.Provider value={{ reactions, updateReaction }}>
      {children}
    </CommentReactionsContext.Provider>
  );
};

// Hook to use comment reactions
const useCommentReactions = () => {
  const context = useContext(CommentReactionsContext);
  if (!context) {
    throw new Error(
      'useCommentReactions must be used within CommentReactionsProvider'
    );
  }
  return context;
};

// Helper function to format numbers (YouTube style)
const formatCount = (count: number): string => {
  if (count === 0) return '';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
};

// Individual Comment Thumbs Component
interface CommentThumbsProps {
  commentId: string;
  type: 'like' | 'dislike';
  showCount?: boolean;
}

const CommentThumbsButton: React.FC<CommentThumbsProps> = ({
  commentId,
  type,
  showCount = true,
}) => {
  const { reactions, updateReaction } = useCommentReactions();
  const reaction = reactions[commentId];

  if (!reaction) return null;

  const isActive = reaction.userReaction === type;
  const count = type === 'like' ? reaction.likes : reaction.dislikes;

  const handleClick = () => {
    updateReaction(commentId, type);
  };

  const Icon = type === 'like' ? ThumbsUp : ThumbsDown;

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isActive
          ? type === 'like'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-red-600 dark:text-red-400'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
      } `}
      title={type === 'like' ? 'Like this comment' : 'Dislike this comment'}
    >
      <Icon
        size={16}
        className={`transition-all duration-200 ${
          isActive ? 'fill-current' : 'group-hover:scale-110'
        }`}
      />
      {showCount && count > 0 && (
        <span className='text-xs font-medium'>{formatCount(count)}</span>
      )}
    </button>
  );
};

// Complete Comment Thumbs Container
interface CommentThumbsContainerProps {
  commentId: string;
  showCounts?: boolean;
  size?: 'sm' | 'md';
}

const CommentThumbsContainer: React.FC<CommentThumbsContainerProps> = ({
  commentId,
  showCounts = true,
  size = 'sm',
}) => {
  return (
    <div
      className={`flex items-center gap-1 ${size === 'md' ? 'gap-2' : 'gap-1'}`}
    >
      <CommentThumbsButton
        commentId={commentId}
        type='like'
        showCount={showCounts}
      />
      <CommentThumbsButton
        commentId={commentId}
        type='dislike'
        showCount={showCounts}
      />
    </div>
  );
};

// Mock Comment Component for demonstration
interface CommentProps {
  commentId: string;
  author: string;
  content: string;
  timestamp: string;
}

const Comment: React.FC<CommentProps> = ({
  commentId,
  author,
  content,
  timestamp,
}) => {
  return (
    <div className='flex gap-3 border-b border-gray-200 p-4 dark:border-gray-700'>
      {/* Avatar */}
      <div className='flex-shrink-0'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white'>
          {author.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Comment Content */}
      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            {author}
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {timestamp}
          </span>
        </div>

        <p className='text-sm leading-relaxed text-gray-800 dark:text-gray-200'>
          {content}
        </p>

        {/* Action buttons */}
        <div className='flex items-center gap-4 pt-1'>
          <CommentThumbsContainer commentId={commentId} />
          <button className='rounded px-2 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'>
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component showing multiple comments
const YouTubeCommentDemo: React.FC = () => {
  const { reactions } = useCommentReactions();

  const comments = [
    {
      id: 'comment-1',
      author: 'TechEnthusiast2024',
      content:
        'This is exactly what I was looking for! Great explanation and very helpful examples.',
      timestamp: '2 hours ago',
    },
    {
      id: 'comment-2',
      author: 'CodeMaster',
      content:
        'Amazing tutorial! The step-by-step approach makes it so easy to follow. Keep up the great work!',
      timestamp: '5 hours ago',
    },
    {
      id: 'comment-3',
      author: 'DevNewbie',
      content:
        'Thanks for sharing this. As a beginner, this really helped me understand the concept better.',
      timestamp: '1 day ago',
    },
    {
      id: 'comment-4',
      author: 'WebDeveloper',
      content:
        'I disagree with some points mentioned here. There are better approaches available for this use case.',
      timestamp: '2 days ago',
    },
    {
      id: 'comment-5',
      author: 'StudentCoder',
      content: 'Could you please make a follow-up video on advanced topics?',
      timestamp: '3 days ago',
    },
  ];

  return (
    <div className='mx-auto min-h-screen max-w-4xl bg-white p-6 dark:bg-gray-900'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>
          YouTube-Style Comment System
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Interactive thumbs up/down with React Context state management
        </p>
      </div>

      {/* Comments Section */}
      <div className='overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-4 dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Comments ({comments.length})
          </h2>
        </div>

        <div className='divide-y divide-gray-200 dark:divide-gray-700'>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              commentId={comment.id}
              author={comment.author}
              content={comment.content}
              timestamp={comment.timestamp}
            />
          ))}
        </div>
      </div>

      {/* Debug Panel */}
      <div className='mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Debug: Current Reactions State
        </h3>
        <pre className='overflow-x-auto rounded bg-gray-900 p-3 text-xs text-green-400 dark:bg-gray-700'>
          {JSON.stringify(reactions, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Main App Component with Provider
const App: React.FC = () => {
  return (
    <CommentReactionsProvider>
      <YouTubeCommentDemo />
    </CommentReactionsProvider>
  );
};

export default App;
