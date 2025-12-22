
/**
 * Supported element types in the canvas.
 * - `rectangle`: A rectangular shape.
 * - `ellipse`: An elliptical shape.
 * - `diamond`: A diamond shape.
 * - `text`: A text element.
 * - `custom`: A custom component rendered via the `components` prop.
 */
export type ElementType = 'rectangle' | 'ellipse' | 'text' | 'custom' | 'diamond';

/**
 * Available resize handle positions on a selected element.
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
  /** The horizontal offset of the viewport in pixels. */
  readonly x: number;
  /** The vertical offset of the viewport in pixels. */
  readonly y: number;
  /** The current zoom level (scale factor). 1 is 100%. */
  readonly zoom: number;
}

/**
 * Represents a single element on the canvas.
 */
export interface CanvasElement {
  /** Unique identifier for the element. */
  readonly id: string;
  /** The type of the element. */
  readonly type: ElementType;
  /** X coordinate of the element's top-left corner in world space. */
  readonly x: number;
  /** Y coordinate of the element's top-left corner in world space. */
  readonly y: number;
  /** Width of the element in pixels. */
  readonly width: number;
  /** Height of the element in pixels. */
  readonly height: number;
  /** Rotation of the element in degrees. */
  readonly rotation: number;
  /** Opacity of the element (0 to 1). */
  readonly opacity: number;
  /** Whether the element is locked and cannot be selected or moved. */
  readonly locked: boolean;
  /** Background color of the element (CSS color string). */
  readonly backgroundColor?: string;
  /** Stroke/Border color of the element (CSS color string). */
  readonly strokeColor?: string;
  /** Width of the stroke/border in pixels. */
  readonly strokeWidth?: number;
  /** Text content for text elements or labeled shapes. */
  readonly text?: string;
  /** Component key for custom elements (matches keys in `components` prop). */
  readonly componentType?: string;
  /** Custom props to pass to the custom component. */
  readonly props?: Record<string, unknown>;
}

/**
 * Connection handle positions on an element.
 */
export type HandleType = 'top' | 'right' | 'bottom' | 'left';

/**
 * Represents a connection between two elements.
 */
export interface Connection {
  /** Unique identifier for the connection. */
  readonly id: string;
  /** ID of the source element. */
  readonly sourceId: string;
  /** ID of the target element. */
  readonly targetId: string;
  /** Specific handle on the source element, if any. */
  readonly sourceHandle?: HandleType;
  /** Specific handle on the target element, if any. */
  readonly targetHandle?: HandleType;
  /** Styling options for the connection. */
  readonly style?: {
    /** Color of the connection line. */
    readonly strokeColor: string;
    /** Width of the connection line in pixels. */
    readonly width: number;
    /** Curvature of the connection line (0 to 1). */
    readonly curvature: number;
  };
}

/**
 * Complete state of the scene including elements, connections, and view.
 */
export interface SceneState {
  /** Schema version number. */
  readonly version: number;
  /** Current viewport state. */
  readonly view: ViewState;
  /** Map of elements by ID. */
  readonly elements: Record<string, CanvasElement>;
  /** List of connections. */
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
  /** Type of element to create. */
  type: ElementType;
  /** X coordinate (defaults to center of viewport). */
  x?: number;
  /** Y coordinate (defaults to center of viewport). */
  y?: number;
  /** Width (defaults based on type). */
  width?: number;
  /** Height (defaults based on type). */
  height?: number;
  /** Background color. */
  backgroundColor?: string;
  /** Stroke color. */
  strokeColor?: string;
  /** Stroke width. */
  strokeWidth?: number;
  /** Opacity (0-1). */
  opacity?: number;
  /** Rotation in degrees. */
  rotation?: number;
  /** Text content. */
  text?: string;
  /** Component type for custom elements. */
  componentType?: string;
  /** Props for custom elements. */
  props?: Record<string, unknown>;
  /** Whether the element is locked initially. */
  locked?: boolean;
  /** Optional specific ID (generated if not provided). */
  id?: string;
}

/**
 * Options for creating a new connection.
 */
