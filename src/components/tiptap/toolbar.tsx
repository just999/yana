'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLProps,
} from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { useTheme } from '@/lib/contexts/theme-context';
import { blogAtom, imageAtoms, pendingImgAtoms } from '@/lib/jotai/blog-atoms';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/use-editor-store';
// import { useEditorStore } from '@/store/use-editor-store';
import { type Level } from '@tiptap/extension-heading';
import { useAtom } from 'jotai';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  Code2,
  FileJsonIcon,
  GlobeIcon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  LucideIcon,
  MessageSquarePlusIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SaveIcon,
  SearchIcon,
  SpellCheckIcon,
  TableIcon,
  TextIcon,
  UnderlineIcon,
  Undo2Icon,
  UploadIcon,
} from 'lucide-react';
import { SketchPicker, type ColorResult } from 'react-color';
import {
  BiLogoCss3,
  BiLogoHtml5,
  BiLogoJava,
  BiLogoPhp,
  BiLogoPostgresql,
  BiLogoPython,
  BiLogoTypescript,
  BiText,
} from 'react-icons/bi';
import { BsFilePdf } from 'react-icons/bs';
import { RiJavascriptLine, RiLineHeight } from 'react-icons/ri';
import { SiGnubash, SiJson } from 'react-icons/si';

import { Ruler } from './ruler';

// const AlignButton = () => {
//   const { editor } = useEditorStore();

//   const alignments = [
//     {
//       label: 'Align Left',
//       value: 'left',
//       icon: AlignLeftIcon,
//     },
//     {
//       label: 'Align Center',
//       value: 'center',
//       icon: AlignCenterIcon,
//     },
//     {
//       label: 'Align Right',
//       value: 'right',
//       icon: AlignRightIcon,
//     },
//   ];

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant={'ghost'}
//           type='button'
//           className={cn(
//             'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
//           )}
//         >
//           <AlignLeftIcon className='size-4' /> {/* {value} */}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className='flex flex-col items-baseline gap-y-1 p-1'>
//         {alignments.map(({ label, value, icon: Icon }) => (
//           <Button
//             variant={'ghost'}
//             key={label}
//             onClick={() => editor?.chain().focus().setTextAlign(value).run()}
//             className={cn(
//               'flex items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
//               editor?.isActive({ textAlign: value }) && 'bg-neutral-200/80'
//             )}
//           >
//             <Icon className='size-4' />
//             <span className='text-sm'>
//               {label}-{value}
//             </span>
//           </Button>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };
const SaveButton = () => {
  const { editor } = useEditorStore();
  // Check if editor content is empty
  const isContentEmpty = useMemo(() => {
    if (!editor?.state.doc) return true;
    // if (editor.isEmpty) return true;
    // TipTap's built-in isEmpty handles most cases well
    return editor.isEmpty;
  }, [editor?.isEmpty, editor?.state.doc]);

  const onDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL
  };

  const onSaveJSON = () => {
    if (!editor || isContentEmpty) return;

    const content = editor.getJSON();
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json', // Fixed MIME type
    });
    onDownload(blob, `document.json`);
  };

  const onSaveHTML = () => {
    if (!editor || isContentEmpty) return;

    const content = editor.getHTML();
    const blob = new Blob([content], {
      type: 'text/html',
    });
    onDownload(blob, `document.html`);
  };

  const onSaveText = () => {
    if (!editor || isContentEmpty) return;

    const content = editor.getText();
    const blob = new Blob([content], {
      type: 'text/plain',
    });
    onDownload(blob, `document.txt`);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              size={'sm'}
              type='button'
              disabled={isContentEmpty}
              className={cn(
                'flex h-7 min-w-7 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80 dark:bg-neutral-300/20 dark:backdrop-blur-sm',
                isContentEmpty && 'cursor-not-allowed bg-gray-500/20 opacity-50'
              )}
            >
              <SaveIcon
                className={cn(
                  'size-4 stroke-1',
                  isContentEmpty
                    ? 'text-gray-300'
                    : 'text-black dark:text-white'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isContentEmpty ? 'No content to save' : 'Save'}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent>
        <DropdownMenuItem
          className={cn(
            'text-xs font-semibold',
            isContentEmpty && 'cursor-not-allowed opacity-50'
          )}
          onClick={onSaveJSON}
          disabled={isContentEmpty}
        >
          <FileJsonIcon className='mr-2 size-4' />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            'text-xs font-semibold',
            isContentEmpty && 'cursor-not-allowed opacity-50'
          )}
          onClick={onSaveHTML}
          disabled={isContentEmpty}
        >
          <GlobeIcon className='mr-2 size-4' />
          HTML
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            'text-xs font-semibold',
            isContentEmpty && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !isContentEmpty && window.print()}
          disabled={isContentEmpty}
        >
          <BsFilePdf className='mr-2 size-4' />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            'text-xs font-semibold',
            isContentEmpty && 'cursor-not-allowed opacity-50'
          )}
          onClick={onSaveText}
          disabled={isContentEmpty}
        >
          <TextIcon className='mr-2 size-4' />
          Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Language options for code blocks
