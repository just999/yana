import { Bold } from 'lucide-react';

import { ToolbarButton } from '../toolbar-button';
import toolbarConfig from './helper-toolbar-config';

interface EditorToolbarProps {
  activeStyles: Set<string>;
  currentTextColor: string;
  showColorPicker: boolean;
  onToggleStyle: (tag: string, className?: string) => void;
  onToggleTextAlignment: (
    alignment: 'left' | 'right' | 'center' | 'justify'
  ) => void;
  onToggleColorPicker: () => void;
  onColorChange: (color: string) => void;
  onImageUpload: (e: React.MouseEvent) => void;
  onToggleList: (e: React.MouseEvent, listType: 'ul' | 'ol') => void;
  isStyleActive: (style: string) => boolean;
  getRootProps: () => any;
  getInputProps: () => any;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeStyles,
  currentTextColor,
  showColorPicker,
  onToggleStyle,
  onToggleTextAlignment,
  onToggleColorPicker,
  onColorChange,
  onImageUpload,
  onToggleList,
  isStyleActive,
  getRootProps,
  getInputProps,
}) => {
  return (
    <div className='toolbar mb-2 flex gap-0 rounded-t border bg-gray-50'>
      {toolbarConfig.map((tb, i) => {
        return (
          <span key={`${tb.group}-${i}`}>
            <ToolbarButton
              title='Bold'
              shortcut='ctrl+B'
              icon={Bold}
              onClick={() => onToggleStyle('b')}
              isActive={activeStyles.has('bold')}
            />
          </span>
        );
      })}
      {/* Toolbar content */}
    </div>
  );
};
