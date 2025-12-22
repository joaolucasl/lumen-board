import { GRID_SIZE, MAX_ELEMENT_SIZE, MIN_ELEMENT_SIZE } from '../constants';
import type { ResizeHandleType } from '../types';

export const clampSize = (value: number) => Math.min(Math.max(MIN_ELEMENT_SIZE, value), MAX_ELEMENT_SIZE);

export const snapValue = (value: number, enabled: boolean) =>
  enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

type ResizeDelta = { dx: number; dy: number };
type ResizeOptions = { snapToGrid: boolean };

export function computeResize(
  handle: ResizeHandleType,
  initial: { x: number; y: number; width: number; height: number },
  delta: ResizeDelta,
  options: ResizeOptions
): { x: number; y: number; width: number; height: number } {
  const { dx, dy } = delta;
  const { snapToGrid } = options;
  const aspect = initial.height === 0 ? 1 : initial.width / initial.height;

  let x = initial.x;
  let y = initial.y;
  let width = initial.width;
  let height = initial.height;

  switch (handle) {
    case 'top-left': {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height - dy);
      x = initial.x + (initial.width - width);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'top-right': {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'bottom-left': {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height + dy);
      x = initial.x + (initial.width - width);
      break;
    }
    case 'bottom-right': {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height + dy);
      break;
    }
    case 'left-center': {
      width = clampSize(initial.width - dx);
      x = initial.x + (initial.width - width);
      break;
    }
    case 'right-center': {
      width = clampSize(initial.width + dx);
      break;
    }
    case 'top-center': {
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'bottom-center': {
      height = clampSize(initial.height + dy);
      break;
    }
  }

  if (
    handle === 'top-left' ||
    handle === 'top-right' ||
    handle === 'bottom-left' ||
    handle === 'bottom-right'
  ) {
    const targetHeight = width / aspect;
    const targetWidth = height * aspect;
    const lockToWidth = Math.abs(width - initial.width) >= Math.abs(height - initial.height);
    if (lockToWidth) {
      height = clampSize(targetHeight);
    } else {
      width = clampSize(targetWidth);
    }
    switch (handle) {
      case 'top-left':
        x = initial.x + (initial.width - width);
        y = initial.y + (initial.height - height);
        break;
      case 'top-right':
        y = initial.y + (initial.height - height);
        break;
      case 'bottom-left':
        x = initial.x + (initial.width - width);
        break;
      case 'bottom-right':
        break;
    }
  }

  const snappedX = snapValue(x, snapToGrid);
  const snappedY = snapValue(y, snapToGrid);
  const snappedWidth = snapValue(width, snapToGrid);
  const snappedHeight = snapValue(height, snapToGrid);

  return {
    x: snappedX,
    y: snappedY,
    width: snappedWidth,
    height: snappedHeight,
  };
}