const CODE_LANGUAGES = [
  {
    value: 'javascript',
    label: 'JavaScript',
    icon: RiJavascriptLine,
    ext: 'js',
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    icon: BiLogoTypescript,
    ext: 'ts',
  },
  { value: 'plaintext', label: 'Plaintext', icon: BiText, ext: 'txt' },
  { value: 'html', label: 'HTML', icon: BiLogoHtml5, ext: 'html' },
  { value: 'css', label: 'CSS', icon: BiLogoCss3, ext: 'css' },
  { value: 'json', label: 'JSON', icon: SiJson, ext: 'json' },
  { value: 'bash', label: 'Bash', icon: SiGnubash, ext: 'sh' },
  { value: 'sql', label: 'SQL', icon: BiLogoPostgresql, ext: 'sql' },
  { value: 'java', label: 'Java', icon: BiLogoJava, ext: 'java' },
  { value: 'php', label: 'PHP', icon: BiLogoPhp, ext: 'php' },
  { value: 'python', label: 'Python', icon: BiLogoPython, ext: 'py' },
];

export const InsertButton = () => {
  const { editor } = useEditorStore();

  const insertCodeBlock = (language: string) => {
    if (editor?.can().setBlockquote()) {
      // Get sample code based on language
      const sampleCode = getSampleCode(language);

      // editor
      //   .chain()
      //   .focus()
      //   .insertContent({
      //     type: 'codeBlock',
      //     attrs: {
      //       language,
      //     },
      //     content: [
      //       {
      //         type: 'text',
      //         text: sampleCode,
      //       },
      //     ],
      //   })
      //   .run();

      editor.chain().focus().setCodeBlock({ language }).run();
    }
  };

  const getSampleCode = (language: string): string => {
    const samples: Record<string, string> = {
      javascript: `// JavaScript example
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));`,
      typescript: `// TypeScript example
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};`,
      python: `# Python example
def greeting(name: str) -> str:
    return f"Hello, {name}!"

print(greeting("World"))`,
      html: `<!-- HTML example -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Example</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
      css: `/* CSS example */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
}`,
      json: `{
  "name": "example",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
      bash: `#!/bin/bash
# Bash example
echo "Hello World!"

# Loop through files
for file in *.txt; do
  echo "Processing $file"
done`,
      sql: `-- SQL example
SELECT 
  users.name,
  COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id
ORDER BY order_count DESC;`,
      java: `// Java example
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      php: `<?php
// PHP example
function greeting($name) {
    return "Hello, " . $name . "!";
}

echo greeting("World");
?>`,
      text: 'Your code here...',
    };

    return samples[language] || samples.text;
  };

  const insertOptions = [
    // Table options
    {
      label: 'Table (3×3)',
      icon: TableIcon,
      action: () => {
        if (
          editor?.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        ) {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        }
      },
      canExecute: () =>
        editor?.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    },
    {
      label: 'Table (2×2)',
      icon: TableIcon,
      action: () => {
        if (
          editor?.can().insertTable({ rows: 2, cols: 2, withHeaderRow: true })
        ) {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
            .run();
        }
      },
      canExecute: () =>
        editor?.can().insertTable({ rows: 2, cols: 2, withHeaderRow: true }),
    },
    {
      label: 'Custom Table',
      icon: TableIcon,
      action: () => {
        const rows = parseInt(prompt('Number of rows:') || '3');
        const cols = parseInt(prompt('Number of columns:') || '3');
        if (
          rows > 0 &&
          cols > 0 &&
          editor?.can().insertTable({ rows, cols, withHeaderRow: true })
        ) {
          editor
            .chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: true })
            .run();
        }
      },
      canExecute: () =>
        editor?.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    },
    // Image option
    {
      label: 'Image',
      icon: ImageIcon,
      action: () => {
        const url = prompt('Enter image URL:');
        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
      },
      canExecute: () => true,
    },
    // Horizontal rule
    {
      label: 'Horizontal Rule',
      icon: MinusIcon,
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      canExecute: () => editor?.can().setHorizontalRule(),
    },
  ];

  if (!editor) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'ghost'}
          type='button'
          size={'sm'}
          className={cn(
            'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-xs font-light shadow-md hover:bg-neutral-200/80'
          )}
        >
          Insert
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='flex min-w-48 flex-col gap-y-1 p-1'>
        {/* Regular insert options */}
        {insertOptions.map(({ label, icon: Icon, action, canExecute }) => (
          <DropdownMenuItem
            key={label}
            onClick={action}
            disabled={!canExecute()}
            className={cn(
              'flex w-full cursor-pointer items-center justify-start gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              !canExecute() && 'cursor-not-allowed opacity-50'
            )}
          >
            <Icon className='size-4' />
            <span className='text-sm'>{label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Code Block Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className='flex items-center gap-x-2 px-2 py-1'
            disabled={!editor?.can().toggleCodeBlock()}
          >
            <Code2 className='size-4' />
            <span className='text-sm'>Code Block</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='min-w-40 p-1'>
            {/* Quick insert for popular languages */}
            <div className='mb-2'>
              <p className='text-muted-foreground px-2 py-1 text-xs font-medium'>
                Popular
              </p>
              {CODE_LANGUAGES.slice(0, 4).map(
                ({ value, label, icon: Icon, ext }) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => insertCodeBlock(value)}
                    className='flex cursor-pointer items-center gap-x-2 px-2 py-1'
                  >
                    <Icon className='size-4' />
                    <span className='text-sm'>{label}</span>
                    <span className='text-muted-foreground ml-auto text-xs'>
                      .{ext}
                    </span>
                  </DropdownMenuItem>
                )
              )}
            </div>

            <DropdownMenuSeparator />

            {/* All languages */}
            <div>
              <p className='text-muted-foreground px-2 py-1 text-xs font-medium'>
                All Languages
              </p>
              {CODE_LANGUAGES.map(({ value, label, icon: Icon, ext }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => insertCodeBlock(value)}
                  className='flex cursor-pointer items-center gap-x-2 px-2 py-1'
                >
                  <Icon className='size-4' />
                  <span className='text-sm'>{label}</span>
                  <span className='text-muted-foreground ml-auto text-xs'>
                    .{ext}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            {/* Empty code block */}
            <DropdownMenuItem
              onClick={() => {
                editor?.chain().focus().toggleCodeBlock().run();
              }}
              className='flex cursor-pointer items-center gap-x-2 px-2 py-1'
            >
              <Code2 className='size-4' />
              <span className='text-sm'>Empty Code Block</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LineHeightButton = () => {
  const { editor } = useEditorStore();

  const lineHeights = [
    {
      label: 'Default',
      value: 'normal',
    },
    {
      label: 'Single',
      value: '1',
    },
    {
      label: '1.15',
      value: '1.15',
    },
    {
      label: '1.5',
      value: '1.5',
    },
    {
      label: '2',
      value: '2',
    },
  ];

  const getCurrentHeight = () => {
    if (editor?.getAttributes('paragraph').lineHeight === 'Single') return '1';
    if (editor?.getAttributes('paragraph').lineHeight === '1.15') return '1.15';
    if (editor?.getAttributes('paragraph').lineHeight === '1.5') return '1.5';
    if (editor?.getAttributes('paragraph').lineHeight === '2') return '2';
    return 'normal'; // default
  };

  const LineHeight = getCurrentHeight();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
              )}
            >
              <RiLineHeight className='size-4' />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Line Height</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className='flex flex-col gap-y-1 p-1'>
        {lineHeights.map(({ label, value }) => (
          <Button
            variant={'ghost'}
            key={value}
            type='button'
            onClick={() => editor?.chain().focus().setLineHeight(value).run()}
            className={cn(
              'flex w-full items-center justify-start gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              editor?.getAttributes('paragraph').lineHeight === value &&
                'bg-neutral-200/80'
            )}
          >
            <span className='text-sm'>{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontSizeButton = () => {
  const { editor } = useEditorStore();

  const getCurrentFontSize = () => {
    if (!editor) return '14';

    const attrs = editor.getAttributes('textStyle');
    if (attrs.fontSize) {
      const size = attrs.fontSize.replace('px', '');
      const numSize = parseFloat(size);

      // Clean up weird computed values
      if (numSize === 18.6667 || numSize === 18.67) return '19';
      if (numSize === 16.6667 || numSize === 16.67) return '17';

      // Round to nearest whole number for cleaner values
      return Math.round(numSize).toString();
    }

    return '14';
  };

  const currentFontSize = getCurrentFontSize();

  const [fontSize, setFontSize] = useState(currentFontSize);
  const [inputValue, setInputValue] = useState(fontSize);
  const [isEditing, setIsEditing] = useState(false);

  const updateFontSize = (newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}px`).run();
      setFontSize(newSize);
      setInputValue(newSize);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    updateFontSize(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateFontSize(inputValue);
      editor?.commands.focus();
    }
  };

  const increment = () => {
    const newSize = parseInt(fontSize) + 1;
    updateFontSize(newSize.toString());
  };
  const decrement = () => {
    const newSize = parseInt(fontSize) - 1;
    if (newSize > 0) {
      updateFontSize(newSize.toString());
    }
  };

  return (
    <div className='flex items-center gap-x-0.5'>
      <Button
        variant={'ghost'}
        type='button'
        size={'sm'}
        onClick={decrement}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center gap-0.5 rounded-sm py-0 shadow-md hover:bg-neutral-200/80'
        )}
      >
        <MinusIcon className='size-3.5' />
      </Button>
      {isEditing ? (
        <Input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className='h-7 w-10 shrink-0 rounded-sm border bg-transparent px-1.5 text-center text-xs font-light focus:ring-0 focus:outline-none'
          style={{ boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,.3)' }}
        />
      ) : (
        <Button
          variant={'ghost'}
          type='button'
          size={'sm'}
          onClick={() => {
            setIsEditing(true);
            setFontSize(currentFontSize);
          }}
          className={cn(
            'flex h-7 min-w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-300/10 px-1.5 text-xs font-light hover:bg-neutral-200/80'
          )}
          style={{ boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,.3)' }}
        >
          {currentFontSize}
        </Button>
      )}

      <Button
        variant={'ghost'}
        type='button'
        size={'sm'}
        onClick={increment}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center gap-0.5 rounded-sm py-0 shadow-md hover:bg-neutral-200/80'
        )}
      >
        <PlusIcon className='size-3.5' />
      </Button>
    </div>
  );
};

