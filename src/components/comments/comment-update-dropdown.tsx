'use client';

import React, { useActionState, useEffect, useState } from 'react';

import {
  commentReport,
  deleteComment,
  removeCommentReport,
} from '@/actions/comment-actions';
import AlertDialogButton from '@/components/alert-dialog-button';
import SubmitButton from '@/components/submit-button';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { reportComments } from '@/lib/helpers';
import {
  editCommentAtom,
  editCommentDataAtom,
  editingCommentIdAtom,
  focusEditInputAtom,
  toggleCommentAtom,
} from '@/lib/jotai/comment-atoms';
import { CommentsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ReportComment } from '@prisma/client';
import { useAtom } from 'jotai';
import { EllipsisVertical, Flag, Pencil, Pin, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type CommentUpdateDropdownProps = {
  comment: CommentsProps | undefined;
  report: ReportComment | null;
};

const CommentUpdateDropdown = ({
  comment,
  report,
}: CommentUpdateDropdownProps) => {
  const [isPinned, setIsPinned] = React.useState(false);
  const [editingCommentId, setEditingCommentId] = useAtom(editingCommentIdAtom);
  const [editCommentData, setEditCommentData] = useAtom(editCommentDataAtom);
  const [editComment, setEditComment] = useAtom(editCommentAtom);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [toggleCommentInput, setToggleCommentInput] =
    useAtom(toggleCommentAtom);
  const [, setFocusEditInput] = useAtom(focusEditInputAtom);
  const { data: session } = useSession();

  const isEditing = editingCommentId === comment?.id;
  const router = useRouter();

  useEffect(() => {
    if (report) setReportReason(report.report);
  }, [setReportReason, report]);

  const [data, action] = useActionState(commentReport, {
    error: false,
    message: '',
  });
  useEffect(() => {
    if (!data.error && data.message) {
      setHasSubmitted(true);
      setIsReportDialogOpen(false);
      toast.success(data.message);
      router.refresh();
    }
    if (data.error) {
      setHasSubmitted(false);
      toast.error(data.message);
    }
  }, [data.message, data.error, router]);

  const handlePin = () => {
    setIsPinned(!isPinned);
    console.log('Pin toggled:', !isPinned);
  };

  const handleReport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Report comment:', comment?.id);
    console.log('Report user:', session?.user.id);
    setIsReportDialogOpen(true);
  };

  const handleEditReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (report) {
      setReportReason(report.report);
      setIsReportDialogOpen(true);
    }
  };
  const handleRemoveReport = async (commentId: string) => {
    try {
      const res = await removeCommentReport(commentId);

      if (res.error) {
        setHasSubmitted(false);
        toast.error(res.message);
      } else {
        setHasSubmitted(true);
        toast.success(res.message);
        router.refresh();
      }
    } catch (err) {
      toast.error('something went wrong went deleting report');
    }
  };

  const handleEdit = () => {
    if (!comment) return;

    setEditingCommentId(comment.id);

    setEditComment(comment);

    setEditCommentData({
      id: comment.id,
      comment: comment.comment,
    });

    setToggleCommentInput(true);

    setTimeout(() => {
      setFocusEditInput(comment.id);
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditComment(null);
    setEditCommentData({});
    setToggleCommentInput(false);
    setFocusEditInput(null);
  };

  const commentOwner =
    comment?.userId === session?.user.id ? session?.user : null;

  const handleReportSubmit = () => {
    setIsReportDialogOpen(false);
    setReportReason(null);
  };

  const handleCancel = () => {
    setIsReportDialogOpen(false);
    setReportReason(null);
  };

  const renderedEllipsis = commentOwner ? (
    <>
      <DropdownMenuItem
        onClick={handlePin}
        className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
      >
        <Button
          variant='ghost'
          type='button'
          size='sm'
          className={cn(
            'flex h-6 w-full cursor-pointer items-center justify-start gap-4 overflow-hidden font-normal'
          )}
          aria-label='pin'
        >
          <Pin size={24} className='svg text-stone-200' />
          Pin
        </Button>
      </DropdownMenuItem>

      <DropdownMenuItem
        className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
        disabled={isEditing}
        onSelect={(e) => e.preventDefault()}
      >
        <Button
          variant='ghost'
          type='button'
          size='sm'
          className={cn(
            'flex h-6 w-full cursor-pointer items-center justify-start gap-4 overflow-hidden font-normal',
            isEditing && 'cursor-not-allowed opacity-50'
          )}
          aria-label='edit'
          disabled={isEditing}
          onClick={handleEdit}
        >
          <Pencil size={24} className='svg text-stone-200' />
          {isEditing ? 'Editing...' : 'Edit'}
        </Button>
      </DropdownMenuItem>

      {/* Add cancel edit option when editing */}
      {isEditing && (
        <DropdownMenuItem
          className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
          onSelect={(e) => {
            e.preventDefault();
            handleCancelEdit();
          }}
        >
          <Button
            variant='ghost'
            type='button'
            size='sm'
            className='flex h-6 w-full cursor-pointer items-center justify-start gap-4 overflow-hidden font-normal'
            aria-label='cancel edit'
          >
            <Pencil size={24} className='svg text-stone-200' />
            Cancel Edit
          </Button>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
        onSelect={(e) => {
          e.preventDefault();
        }}
      >
        <AlertDialogButton
          remove={() => comment && deleteComment(comment)}
          icon={Trash}
          action='Delete'
          className='w-full'
        />
      </DropdownMenuItem>
    </>
  ) : (
    <>
      {!report?.report ? (
        <DropdownMenuItem className='group p-0' asChild>
          <Button
            variant={'ghost'}
            size={'sm'}
            className='bg-accent flex w-full items-center justify-start gap-2 dark:hover:cursor-pointer dark:hover:bg-amber-700/30'
            onClick={(e) => handleReport(e)}
          >
            <Flag className='mr-2 h-6 w-6' />
            report
          </Button>
        </DropdownMenuItem>
      ) : (
        <>
          <div className='flex w-full flex-col items-center justify-center gap-2'>
            <DropdownMenuItem className='group p-0' asChild>
              <Button
                variant={'ghost'}
                size={'sm'}
                className='bg-accent flex w-full items-center justify-start gap-2 dark:hover:cursor-pointer dark:hover:bg-emerald-800/30'
                onClick={(e) => handleEditReport(e)}
              >
                <Pencil className='svg mr-2 h-6 w-6' />
                Edit
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className='group p-0' asChild>
              {/* <Button
                variant={'ghost'}
                size={'sm'}
                className='bg-accent flex w-full items-center justify-start gap-2 dark:hover:cursor-pointer dark:hover:bg-red-900/30'
                onClick={(e) => handleRemoveReport(e)}
              >
                <Trash className='svg mr-2 h-6 w-6' />
                Delete
              </Button> */}

              <AlertDialogButton
                icon={Trash}
                action='Delete'
                className='bg-accent flex w-full items-center justify-start gap-2 dark:hover:cursor-pointer dark:hover:bg-red-900/30'
                remove={() => comment?.id && handleRemoveReport(comment?.id)}
              />
            </DropdownMenuItem>
          </div>
        </>
      )}

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className='flex flex-col items-start'>
          <form action={action}>
            <input type='hidden' name='userId' value={session?.user.id} />
            <input type='hidden' name='commentId' value={comment?.id} />
            <DialogHeader>
              <DialogTitle>Report</DialogTitle>
              <DialogDescription className='space-y-2'>
                {/* Why are you reporting this comment by {author}? */}
                <span className='block text-sm font-semibold text-amber-300'>
                  What &apos s going on?
                </span>
                <span className='text-xs text-amber-100'>
                  We &apos ll check for all Community Guidelines, so don &apos t
                  worry about making the perfect choice.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 pb-4'>
              <div className='space-y-2'>
                <Label className='block text-sm font-medium text-amber-50'>
                  Select a reason
                </Label>
                <Select
                  name='report'
                  onValueChange={(val) => setReportReason(val)}
                  defaultValue={reportReason || ''}
                >
                  <SelectTrigger className='w-md'>
                    <SelectValue placeholder='report ' />
                  </SelectTrigger>

                  <SelectContent>
                    {reportComments.map((r) => (
                      <SelectItem value={r.title} key={r.title}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                size={'sm'}
                type='button'
                variant='outline'
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <SubmitButton value='Submit Report' disabled={!reportReason} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className='[data-side] float-right'>
        <Button variant='ghost' type='button' size='lg' className='h-6 w-6'>
          <EllipsisVertical
            size={24}
            className='svg h-8 w-auto stroke-amber-100 stroke-2'
            style={{ width: '18px', height: '18px' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='dark:bg-accent/5 w-32 shadow-2xl backdrop-blur-sm'
        align='start'
        side='right'
        sideOffset={4}
        avoidCollisions={false}
      >
        {renderedEllipsis}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommentUpdateDropdown;
