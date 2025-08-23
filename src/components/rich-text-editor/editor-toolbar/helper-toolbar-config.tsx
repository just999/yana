import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';

import { ColorPicker } from '../color-picker';

type ToggleStyleHandler = (style: string) => () => void;
type isActiveHandler = (activeStyles: Set<string>) => boolean;
type ToggleTextAlignmentHandler = (style: string) => () => void;
type ToggleListHandler = (
  e: React.MouseEvent<Element, HTMLElement>,
  tag: string
) => void;
type ToggleImageHandler = (
  e: React.MouseEvent<Element, HTMLElement>,
  tag: string
) => void;
// type isActiveHandler = (activeStyles:Set<string>)=>boolean

const toolbarConfig = [
  {
    group: 'textStyles',
    buttons: [
      {
        title: 'Bold (Ctrl+B)',
        icon: Bold,
        onClick: (onToggleStyle: ToggleStyleHandler) => () =>
          onToggleStyle('bold'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('bold'),
      },
      {
        title: 'Italic (Ctrl+I)',
        icon: Italic,
        onClick: (onToggleStyle: ToggleStyleHandler) => () =>
          onToggleStyle('italic'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('italic'),
      },
      {
        title: 'Underline (Ctrl+U)',
        icon: Underline,
        onClick: (onToggleStyle: ToggleStyleHandler) => () =>
          onToggleStyle('underline'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('underline'),
      },
    ],
  },
  {
    group: 'divider',
    component: () => <div className='mx-1 w-px bg-gray-300' />,
  },
  {
    group: 'headings',
    buttons: [
      {
        title: 'Heading 1',
        icon: Heading1,
        onClick: (onToggleStyle: ToggleStyleHandler) => () =>
          onToggleStyle('h1'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('h1'),
      },
      {
        title: 'Heading 2',
        icon: Heading2,
        onClick: (onToggleStyle: ToggleStyleHandler) => () =>
          onToggleStyle('h2'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('h2'),
      },
    ],
  },
  {
    group: 'divider',
    component: () => <div className='mx-1 w-px bg-gray-300' />,
  },
  {
    group: 'alignment',
    buttons: [
      {
        title: 'Align Center',
        icon: AlignCenter,
        onClick: (onToggleTextAlignment: ToggleTextAlignmentHandler) => () =>
          onToggleTextAlignment('center'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('center'),
      },
      {
        title: 'Align Left',
        icon: AlignLeft,
        onClick: (onToggleTextAlignment: ToggleTextAlignmentHandler) => () =>
          onToggleTextAlignment('left'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('left'),
      },
      {
        title: 'Align Justify',
        icon: AlignJustify,
        onClick: (onToggleTextAlignment: ToggleTextAlignmentHandler) => () =>
          onToggleTextAlignment('justify'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('justify'),
      },
      {
        title: 'Align Right',
        icon: AlignRight,
        onClick: (onToggleTextAlignment: ToggleTextAlignmentHandler) => () =>
          onToggleTextAlignment('right'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('right'),
      },
    ],
  },
  {
    group: 'lists',
    buttons: [
      {
        title: 'Ordered List',
        icon: ListOrdered,
        onClick:
          (onToggleList: ToggleListHandler) =>
          (e: React.MouseEvent<Element, HTMLElement>) =>
            onToggleList(e, 'ol'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('ol'),
      },
      {
        title: 'Unordered List',
        icon: List,
        onClick:
          (onToggleList: ToggleListHandler) =>
          (e: React.MouseEvent<Element, HTMLElement>) =>
            onToggleList(e, 'ul'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('ul'),
      },
    ],
  },
  {
    group: 'divider',
    component: () => <div className='mx-1 w-px bg-gray-300' />,
  },
  {
    group: 'colorPicker',
    component: ({
      currentTextColor,
      showColorPicker,
      onToggleColorPicker,
      onColorChange,
    }: {
      currentTextColor: string;
      showColorPicker: boolean;
      onToggleColorPicker: (toggle: boolean) => void;
      onColorChange: (color: string) => void;
    }) => (
      <ColorPicker
        currentColor={currentTextColor}
        showPicker={showColorPicker}
        onTogglePicker={(toggle) => onToggleColorPicker(!toggle)}
        onColorChange={onColorChange}
      />
    ),
  },
  {
    group: 'divider',
    component: () => <div className='mx-1 w-px bg-gray-300' />,
  },
  {
    group: 'images',
    buttons: [
      {
        title: 'Insert Images',
        icon: Image,
        onClick:
          (onImageUpload: ToggleImageHandler) =>
          (e: React.MouseEvent<Element, HTMLElement>) =>
            onImageUpload(e, 'img'),
        isActive: (activeStyles: Set<string>) => activeStyles.has('img'),
      },
    ],
  },
];

export default toolbarConfig;