const ListButton = () => {
  const { editor } = useEditorStore();

  const lists = [
    {
      label: 'Bullet List',
      icon: ListIcon,
      isActive: () => editor?.isActive('bulletList'),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },

    {
      label: 'Ordered List',
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive('orderedList'),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
              )}
            >
              <ListIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>List</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className='flex flex-col gap-y-1 p-1'>
        {lists.map(({ label, icon: Icon, onClick, isActive }) => (
          <Button
            variant={'ghost'}
            key={label}
            onClick={onClick}
            className={cn(
              'flex w-full items-center justify-start gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              isActive() && 'bg-neutral-200/80'
            )}
          >
            <Icon className='size-4' />
            <span className='text-sm'>{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: 'Align Left',
      value: 'left',
      icon: AlignLeftIcon,
    },
    {
      label: 'Align Center',
      value: 'center',
      icon: AlignCenterIcon,
    },
    {
      label: 'Align Right',
      value: 'right',
      icon: AlignRightIcon,
    },
  ];

  const getCurrentIcon = () => {
    if (editor?.isActive({ textAlign: 'center' })) return AlignCenterIcon;
    if (editor?.isActive({ textAlign: 'right' })) return AlignRightIcon;
    return AlignLeftIcon; // default
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
              )}
            >
              <CurrentIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent className='flex flex-col gap-y-1 p-1'>
        {alignments.map(({ label, value, icon: Icon }) => (
          <Button
            variant={'ghost'}
            key={label}
            onClick={() => editor?.chain().focus().setTextAlign(value).run()}
            className={cn(
              'flex w-full items-center justify-start gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              editor?.isActive({ textAlign: value }) && 'bg-neutral-200/80'
            )}
          >
            <Icon className='size-4' />
            <span className='text-sm'>{value}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ImageButton = ({
  editorRef,
  fileInputRef,
  maxImages,
  updateContent,
  handleFileInputChange,
  insertImage,
  getInputProps,
  getRootProps,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  maxImages: number;
  updateContent: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  insertImage: (file: File, imageId: string, isInline: boolean) => void;
  getInputProps: () => HTMLProps<HTMLInputElement>;
  getRootProps: () => HTMLProps<HTMLDivElement>;
}) => {
  const { editor } = useEditorStore();

  const [pendingImages, setPendingImages] = useAtom(pendingImgAtoms);
  const [imageFiles, setImageFiles] = useState<File[] | null>(null);

  const [formData, setFormData] = useAtom(blogAtom);
  const [images, setImages] = useAtom(imageAtoms);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImageFiles(acceptedFiles);
  }, []);

  // const { startUpload, routeConfig } = useUploadThing('imageUploader');

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop,
  //   accept: generateClientDropzoneAccept(
  //     generatePermittedFileTypes(routeConfig).fileTypes
  //   ),
  // });

  const onChange = (imageUrl: string, alt?: string, title?: string) => {
    editor?.chain().focus().setImage({ src: imageUrl, alt, title }).run();
  };

  const onUpload = () => {
    const input = document.createElement('input');
    const inputProps = getInputProps();

    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';

    // Apply dropzone-specific properties
    if (inputProps.accept) input.accept = inputProps.accept;
    if (inputProps.multiple !== undefined) input.multiple = inputProps.multiple;

    // Apply data attributes
    Object.keys(inputProps).forEach((key) => {
      if (key.startsWith('data-') || key.startsWith('aria-')) {
        input.setAttribute(
          key,
          inputProps[key as keyof typeof inputProps] as string
        );
      }
    });
    input.onchange = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files?.[0];
        const alt = file.name;
        const imageUrl = URL.createObjectURL(file);
        const title = imageUrl.split('/').pop() || file.name || 'image';
        insertImage(file, imageUrl, isInline);
        onChange(imageUrl, alt, title);

        const syntheticEvent = {
          target: { files: files },
          currentTarget: { files: files },
          type: 'change',
          preventDefault: () => {},
          stopPropagation: () => {},
          nativeEvent: e,
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {},
        } as React.ChangeEvent<HTMLInputElement>;

        handleFileInputChange(syntheticEvent);

        // Call dropzone's original onChange
        if (inputProps.onChange) {
          inputProps.onChange(syntheticEvent);
        }
      }
    };

    input.click();
  };

  const handleImgUrlSubmit = () => {
    if (imgUrl) {
      onChange(imgUrl);
      setImgUrl('');
      setIsDialogOpen(false);
    }
  };

  const isInline = true;

  return (
    <div {...getRootProps()}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                variant={'ghost'}
                size={'sm'}
                type='button'
                className={cn(
                  'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
                )}
              >
                <ImageIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className='flex flex-col items-stretch gap-1 p-2'>
          <DropdownMenuItem onClick={onUpload} className='cursor-pointer'>
            <UploadIcon className='mr-2 size-4' />
            Upload from device
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <SearchIcon className='mr-2 size-4' />
            Paste img url
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert img url</DialogTitle>
          </DialogHeader>
          <Input
            placeholder='Insert img URL'
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                handleImgUrlSubmit();
              }
            }}
          />
          <DialogFooter>
            <Button variant={'ghost'} onClick={handleImgUrlSubmit}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LinkButton = () => {
  const { editor } = useEditorStore();

  const [value, setValue] = useState('');

  const onChange = (href: string) => {
    editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setValue('');
  };
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setValue(editor?.getAttributes('link').href || '');
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
              )}
            >
              <Link2Icon className='size-3' /> {/* {value} */}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Link</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className='flex items-center gap-x-2 p-2.5'>
        <Input
          placeholder='https://example.com'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={() => onChange(value)}>Apply</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HighlightColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes('highlight').color || '#FFF';

  const onChange = (color: ColorResult) => {
    if (color.rgb.a !== undefined && color.rgb.a < 1) {
      const { r, g, b, a } = color.rgb;
      editor
        ?.chain()
        .focus()
        .setHighlight({ color: `rgba(${r},${g},${b},${a})` })
        .run();
    } else {
      editor?.chain().focus().setHighlight({ color: color.hex }).run();
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-200/80'
              )}
            >
              <span className='text-xs'>
                <HighlighterIcon className='size-3' />{' '}
              </span>
              <div className='h-1 w-full' style={{ backgroundColor: value }} />
              {/* {value} */}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Highlight text color</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className='p-0'>
        <SketchPicker color={value} onChange={onChange} disableAlpha={false} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes('textStyle').color || '#000000';

  const onChange = (color: ColorResult) => {
    if (color.rgb.a !== undefined && color.rgb.a < 1) {
      const { r, g, b, a } = color.rgb;
      editor?.chain().focus().setColor(`rgba(${r},${g},${b},${a})`).run();
    } else {
      editor?.chain().focus().setColor(color.hex).run();
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              type='button'
              size={'sm'}
              className={cn(
                'flex h-7 min-w-7 shrink-0 flex-col items-center justify-center gap-0 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm shadow-md hover:bg-neutral-300/80'
              )}
            >
              <span className='text-xs'>A</span>
              <div
                className='h-1 w-full'
                style={{ backgroundColor: value }}
              />{' '}
              {/* {value} */}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Text Color</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className='p-0'>
        <SketchPicker color={value} onChange={onChange} disableAlpha={false} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HeadingLevelButton = () => {
  const { editor } = useEditorStore();

  const headings = [
    {
      label: 'Normal',
      value: 0,
      fontSize: '14px',
    },
    {
      label: 'Heading 1',
      value: 1,
      fontSize: '32px',
    },
    {
      label: 'Heading 2',
      value: 2,
      fontSize: '24px',
    },
    {
      label: 'Heading 3',
      value: 3,
      fontSize: '19px',
    },
    {
      label: 'Heading 4',
      value: 4,
      fontSize: '16px',
    },
    {
      label: 'Heading 5',
      value: 5,
      fontSize: '14px',
    },
    {
      label: 'Heading 6',
      value: 6,
      fontSize: '11px',
    },
  ];

  const getCurrentHeading = () => {
    for (let level = 1; level <= 6; level++) {
      if (editor?.isActive('heading', { level })) {
        return `Heading ${level}`;
      }
    }
    return 'Normal';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=''>
        <Button
          variant={'ghost'}
          type='button'
          size={'sm'}
          className={cn(
            'flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-300/10 px-1.5 text-xs font-light hover:bg-neutral-200/80'
          )}
          style={{ boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,.3)' }}
        >
          <span className='truncate text-xs'>{getCurrentHeading()}</span>
          <ChevronDownIcon className='ml-2 size-4 shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='flex flex-col gap-y-1 p-1'>
        {headings.map(({ label, value, fontSize }) => (
          <Button
            key={value}
            onClick={() => {
              if (value === 0) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: value as Level })
                  .run();
              }
            }}
            variant={'ghost'}
            type='button'
            className={cn(
              'flex w-full items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              (value === 0 && !editor?.isActive('heading')) ||
                (editor?.isActive('heading', { level: value }) &&
                  'w-full bg-neutral-200/80')
            )}
            style={{ fontSize }}
          >
            <span>{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyButton = () => {
  const { editor } = useEditorStore();

  const fonts = [
    {
      label: 'Arial',
      value: 'Arial',
    },
    {
      label: 'Inter',
      value: 'inter',
    },
    {
      label: 'Monospace',
      value: 'monospace',
    },
    {
      label: 'Comic Sans',
      value: 'comic Sans Ms',
    },
    {
      label: 'Times New Roman',
      value: 'Times New Roman',
    },
    {
      label: 'Courier New',
      value: 'Courier New',
    },
    {
      label: 'Georgia',
      value: 'Georgia',
    },
    {
      label: 'Verdana',
      value: 'Verdana',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='bg-gray-300/10 dark:inset-shadow-sm dark:inset-shadow-indigo-500'
        style={{ boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,.3)' }}
      >
        <Button
          variant={'ghost'}
          size={'sm'}
          type='button'
          className={cn(
            'flex h-7 min-w-7 shrink-0 items-center justify-center gap-0.5 overflow-hidden rounded-sm bg-gray-300/10 px-1.5 py-0 text-sm font-light shadow-md hover:bg-neutral-200/80'
          )}
        >
          <span className='truncate text-xs'>
            {editor?.getAttributes('textStyle').fontFamily || 'Arial'}
          </span>
          <ChevronDownIcon className='ml-2 size-4 shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='flex flex-col justify-start p-1'>
        {fonts.map(({ label, value }) => (
          <Button
            key={value}
            size={'sm'}
            onClick={() => editor?.chain().focus().setFontFamily(value).run()}
            variant={'ghost'}
            type='button'
            className={cn(
              'flex w-full items-center justify-start gap-x-2 rounded-sm px-2 py-1 hover:bg-neutral-200/80',
              editor?.getAttributes('textStyle').fontFamily === value &&
                'bg-neutral-200/40'
            )}
            style={{ fontFamily: value }}
          >
            <span className='w-full text-left text-sm'>{label}</span>
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type ToolbarButtonProps = {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
};

const ToolbarButton = ({
  label,
  onClick,
  isActive,
  icon: Icon,
}: ToolbarButtonProps) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const getActiveStyle = () => {
    if (!isActive) return {};

    if (resolvedTheme === 'dark') {
      return {
        boxShadow: 'inset 5px 4px 15px 5px #000000',
      };
    } else {
      return {
        boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,0.3)',
      };
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          onClick={onClick}
          variant={'ghost'}
          size={'sm'}
          className={cn(
            'flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-sm text-sm shadow-md hover:bg-neutral-200/80 dark:bg-neutral-200/20 dark:backdrop-blur-sm',
            isActive &&
              'bg-neutral-200/80 text-amber-700 shadow-inner shadow-black/30 dark:text-yellow-300 dark:shadow-white/20'
          )}
          // style={
          //   isActive
          //     ? { boxShadow: 'inset 5px 2px 15px -9px rgba(0,0,0,.3)' }
          //     : {}
          // }

          style={getActiveStyle()}
        >
          <Icon size={12} className='size-3.5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const Toolbar = ({
  editorRef,
  fileInputRef,
  maxImages = 8,
  updateContent,
  handleFileInputChange,
  insertImage,
  getInputProps,
  getRootProps,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  maxImages: number;
  updateContent: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  insertImage: (file: File, imageId: string, isInline: boolean) => void;
  getInputProps: () => HTMLProps<HTMLInputElement>;
  getRootProps: () => HTMLProps<HTMLDivElement>;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { editor } = useEditorStore();

  const insertTable = ({ rows, cols }: { rows: number; cols: number }) => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: false })
      .run();
  };

  const handleUndo = () => {
    editor?.chain().focus().undo().run();
  };

  const handleRedo = () => {
    editor?.chain().focus().redo().run();
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    editor?.chain().focus().redo().run();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not near the top
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
  }[][] = [
    [
      {
        label: 'Undo',
        icon: Undo2Icon,
        onClick: handleUndo,
      },
      {
        label: 'Redo',
        icon: Redo2Icon,
        onClick: handleRedo,
      },
      {
        label: 'Print',
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: 'Spell Check',
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute('spellcheck');
          editor?.view.dom.setAttribute(
            'spellcheck',
            current === 'false' ? 'true' : 'false'
          );
        },
      },
    ],
    [
      {
        label: 'Bold',
        icon: BoldIcon,
        isActive: editor?.isActive('bold'),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: 'Italic',
        icon: ItalicIcon,
        isActive: editor?.isActive('italic'),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: 'Underline',
        icon: UnderlineIcon,
        isActive: editor?.isActive('underline'),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: 'Comment',
        icon: MessageSquarePlusIcon,
        isActive: false,
        onClick: handleComment,
      },
      {
        label: 'List Todo',
        icon: ListTodoIcon,
        isActive: editor?.isActive('taskList'),
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
      },
      {
        label: 'Remove Formatting',
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ];
  return (
    <div
      className={cn(
        'sticky top-44 z-50 transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div
        className={cn(
          'flex min-h-10 items-center justify-center gap-x-0.5 overflow-x-auto rounded-t-xl bg-[#f1f4f9] px-4 shadow-2xl dark:bg-stone-100/20 dark:text-amber-100',
          !isVisible ? 'border border-amber-700/30 dark:bg-stone-600' : ''
        )}
      >
        {sections[0].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <SaveButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <FontFamilyButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <InsertButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <HeadingLevelButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <FontSizeButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        {sections[1].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <TextColorButton />
        <HighlightColorButton />
        <Separator orientation='vertical' className='h-6 bg-gray-600' />
        <LinkButton />
        <ImageButton
          editorRef={editorRef}
          fileInputRef={fileInputRef}
          maxImages={maxImages}
          updateContent={updateContent}
          handleFileInputChange={handleFileInputChange}
          insertImage={insertImage}
          getInputProps={getInputProps}
          getRootProps={getRootProps}
        />
        <AlignButton />
        <LineHeightButton />
        <ListButton />
        {sections[2].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
      </div>
      <Ruler />
    </div>
  );
};

export default ToolbarButton;