export interface CreateConnectionOptions {
  /** ID of the source element. */
  sourceId: string;
  /** ID of the target element. */
  targetId: string;
  /** Source handle position. Use 'auto' to let the library decide. */
  sourceHandle?: HandleType | 'auto';
  /** Target handle position. Use 'auto' to let the library decide. */
  targetHandle?: HandleType | 'auto';
  /** Styling options. */
  style?: {
    strokeColor?: string;
    width?: number;
    curvature?: number;
  };
  /** Optional specific ID (generated if not provided). */
  id?: string;
}

/**
 * Imperative API for controlling the InfiniteCanvas.
 */
export interface InfiniteCanvasRef {
  /**
   * Exports the current scene state as a JSON-serializable object.
   * @returns {SceneState} The current scene state.
   */
  exportJson: () => SceneState;
  
  /**
   * Imports a scene state, replacing the current scene.
   * @param {SceneState} data - The scene state to import.
   */
  importJson: (data: SceneState) => void;
  
  /**
   * Zooms the canvas in by a step.
   * @param {number} [amount] - Optional zoom factor multiplier.
   */
  zoomIn: (amount?: number) => void;
  
  /**
   * Zooms the canvas out by a step.
   * @param {number} [amount] - Optional zoom factor divisor.
   */
  zoomOut: (amount?: number) => void;
  
  /**
   * Resets the view to center at (0,0) with zoom 1.
   */
  fitView: () => void;
  
  /**
   * Selects the specified elements.
   * @param {string[]} ids - Array of element IDs to select.
   */
  selectElements: (ids: string[]) => void;

  // EditorAPI - Elements
  
  /**
   * Creates a new element on the canvas.
   * @param {CreateElementOptions} options - Configuration for the new element.
   * @returns {CanvasElement} The created element.
   */
  createElement: (options: CreateElementOptions) => CanvasElement;
  
  /**
   * Creates multiple elements in a batch.
   * @param {CreateElementOptions[]} options - Array of element configurations.
   * @returns {CanvasElement[]} Array of created elements.
   */
  createElements: (options: CreateElementOptions[]) => CanvasElement[];
  
  /**
   * Updates an existing element.
   * @param {string} id - The ID of the element to update.
   * @param {Partial<CanvasElement>} updates - Partial object with properties to update.
   * @returns {CanvasElement | undefined} The updated element, or undefined if not found.
   */
  updateElement: (id: string, updates: Partial<CanvasElement>) => CanvasElement | undefined;
  
  /**
   * Updates multiple elements in a batch.
   * @param {Array<{ id: string } & Partial<CanvasElement>>} updates - Array of updates, each containing the element ID.
   * @returns {CanvasElement[]} Array of updated elements.
   */
  updateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => CanvasElement[];
  
  /**
   * Deletes a single element.
   * @param {string} id - ID of the element to delete.
   * @returns {boolean} True if the element was deleted, false otherwise.
   */
  deleteElement: (id: string) => boolean;
  
  /**
   * Deletes multiple elements.
   * @param {string[]} ids - IDs of elements to delete.
   * @returns {boolean} True if any elements were deleted.
   */
  deleteElements: (ids: string[]) => boolean;
  
  /**
   * Retrieves an element by ID.
   * @param {string} id - ID of the element.
   * @returns {CanvasElement | undefined} The element, or undefined if not found.
   */
  getElement: (id: string) => CanvasElement | undefined;
  
  /**
   * Retrieves multiple elements.
   * @param {string[]} [ids] - Optional array of IDs. If not provided, returns all elements.
   * @returns {CanvasElement[]} Array of elements.
   */
  getElements: (ids?: string[]) => CanvasElement[];

  // EditorAPI - Connections
  
  /**
   * Creates a new connection between elements.
   * @param {CreateConnectionOptions} options - Configuration for the connection.
   * @returns {Connection} The created connection.
   */
  createConnection: (options: CreateConnectionOptions) => Connection;
  
  /**
   * Creates multiple connections in a batch.
   * @param {CreateConnectionOptions[]} options - Array of connection configurations.
   * @returns {Connection[]} Array of created connections.
   */
  createConnections: (options: CreateConnectionOptions[]) => Connection[];
  
