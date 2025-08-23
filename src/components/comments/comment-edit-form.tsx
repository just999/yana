'use client';

import { useEffect, useRef, useState } from 'react';

import { createComment, editComment } from '@/actions/comment-actions';
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
import {
  editCommentDataAtom,
  editingCommentIdAtom,
  focusEditInputAtom,
  toggleCommentAtom,
} from '@/lib/jotai/comment-atoms';
import { CommentSchema, commentSchema } from '@/lib/schemas/blog-schemas';
import { CommentsProps } from '@/lib/types';
import { useAtom } from 'jotai';
import { Loader, Pencil } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type CommentEditFormProps = {
  comment: CommentsProps;
  session: Session;
  postId: string;
  parentId?: string;
  topCommentId?: string;
  startOpen?: boolean;
};

const CommentEditForm = ({
  comment,
  session,
  postId,
  topCommentId,
  parentId,
  startOpen,
}: CommentEditFormProps) => {
  const [editingCommentId, setEditingCommentId] = useAtom(editingCommentIdAtom);
  const [toggleCommentInput, setToggleCommentInput] =
    useAtom(toggleCommentAtom);
  const editCommentRef = useRef<HTMLInputElement | null>(null);
  const [editCommentData, setEditCommentData] = useAtom(editCommentDataAtom);
  const [focusEditInput, setFocusEditInput] = useAtom(focusEditInputAtom);
  const router = useRouter();

  const form = useZodForm({
    schema: commentSchema,
    mode: 'onChange',
    defaultValues: {
      comment: comment?.comment || '',
    },
  });

  useEffect(() => {
    const shouldFocus =
      focusEditInput === comment.id && editingCommentId === comment.id;

    if (shouldFocus && editCommentRef.current) {
      const input = editCommentRef.current;

      // Focus the input first
      input.focus();

      // Use setTimeout to ensure the focus is applied before setting cursor position
      setTimeout(() => {
        const textLength = input.value.length;

        // Set cursor to end of text
        input.setSelectionRange(textLength, textLength);

        // Alternative method if setSelectionRange doesn't work
        // input.selectionStart = textLength;
        // input.selectionEnd = textLength;

        // Scroll to end if text is long
        input.scrollLeft = input.scrollWidth;
      }, 10);

      // Clear the focus trigger
      setFocusEditInput(null);
    }
  }, [focusEditInput, editingCommentId, comment.id, setFocusEditInput]);

  useEffect(() => {
    if (editingCommentId === comment.id) {
      form.setValue('comment', comment.comment);
    }
  }, [editingCommentId, comment.id, comment.comment, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let the form handle the value change
    form.setValue('comment', e.target.value, { shouldDirty: true });

    // Auto-resize if it's a textarea-like input
    if (e.target.style) {
      e.target.style.height = 'auto';
      e.target.style.height = Math.max(32, e.target.scrollHeight) + 'px';
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setFocusEditInput(null);
    // Reset form to original comment
    form.setValue('comment', comment.comment);
  };

  const handleSaveEdit = async (commentId: string, newContent: string) => {
    try {
      console.log('Saving comment:', commentId, newContent);

      // Here you would typically make an API call to update the comment

      const formData = new FormData();
      formData.append('comment', newContent);

      const res = await editComment({ commentId, postId }, formData);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success(res.message);

        setEditingCommentId(null);
        setFocusEditInput(null);

        router.refresh();
        form.reset();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const onSubmit = async (data: CommentSchema) => {
    // For editing, use the save edit function instead
    if (editingCommentId === comment.id) {
      await handleSaveEdit(comment.id, data.comment);
      return;
    }

    // // For new comments
    // const formData = new FormData();
    // formData.append('comment', data.comment);

    // const res = await createComment({ postId, topCommentId }, formData);

    // if (res.error) {
    //   toast.error(res.message);
    // } else {
    //   toast.success(res.message);
    //   router.refresh();
    //   form.reset();
    // }
  };

  const renderEditCommentForm =
    editingCommentId === comment.id ? (
      <Form {...form}>
        <form
          method='POST'
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2 py-2'
        >
          <div className='flex flex-col justify-between gap-2 border-0 sm:flex-row'>
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
                            editCommentRef.current = el;
                            field.ref(el);
                          }}
                          required
                          className='focus:border-b-primary bg-card/50 h-8 w-full flex-1 rounded-none border-0 border-b border-b-white/40 py-0 text-xs placeholder:text-gray-500'
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSaveEdit(comment.id, e.currentTarget.value);
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

          {comment && (
            <div className='flex items-center justify-end text-right'>
              <Button
                variant={'ghost'}
                type='button'
                disabled={!parentId}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>

              <Button
                size={'sm'}
                type='submit'
                variant={'ghost'}
                className='flex items-center'
                disabled={
                  form.formState.isSubmitting ||
                  !form.formState.isDirty ||
                  !form.getValues('comment').trim()
                }
              >
                {form.formState.isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <Loader className='animate-spin' /> Saving...
                  </span>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    ) : (
      <>
        {/* Comment text */}
        <p className='pr-6 text-xs dark:text-gray-200'>{comment.comment}</p>
      </>
    );

  return renderEditCommentForm;
};

export default CommentEditForm;
