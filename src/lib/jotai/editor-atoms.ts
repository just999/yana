import { type Editor, type JSONContent } from '@tiptap/react';
import { atom } from 'jotai';

export const editorAtom = atom<Editor | null>(null);

// Add a trigger atom for forcing updates
export const editorUpdateTriggerAtom = atom(0);

export const editorContentAtom = atom('');

const EMPTY_JSON: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: null,
        lineHeight: 'normal',
      },
    },
  ],
};

export const editorStateAtom = atom((get) => {
  const editor = get(editorAtom);
  const updateTrigger = get(editorUpdateTriggerAtom);

  return {
    editor,
    isReady: editor !== null,
    // Use TipTap's built-in isEmpty method
    hasContent: editor ? !editor.isEmpty : false,

    activeStates: editor
      ? {
          bold: editor.isActive('bold'),
          italic: editor.isActive('italic'),
          underline: editor.isActive('underline'),
          taskList: editor.isActive('taskList'),
        }
      : null,
  };
});
export const setEditorAtom = atom(
  null,
  (get, set, newEditor: Editor | null) => {
    const currentEditor = get(editorAtom);
    if (currentEditor !== newEditor) {
      set(editorAtom, newEditor);

      // Set up editor update listeners when editor changes
      if (newEditor) {
        newEditor.on('transaction', () => {
          set(editorUpdateTriggerAtom, (prev) => prev + 1);
        });
      }
    }
  }
);

export const triggerEditorUpdateAtom = atom(null, (get, set) => {
  set(editorUpdateTriggerAtom, (prev) => prev + 1);
});