  /**
   * Updates an existing connection.
   * @param {string} id - ID of the connection to update.
   * @param {Partial<Connection>} updates - Properties to update.
   * @returns {Connection | undefined} The updated connection, or undefined if not found.
   */
  updateConnection: (id: string, updates: Partial<Connection>) => Connection | undefined;
  
  /**
   * Deletes a connection.
   * @param {string} id - ID of the connection to delete.
   * @returns {boolean} True if deleted, false otherwise.
   */
  deleteConnection: (id: string) => boolean;
  
  /**
   * Deletes multiple connections.
   * @param {string[]} ids - IDs of connections to delete.
   * @returns {boolean} True if any connections were deleted.
   */
  deleteConnections: (ids: string[]) => boolean;
  
  /**
   * Retrieves a connection by ID.
   * @param {string} id - ID of the connection.
   * @returns {Connection | undefined} The connection, or undefined if not found.
   */
  getConnection: (id: string) => Connection | undefined;
  
  /**
   * Retrieves connections.
   * @param {string} [elementId] - Optional element ID to filter connections connected to this element.
   * @returns {Connection[]} Array of connections.
   */
  getConnections: (elementId?: string) => Connection[];
  
  /**
   * Finds connections between two specific elements.
   * @param {string} sourceId - ID of the source element.
   * @param {string} targetId - ID of the target element.
   * @returns {Connection[]} Array of matching connections.
   */
  getConnectionsBetween: (sourceId: string, targetId: string) => Connection[];

  // EditorAPI - Viewport
  
  /**
   * Gets the center point of the viewport in world coordinates.
   * @returns {{ x: number; y: number }} The center point.
   */
  getViewportCenter: () => { x: number; y: number };
  
  /**
   * Gets the current visible bounds of the viewport in world coordinates.
   * @returns {{ x: number; y: number; width: number; height: number }} The bounds rectangle.
   */
  getViewportBounds: () => { x: number; y: number; width: number; height: number };
  
  /**
   * Converts screen coordinates (pixels relative to the canvas container) to world coordinates.
   * @param {number} screenX - X coordinate in pixels.
   * @param {number} screenY - Y coordinate in pixels.
   * @returns {{ x: number; y: number }} World coordinates.
   */
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  
  /**
   * Converts world coordinates to screen coordinates.
   * @param {number} worldX - X coordinate in the world.
   * @param {number} worldY - Y coordinate in the world.
   * @returns {{ x: number; y: number }} Screen coordinates.
   */
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  
  /**
   * Pans the viewport to a specific position.
   * @param {number} x - Target center X coordinate.
   * @param {number} y - Target center Y coordinate.
   */
  panTo: (x: number, y: number) => void;
  
  /**
   * Pans the viewport to center on a specific element.
   * @param {string} id - ID of the element.
   * @returns {boolean} True if element was found and panned to.
   */
  panToElement: (id: string) => boolean;
  
  /**
   * Sets the zoom level directly.
   * @param {number} level - New zoom level.
   * @param {{ x: number; y: number }} [focalPoint] - Optional focal point for the zoom.
   */
  setZoom: (level: number, focalPoint?: { x: number; y: number }) => void;

  // EditorAPI - Selection
  
  /**
   * Selects all elements on the canvas.
   */
  selectAll: () => void;
  
  /**
   * Deselects all elements.
   */
  clearSelection: () => void;
  
  /**
   * Gets the IDs of currently selected elements.
   * @returns {string[]} Array of selected element IDs.
   */
  getSelectedIds: () => string[];
  
  /**
   * Focuses the view on a specific element with optional zoom.
   * @param {string} id - Element ID.
   * @param {{ zoom?: number }} [options] - Options.
   * @returns {boolean} True if successful.
   */
  focusElement: (id: string, options?: { zoom?: number }) => boolean;
  
  /**
   * Focuses the view to fit multiple elements.
   * @param {string[]} ids - Element IDs.
   * @param {{ padding?: number }} [options] - Options (padding in pixels).
   * @returns {boolean} True if successful.
   */
  focusElements: (ids: string[], options?: { padding?: number }) => boolean;
}
