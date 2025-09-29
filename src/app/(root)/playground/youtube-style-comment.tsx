import React, { useEffect, useRef, useState } from 'react';

import { Check, MoreVertical, Pencil, X } from 'lucide-react';

type Props = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
};

const YouTubeStyleComment = () => {
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'John Doe',
      avatar: '/api/placeholder/32/32',
      content: 'This is a great video! Thanks for sharing.',
      timestamp: '2 hours ago',
      likes: 15,
    },
    {
      id: '2',
      author: 'Jane Smith',
      avatar: '/api/placeholder/32/32',
      content: 'Really helpful tutorial. I learned a lot from this.',
      timestamp: '5 hours ago',
      likes: 8,
    },
  ]);

  const [editingId, setEditingId] = useState<string | ''>('');
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus and resize textarea when edit mode starts
  useEffect(() => {
    if (editingId && textareaRef.current) {
      const textarea = textareaRef.current;

      // Focus the textarea
      textarea.focus();

      // Move cursor to end of text
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      // Auto-resize textarea to fit content
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
    }
  }, [editingId]);

  const handleEditStart = (comment: Props) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId('');
    setEditContent('');
  };

  const handleEditSave = () => {
    if (!editContent.trim()) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === editingId
          ? { ...comment, content: editContent.trim() }
          : comment
      )
    );

    setEditingId('');
    setEditContent('');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.max(40, e.target.scrollHeight) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleEditCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleEditSave();
    }
  };

  return (
    <div className='mx-auto max-w-2xl bg-white p-6'>
      <h2 className='mb-6 text-xl font-semibold text-gray-900'>Comments</h2>

      <div className='space-y-4'>
        {comments.map((comment) => (
          <div key={comment.id} className='group flex gap-3'>
            {/* Avatar */}
            <div className='flex-shrink-0'>
              <img
                src={comment.avatar}
                alt={comment.author}
                className='h-8 w-8 rounded-full bg-gray-300'
              />
            </div>

            {/* Comment Content */}
            <div className='min-w-0 flex-1'>
              {/* Author and timestamp */}
              <div className='mb-1 flex items-center gap-2'>
                <span className='text-sm font-medium text-gray-900'>
                  {comment.author}
                </span>
                <span className='text-xs text-gray-500'>
                  {comment.timestamp}
                </span>
              </div>

              {/* Comment text or edit form */}
              {editingId === comment.id ? (
                <div className='space-y-3'>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className='w-full resize-none rounded border border-gray-300 p-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    style={{ minHeight: '40px' }}
                    placeholder='Add a comment...'
                  />

                  {/* Edit actions */}
                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-gray-500'>
                      Press Ctrl+Enter to save, Esc to cancel
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={handleEditCancel}
                        className='rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100'
                      >
                        <X size={16} className='mr-1 inline' />
                        Cancel
                      </button>
                      <button
                        onClick={handleEditSave}
                        disabled={
                          !editContent.trim() ||
                          editContent.trim() === comment.content
                        }
                        className='rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Check size={16} className='mr-1 inline' />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Comment text */}
                  <p className='text-sm leading-relaxed whitespace-pre-wrap text-gray-900'>
                    {comment.content}
                  </p>

                  {/* Comment actions */}
                  <div className='mt-2 flex items-center gap-4'>
                    <button className='flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700'>
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
                        />
                      </svg>
                      {comment.likes}
                    </button>

                    <button className='flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700'>
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 13l3 3 7-7'
                        />
                      </svg>
                      Reply
                    </button>

                    <div className='relative'>
                      <button
                        onClick={() => handleEditStart(comment)}
                        className='flex items-center gap-1 text-xs text-gray-500 opacity-0 transition-colors group-hover:opacity-100 hover:text-gray-700'
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Demo instructions */}
      <div className='mt-8 rounded-lg bg-blue-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-blue-900'>
          YouTube-style Features:
        </h3>
        <ul className='space-y-1 text-xs text-blue-800'>
          <li>• Hover over a comment to see the Edit button</li>
          <li>• Click Edit to enter edit mode with auto-focus</li>
          <li>• Textarea auto-resizes as you type</li>
          <li>• Use Ctrl+Enter to save, Esc to cancel</li>
          <li>• Cursor positioned at end of text</li>
          <li>• Smooth transitions and hover effects</li>
        </ul>
      </div>
    </div>
  );
};

export default YouTubeStyleComment;
