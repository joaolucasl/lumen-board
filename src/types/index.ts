
export type ElementType = 'rectangle' | 'ellipse' | 'text' | 'custom' | 'diamond';
export type ResizeHandleType =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  text?: string;
  componentType?: string;
  props?: Record<string, any>;
}

export type HandleType = 'top' | 'right' | 'bottom' | 'left';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: HandleType;
  targetHandle?: HandleType;
  style?: {
    strokeColor: string;
    width: number;
    curvature: number;
  };
}

export interface SceneState {
  version: number;
  view: ViewState;
  elements: Record<string, CanvasElement>;
  connections: Connection[];
}

export type Tool = 'pointer' | 'hand' | 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'connection' | 'eraser';

export interface CreateElementOptions {
  type: ElementType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  text?: string;
  componentType?: string;
  props?: Record<string, any>;
  locked?: boolean;
  id?: string;
}

export interface CreateConnectionOptions {
  sourceId: string;
  targetId: string;
  sourceHandle?: HandleType | 'auto';
  targetHandle?: HandleType | 'auto';
  style?: {
    strokeColor?: string;
    width?: number;
    curvature?: number;
  };
  id?: string;
}

export interface InfiniteCanvasRef {
  exportJson: () => SceneState;
  importJson: (data: SceneState) => void;
  zoomIn: (amount?: number) => void;
  zoomOut: (amount?: number) => void;
  fitView: () => void;
  selectElements: (ids: string[]) => void;

  // EditorAPI - Elements
  createElement: (options: CreateElementOptions) => CanvasElement;
  createElements: (options: CreateElementOptions[]) => CanvasElement[];
  updateElement: (id: string, updates: Partial<CanvasElement>) => CanvasElement;
  updateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => CanvasElement[];
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  getElement: (id: string) => CanvasElement | undefined;
  getElements: (ids?: string[]) => CanvasElement[];

  // EditorAPI - Connections
  createConnection: (options: CreateConnectionOptions) => Connection;
  createConnections: (options: CreateConnectionOptions[]) => Connection[];
  updateConnection: (id: string, updates: Partial<Connection>) => Connection;
  deleteConnection: (id: string) => void;
  deleteConnections: (ids: string[]) => void;
  getConnection: (id: string) => Connection | undefined;
  getConnections: (elementId?: string) => Connection[];
  getConnectionsBetween: (sourceId: string, targetId: string) => Connection[];

  // EditorAPI - Viewport
  getViewportCenter: () => { x: number; y: number };
  getViewportBounds: () => { x: number; y: number; width: number; height: number };
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  panTo: (x: number, y: number, animate?: boolean) => void;
  panToElement: (id: string, animate?: boolean) => void;
  setZoom: (level: number, focalPoint?: { x: number; y: number }) => void;

  // EditorAPI - Selection
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedIds: () => string[];
  focusElement: (id: string, options?: { zoom?: number; animate?: boolean }) => void;
  focusElements: (ids: string[], options?: { padding?: number; animate?: boolean }) => void;
}
