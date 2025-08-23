'use client';

import { useEffect, useRef, useState } from 'react';

import { createComment } from '@/actions/comment-actions';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  InputCustom,
} from '@/components/ui';
import { useZodForm } from '@/hooks/use-zod-form';
import { localAvatar } from '@/lib/constants';
import { useCommentReactions } from '@/lib/contexts/like-context';
import { blogAtom } from '@/lib/jotai/blog-atoms';
import {
  allLoveIdsAtom,
  editCommentDataAtom,
  editingCommentIdAtom,
} from '@/lib/jotai/comment-atoms';
import { usersAtom } from '@/lib/jotai/session-atoms';
import { CommentSchema, commentSchema } from '@/lib/schemas/blog-schemas';
import {
  CommentReactionsProps,
  CommentsProps,
  PostProps,
  ReactionProps,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { useAtom } from 'jotai';
import { Loader, SmilePlus } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ThumbsLikeButton from '../thumbs-like-button';

type CommentFormProps = {
  slug?: string;
  blog: PostProps;
  postId: string;
  parentId?: string;
  comments?: CommentsProps[];
  commentsWithReaction?: CommentsProps[] | ReactionProps[];
  startOpen?: boolean;
  depth?: number;
  maxDepth?: number;
  session: Session;
  likeIds: string[] | [];
  allLoveIds: string[] | [];
  allUsers?: User[];
  child?: CommentsProps;
  topCommentId?: string;
  initialCommentReactions: CommentReactionsProps | undefined;
  path: 'post' | 'comment';
  // comment?: CommentsProps;
};

const CommentForm = ({
  slug,
  blog,
  postId,
  parentId,
  startOpen,
  commentsWithReaction,
  depth = 0,
  maxDepth = 1,
  comments,
  session,
  likeIds,
  allUsers,
  allLoveIds,
  child,
  topCommentId,
  initialCommentReactions,
  path,
  // comment,
}: CommentFormProps) => {
  const newCommentRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(startOpen);
  const [formData, setFormData] = useAtom(blogAtom);
  const [users, setUsers] = useAtom(usersAtom);
  const [allLove, setAllLove] = useAtom(allLoveIdsAtom);

  const [editingCommentId, setEditingCommentId] = useAtom(editingCommentIdAtom);
  const [editCommentData, setEditCommentData] = useAtom(editCommentDataAtom);

  const { setInitialReactions } = useCommentReactions();
  // Local state for edit content

  const router = useRouter();
  const canReply = depth < maxDepth;

  const form = useZodForm({
    schema: commentSchema,
    mode: 'onChange',
    defaultValues: {
      comment: '',
    },
  });
  const { reset } = form;

  useEffect(() => {
    // Set initial reactions when component mounts
    if (
      initialCommentReactions &&
      Object.keys(initialCommentReactions).length > 0
    ) {
      setInitialReactions(initialCommentReactions);
    }
  }, [initialCommentReactions, setInitialReactions]);

  // Focus effect when reply form opens
  useEffect(() => {
    if (open && parentId && newCommentRef.current) {
      // Small delay to ensure the form is fully rendered
      const timeoutId = setTimeout(() => {
        if (newCommentRef.current) {
          newCommentRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [open, parentId]);

  useEffect(() => {
    if (blog) setFormData(blog);
    if (allUsers) setUsers(allUsers);
    if (allLoveIds) setAllLove(allLoveIds);
  }, [setFormData, setUsers, setAllLove, allLoveIds, allLove, blog, allUsers]);

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleSaveEdit = async (commentId: string, newContent: string) => {
    try {
      console.log('Saving comment:', commentId, newContent);
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const onSubmit = async (data: CommentSchema) => {
    const formData = new FormData();
    formData.append('comment', data.comment);

    const res = await createComment({ postId, topCommentId }, formData);

    if (res.error) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      router.refresh();
      form.reset();

      if (parentId) {
        setOpen(false);
      }
    }
  };
  const handleCancelButton = () => {
    if (parentId) {
      setOpen(false);
      reset();
    } else {
      reset();
    }
  };

  const handleToggleReply = () => {
    if (parentId) {
      const newOpenState = !open;
      setOpen(newOpenState);

      // If opening the reply form, focus after state update
      if (newOpenState) {
        // Focus will be handled by the useEffect above
      } else {
        // If closing, clear the form
        reset();
      }
    }
  };

  const comment = form.watch('comment');

  const renderedForm = open && (
    <div className='animate-in slide-in-from-top-2 mt-2 duration-200'>
      <Form {...form}>
        <form
          method='POST'
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2 py-2'
        >
          <div className='flex flex-col justify-between gap-2 border-0 sm:flex-row'>
            {/* <input type='hidden' defaultValue={topCommentId} /> */}
            <div className='flex-1'>
              <FormField
                control={form.control}
                name='comment'
                render={({ field }) => (
                  <FormItem className='flex w-full flex-grow items-center'>
                    <FormLabel className='text-nowrap'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={session.user.avatar || localAvatar} />
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                    </FormLabel>
                    <div className='flex w-full flex-col'>
                      <FormControl className='w-full border border-b-gray-500'>
                        <InputCustom
                          type='text'
                          {...field}
                          placeholder='add comment'
                          ref={(el) => {
                            newCommentRef.current = el;
                            field.ref(el);
                          }}
                          required
                          className='focus:border-b-primary bg-card/50 h-8 w-full flex-1 rounded-none border-0 border-b border-b-white/40 py-0 placeholder:text-gray-500'
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                            if (
                              e.key === 'Enter' &&
                              (e.ctrlKey || e.metaKey) &&
                              field.value
                            ) {
                              handleSaveEdit(
                                editCommentData?.id,
                                e.currentTarget.value
                              );
                            }
                          }}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div
            className={cn(
              'flex items-center justify-between px-8 text-right',
              !parentId && !form.formState.isDirty ? 'hidden' : ''
            )}
          >
            <Button variant={'ghost'} type='button' className='h-8 w-auto pl-8'>
              <SmilePlus size={24} />
            </Button>

            <div className='flex items-center'>
              <Button
                variant={'ghost'}
                type='button'
                // disabled={!form.formState.isDirty}
                onClick={handleCancelButton}
              >
                Cancel
              </Button>
              {comment && (
                <Button
                  size={'sm'}
                  type='submit'
                  variant={'ghost'}
                  className='flex items-center'
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  {form.formState.isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <Loader className='animate-spin' /> Submitting...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>{' '}
    </div>
  );

  return (
    <div className='flex w-full flex-col justify-between'>
      <div className='flex flex-col gap-4'>
        {/* {renderedForm} */}
        {parentId && !canReply && (
          <div className='flex items-center pt-2'>
            <ThumbsLikeButton
              postId={postId}
              blog={blog}
              commentId={parentId}
              reactions={comments?.map((r) => r.reaction) as ReactionProps[]}
              currentUserId={session.user.id}
              likeIds={likeIds}
              allLove={allLove}
              iconSize={16}
            />
            {/* <CommentThumbsContainer commentId={parentId} /> */}
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              onClick={handleToggleReply}
            >
              Reply
            </Button>
          </div>
        )}
      </div>
      {renderedForm}
      {/* <pre>{JSON.stringify(parentId, null, 2)}</pre> */}
      {/* <CommentUpdateDropdown comment={comment} /> */}
    </div>
  );
};

export default CommentForm;
