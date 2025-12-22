
/**
 * Supported element types in the canvas.
 */
export type ElementType = 'rectangle' | 'ellipse' | 'text' | 'custom' | 'diamond';

/**
 * Available resize handle positions.
 */
export type ResizeHandleType =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Represents the current view state of the canvas (position and zoom).
 */
export interface ViewState {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

/**
 * Represents a single element on the canvas.
 */
export interface CanvasElement {
  readonly id: string;
  readonly type: ElementType;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
  readonly opacity: number;
  readonly locked: boolean;
  readonly backgroundColor?: string;
  readonly strokeColor?: string;
  readonly strokeWidth?: number;
  readonly text?: string;
  readonly componentType?: string;
  readonly props?: Record<string, unknown>;
}

/**
 * Connection handle positions.
 */
export type HandleType = 'top' | 'right' | 'bottom' | 'left';

/**
 * Represents a connection between two elements.
 */
export interface Connection {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly sourceHandle?: HandleType;
  readonly targetHandle?: HandleType;
  readonly style?: {
    readonly strokeColor: string;
    readonly width: number;
    readonly curvature: number;
  };
}

/**
 * Complete state of the scene including elements, connections, and view.
 */
export interface SceneState {
  readonly version: number;
  readonly view: ViewState;
  readonly elements: Record<string, CanvasElement>;
  readonly connections: Connection[];
}

/**
 * Available tools for interaction.
 */
export type Tool = 'pointer' | 'hand' | 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'connection' | 'eraser';

/**
 * Options for creating a new element.
 */
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
  props?: Record<string, unknown>;
  locked?: boolean;
  id?: string;
}

/**
 * Options for creating a new connection.
 */
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

/**
 * Imperative API for controlling the InfiniteCanvas.
 */
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
  updateElement: (id: string, updates: Partial<CanvasElement>) => CanvasElement | undefined;
  updateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => CanvasElement[];
  deleteElement: (id: string) => boolean;
  deleteElements: (ids: string[]) => boolean;
  getElement: (id: string) => CanvasElement | undefined;
  getElements: (ids?: string[]) => CanvasElement[];

  // EditorAPI - Connections
  createConnection: (options: CreateConnectionOptions) => Connection;
  createConnections: (options: CreateConnectionOptions[]) => Connection[];
  updateConnection: (id: string, updates: Partial<Connection>) => Connection | undefined;
  deleteConnection: (id: string) => boolean;
  deleteConnections: (ids: string[]) => boolean;
  getConnection: (id: string) => Connection | undefined;
  getConnections: (elementId?: string) => Connection[];
  getConnectionsBetween: (sourceId: string, targetId: string) => Connection[];

  // EditorAPI - Viewport
  getViewportCenter: () => { x: number; y: number };
  getViewportBounds: () => { x: number; y: number; width: number; height: number };
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  panTo: (x: number, y: number) => void;
  panToElement: (id: string) => boolean;
  setZoom: (level: number, focalPoint?: { x: number; y: number }) => void;

  // EditorAPI - Selection
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedIds: () => string[];
  focusElement: (id: string, options?: { zoom?: number }) => boolean;
  focusElements: (ids: string[], options?: { padding?: number }) => boolean;
}
