import { atom } from 'jotai';

import { CommentsProps } from '../types';

export const commentAtom = atom<CommentsProps[]>([]);
export const editCommentAtom = atom<CommentsProps | null>(null);

export const toggleCommentAtom = atom<boolean>(false);

export const loveIdsAtom = atom<string[]>([]);
export const allLoveIdsAtom = atom<string[]>([]);

// Atom to track which comment is being edited
export const editingCommentIdAtom = atom<string | null>(null);

// Atom to track edit form data
export const editCommentDataAtom = atom<{ [commentId: string]: string }>({});

// Derived atom for checking if any comment is being edited
export const isEditingAnyCommentAtom = atom(
  (get) => get(editingCommentIdAtom) !== null
);

// Atom for focusing edit input
export const focusEditInputAtom = atom<string | null>(null);
