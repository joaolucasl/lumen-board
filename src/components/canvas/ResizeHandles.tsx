import React from 'react';
import type { CanvasElement, ResizeHandleType } from '../../types';
import { COLORS } from '../../constants';

export interface ResizeHandlesProps {
  element: CanvasElement;
  onPointerDown?: (handle: ResizeHandleType, event: React.PointerEvent) => void;
}

type HandleConfig = {
  type: ResizeHandleType;
  cursor: React.CSSProperties['cursor'];
  getPosition: (el: CanvasElement) => { x: number; y: number };
};

const HANDLE_SIZE = 8;
const SELECTION_PADDING = 4;

const HANDLES: HandleConfig[] = [
  {
    type: 'top-left',
    cursor: 'nwse-resize',
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y - SELECTION_PADDING }),
  },
  {
    type: 'top-center',
    cursor: 'ns-resize',
    getPosition: (el) => ({ x: el.x + el.width / 2, y: el.y - SELECTION_PADDING }),
  },
  {
    type: 'top-right',
    cursor: 'nesw-resize',
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y - SELECTION_PADDING }),
  },
  {
    type: 'right-center',
    cursor: 'ew-resize',
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y + el.height / 2 }),
  },
  {
    type: 'bottom-right',
    cursor: 'nwse-resize',
    getPosition: (el) => ({ x: el.x + el.width + SELECTION_PADDING, y: el.y + el.height + SELECTION_PADDING }),
  },
  {
    type: 'bottom-center',
    cursor: 'ns-resize',
    getPosition: (el) => ({ x: el.x + el.width / 2, y: el.y + el.height + SELECTION_PADDING }),
  },
  {
    type: 'bottom-left',
    cursor: 'nesw-resize',
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y + el.height + SELECTION_PADDING }),
  },
  {
    type: 'left-center',
    cursor: 'ew-resize',
    getPosition: (el) => ({ x: el.x - SELECTION_PADDING, y: el.y + el.height / 2 }),
  },
];

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ element, onPointerDown }) => {
  return (
    <>
      {HANDLES.map((handle) => {
        const pos = handle.getPosition(element);
        return (
          <rect
            key={handle.type}
            data-resize-handle={handle.type}
            data-resize-target={element.id}
            x={pos.x - HANDLE_SIZE / 2}
            y={pos.y - HANDLE_SIZE / 2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            fill={COLORS.white}
            stroke={COLORS.selectionBorder}
            strokeWidth={1}
            rx={1}
            ry={1}
            style={{ cursor: handle.cursor }}
            onPointerDown={(e) => {
              // Allow bubbling so the canvas interaction hook can manage drag state.
              onPointerDown?.(handle.type, e);
            }}
          />
        );
      })}
    </>
  );
};

export default React.memo(ResizeHandles);
