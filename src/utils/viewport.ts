import { ViewState } from '../types';

export type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

export function screenToWorldPoint(
  clientX: number,
  clientY: number,
  rect: RectLike,
  view: ViewState
): { x: number; y: number } {
  return {
    x: (clientX - rect.left - view.x) / view.zoom,
    y: (clientY - rect.top - view.y) / view.zoom,
  };
}

export function worldToScreenPoint(
  worldX: number,
  worldY: number,
  rect: RectLike,
  view: ViewState
): { x: number; y: number } {
  return {
    x: worldX * view.zoom + view.x + rect.left,
    y: worldY * view.zoom + view.y + rect.top,
  };
}

export function clampZoom(level: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, level));
}
