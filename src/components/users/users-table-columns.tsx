'use client';

import { formatDate } from '@/lib/utils';
import { User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

type UserWithCount = User & {
  _count: {
    posts: number;
    comments?: number;
    likes?: number;
    like?: number;
    dislike?: number;
    total?: number;
  };
};

export const columns: ColumnDef<UserWithCount>[] = [
  {
    accessorKey: 'id',
    header: () => <div className='text-left'>No.</div>,
    cell: ({ row }) => {
      return <div className='text-left font-medium'>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: () => <div className='text-left'>Name</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div className='text-left'>Email</div>,
  },
  {
    accessorKey: 'role',
    header: () => <div className='text-left'>Role</div>,
  },
  {
    accessorKey: 'anonymous',
    header: () => <div className='text-left'>Anonymous</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original.anonymous ? 'Yes' : 'No'}
        </div>
      );
    },
  },
  {
    accessorKey: 'emailVerified',
    header: () => <div className='text-left'>Email Verified</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original.emailVerified ? (
            formatDate.date(row.original.emailVerified?.toISOString())
          ) : (
            <span className='text-muted-foreground text-xs font-normal'>
              Unverified
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'posts',
    header: () => <div className='text-left'>Posts</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original._count?.posts}
        </div>
      );
    },
  },
  {
    accessorKey: 'comments',
    header: () => <div className='text-left'>Comments</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original._count?.comments}
        </div>
      );
    },
  },
  {
    accessorKey: 'likes',
    header: () => <div className='text-left'>love</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original._count?.likes}
        </div>
      );
    },
  },
  {
    accessorKey: 'like',
    header: () => <div className='text-left'>like</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>{row.original._count.like}</div>
      );
    },
  },
  {
    accessorKey: 'dislike',
    header: () => <div className='text-left'>dislike</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original._count.dislike}
        </div>
      );
    },
  },
  {
    accessorKey: 'profileComplete',
    header: () => <div className='text-left'>profile</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {row.original.profileComplete ? 'Yes' : 'No'}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => <div className='text-left'>join at</div>,
    cell: ({ row }) => {
      return (
        <div className='text-left font-medium'>
          {formatDate.date(row.original.createdAt.toISOString())}
        </div>
      );
    },
  },
];
