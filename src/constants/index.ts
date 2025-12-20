
import { SceneState } from '../types';

export const INITIAL_STATE: SceneState = {
  version: 1,
  view: { x: 0, y: 0, zoom: 1 },
  elements: {},
  connections: [],
};

export const GRID_SIZE = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 1.05;
export const WHEEL_ZOOM_STEP = 0.001;

export const DEFAULT_ELEMENT_WIDTH = 150;
export const DEFAULT_ELEMENT_HEIGHT = 100;
export const DEFAULT_TEXT_WIDTH = 200;
export const DEFAULT_TEXT_HEIGHT = 40;
export const DEFAULT_CUSTOM_WIDTH = 180;
export const DEFAULT_CUSTOM_HEIGHT = 120;
export const MIN_ELEMENT_SIZE = 20;

export const DEFAULTS = {
  backgroundColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  opacity: 1,
  rotation: 0,
  connectionWidth: 2,
  connectionCurvature: 0.5,
};
