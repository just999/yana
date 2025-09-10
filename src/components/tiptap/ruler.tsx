import React, { useEffect, useRef, useState } from 'react';

import { MIN_SPACE, PAGE_WIDTH } from '@/lib/constants';
import { useEditorStore } from '@/store/use-editor-store';
import { ChevronDown } from 'lucide-react';

type RulerProps = unknown;

const markers = Array.from({ length: 83 }, (_, i) => i);

export const RulerComp = () => {
  const { editor } = useEditorStore();
  const [leftMargin, setLeftMargin] = useState(56);
  const [rightMargin, setRightMargin] = useState(56);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Apply margins to the editor when they change
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom as HTMLElement;
      if (editorElement) {
        editorElement.style.paddingLeft = `${leftMargin}px`;
        editorElement.style.paddingRight = `${rightMargin}px`;
      }
    }
  }, [editor, leftMargin, rightMargin]);

  const handleLeftMouseDown = () => {
    setIsDraggingLeft(true);
  };

  const handleRightMouseDown = () => {
    setIsDraggingRight(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((isDraggingLeft || isDraggingRight) && rulerRef.current) {
      const container = rulerRef.current.querySelector('#ruler-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX));

        if (isDraggingLeft) {
          const maxLeftPosition = PAGE_WIDTH - rightMargin - MIN_SPACE;
          const newLeftPosition = Math.min(rawPosition, maxLeftPosition);

          setLeftMargin(newLeftPosition);
        } else if (isDraggingRight) {
          const maxRightPosition = PAGE_WIDTH - (leftMargin + MIN_SPACE);
          const newRightPosition = Math.max(PAGE_WIDTH - rawPosition, 0);
          const constrainedRightPosition = Math.min(
            newRightPosition,
            maxRightPosition
          );
          setRightMargin(constrainedRightPosition);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  };

  const handleLeftDoubleClick = () => {
    setLeftMargin(56);
  };
  const handleRightDoubleClick = () => {
    setRightMargin(56);
  };

  return (
    <div
      ref={rulerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className='relative flex h-6 w-full items-end border-b border-gray-300 select-none dark:border-gray-500 print:hidden'
    >
      <div
        id='ruler-container'
        className='relative mx-auto h-full w-full max-w-[816px]'
      >
        <Marker
          position={leftMargin}
          isLeft
          isDragging={isDraggingLeft}
          onMouseDown={handleLeftMouseDown}
          onDoubleClick={handleLeftDoubleClick}
        />
        <Marker
          position={rightMargin}
          isLeft={false}
          isDragging={isDraggingRight}
          onMouseDown={handleRightMouseDown}
          onDoubleClick={handleRightDoubleClick}
        />
        <div className='absolute inset-x-0 bottom-0 h-full'>
          <div className='relative h-full w-[816px]'>
            {markers.map((marker) => {
              const position = (marker * PAGE_WIDTH) / 82;

              return (
                <div
                  key={marker}
                  className='absolute bottom-0'
                  style={{ left: `${position}px` }}
                >
                  {marker % 10 === 0 && (
                    <>
                      <div className='absolute bottom-0 h-2 w-px bg-neutral-500 dark:bg-stone-400' />
                      <span className='absolute bottom-2 -translate-x-1/2 transform text-[10px] text-neutral-500 dark:text-stone-200'>
                        {marker / 10 + 1}
                      </span>
                    </>
                  )}
                  {marker % 5 === 0 && marker % 10 !== 0 && (
                    <div className='absolute bottom-0 h-1.5 w-px bg-neutral-500 dark:bg-stone-400' />
                  )}
                  {marker % 5 !== 0 && (
                    <div className='absolute bottom-0 h-1 w-px bg-neutral-500 dark:bg-stone-400' />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Ruler = React.memo(RulerComp);

interface MarkerProps {
  position: number;
  isLeft: boolean;
  isDragging: boolean;
  onMouseDown: () => void;
  onDoubleClick: () => void;
}

const MarkerComp = ({
  position,
  isLeft,
  isDragging,
  onMouseDown,
  onDoubleClick,
}: MarkerProps) => {
  return (
    <div
      className='group absolute top-0 z-[5] -ml-2 h-full w-4 cursor-ew-resize'
      style={{ [isLeft ? 'left' : 'right']: `${position}px` }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <ChevronDown className='absolute top-0 left-1/2 size-12 h-full -translate-x-1/2 transform fill-blue-500 stroke-0' />
      <div
        className='absolute top-4 left-1/2 -translate-x-1/2 transform'
        style={{
          height: '100vh',
          width: '1px',
          transform: 'scaleX(.5)',
          backgroundColor: '#3b72f6',
          display: isDragging ? 'block' : 'none',
        }}
      />

      {/* {isDragging && (
        <div
          className='absolute top-4 left-1/2 -translate-x-1/2 transform border-l border-dashed border-blue-600/30 opacity-60'
          style={{
            height: '100vh',
          }}
        />
      )} */}
    </div>
  );
};

const Marker = React.memo(MarkerComp);
