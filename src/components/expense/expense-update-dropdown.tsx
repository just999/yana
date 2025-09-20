'use client';

import { useEffect } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { editExpenseIdAtom } from '@/lib/jotai/expense-atom';
import { cn } from '@/lib/utils';
import type { Transaction } from '@prisma/client';
import { useAtom } from 'jotai';
import { Ellipsis, Pencil, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import AlertDialogButton from '../alert-dialog-button';

type ExpenseUpdateDropdownProps = {
  transaction: Transaction;
  onRemoved?: (id: string) => void;
};

const ExpenseUpdateDropdown = ({
  transaction,
  onRemoved,
}: ExpenseUpdateDropdownProps) => {
  const { data: session } = useSession();
  const [editingExpenseId, setEditingExpenseId] = useAtom(editExpenseIdAtom);

  const isEditing = editingExpenseId === transaction?.id;

  useEffect(() => {
    if (transaction.id) setEditingExpenseId(transaction.id);
  }, [setEditingExpenseId]);

  const renderedContent =
    session?.user.id === transaction.userId ? (
      <>
        <DropdownMenuItem
          className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
          disabled={isEditing}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <Button
            asChild
            variant='ghost'
            type='button'
            size='sm'
            className={cn(
              'flex h-6 w-full cursor-pointer items-center justify-start gap-4 overflow-hidden font-normal',
              isEditing && 'cursor-not-allowed opacity-50'
            )}
            aria-label='edit'
            disabled={isEditing}
            // onClick={handleEdit}
          >
            <Link href={`/dashboard/expense/${transaction.id}`}>
              <Pencil size={24} className='svg text-stone-200' /> Edit
            </Link>
            {/* {isEditing ? 'Editing...' : 'Edit'} */}
          </Button>
        </DropdownMenuItem>

        {/* Add cancel edit option when editing */}
        {/* {isEditing && (
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
        )} */}

        <DropdownMenuItem
          className='group cursor-pointer border text-gray-100 shadow-lg hover:focus:text-red-600'
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <AlertDialogButton
            remove={() =>
              transaction.id && onRemoved && onRemoved(transaction.id)
            }
            icon={Trash}
            action='remove'
            className='bg-accent flex w-full items-center justify-start gap-2 dark:hover:cursor-pointer dark:hover:bg-red-900/30'
          />
        </DropdownMenuItem>
      </>
    ) : (
      <div />
    );
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className='[data-side] float-right'>
        <Button variant='ghost' type='button' size='lg' className='h-6 w-6'>
          <Ellipsis
            size={24}
            className='svg h-8 w-auto stroke-amber-100 stroke-2'
            style={{ width: '18px', height: '18px' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{renderedContent}</DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExpenseUpdateDropdown;
