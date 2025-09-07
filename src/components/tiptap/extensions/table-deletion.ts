// extensions/table-deletion.ts
import { Extension } from '@tiptap/core';

export const TableDeletionExtension = Extension.create({
  name: 'tableDeletion',

  addKeyboardShortcuts() {
    return {
      // Main backspace handler for table deletion
      Backspace: ({ editor }) => {
        console.log('Backspace pressed in table deletion extension');
        const { selection, doc } = editor.state;
        const { $from, empty } = selection;

        // Only proceed if selection is empty (cursor position, not text selection)
        if (!empty) return false;

        // Find if we're inside a table
        let tableDepth = -1;
        let tableCellDepth = -1;

        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'table') {
            tableDepth = depth;
          }
          if (
            node.type.name === 'tableCell' ||
            node.type.name === 'tableHeader'
          ) {
            tableCellDepth = depth;
          }
        }

        // If we're not in a table, let default behavior handle it
        if (tableDepth === -1) return false;

        // Get the table node
        const table = $from.node(tableDepth);
        const tableContent = table.textContent.trim();

        // Check if table is completely empty
        if (tableContent === '' || tableContent.length === 0) {
          // Delete the entire table
          editor.chain().focus().deleteTable().run();
          return true;
        }

        // Check if we're at the beginning of the first cell and it's empty
        if (tableCellDepth !== -1) {
          const cellNode = $from.node(tableCellDepth);
          const cellContent = cellNode.textContent.trim();

          // If current cell is empty and cursor is at the start
          if (cellContent === '' && $from.parentOffset === 0) {
            // Check if this is the first cell in the table
            const tableStart = $from.start(tableDepth);
            const cellStart = $from.start(tableCellDepth);

            // If we're in the first cell of the table, delete the whole table
            if (cellStart - tableStart <= 2) {
              // Account for table structure
              editor.chain().focus().deleteTable().run();
              return true;
            }
          }
        }

        return false; // Let default backspace behavior continue
      },

      // Alternative keyboard shortcuts for table deletion
      'Mod-Shift-Backspace': ({ editor }) => {
        if (editor.can().deleteTable()) {
          editor.chain().focus().deleteTable().run();
          return true;
        }
        return false;
      },

      // Delete key variant
      Delete: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, empty } = selection;

        if (!empty) return false;

        // Find if we're inside a table
        let tableDepth = -1;
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === 'table') {
            tableDepth = depth;
            break;
          }
        }

        if (tableDepth === -1) return false;

        const table = $from.node(tableDepth);
        const tableContent = table.textContent.trim();

        if (tableContent === '') {
          editor.chain().focus().deleteTable().run();
          return true;
        }

        return false;
      },
    };
  },
});
