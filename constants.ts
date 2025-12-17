
import { SceneState } from './types';

export const INITIAL_STATE: SceneState = {
  version: 1,
  view: { x: 0, y: 0, zoom: 1 },
  elements: {},
  connections: [],
};

export const GRID_SIZE = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 1.1;

export const DEFAULT_ELEMENT_WIDTH = 150;
export const DEFAULT_ELEMENT_HEIGHT = 100;

export const COLORS = {
  primary: '#3b82f6',
  white: '#ffffff',
  gray: '#f3f4f6',
  darkGray: '#4b5563',
  background: '#fafafa',
  border: '#e5e7eb',
  selection: 'rgba(59, 130, 246, 0.1)',
  selectionBorder: '#3b82f6',
};
