
export type ElementType = 'rectangle' | 'ellipse' | 'text' | 'custom' | 'diamond';

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

export interface InfiniteCanvasRef {
  exportJson: () => SceneState;
  importJson: (data: SceneState) => void;
  zoomIn: (amount?: number) => void;
  zoomOut: (amount?: number) => void;
  fitView: () => void;
  selectElements: (ids: string[]) => void;
}
