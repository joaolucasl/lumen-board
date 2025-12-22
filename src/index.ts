/**
 * The main component for rendering the infinite canvas.
 * Provides a React component that handles panning, zooming, and element interaction.
 */
export { default as InfiniteCanvas } from './components/canvas/InfiniteCanvas';

/**
 * Type definitions for the Lumen Board library.
 * Includes interfaces for the imperative API, scene state, elements, and connections.
 */
export type {
  /**
   * Ref object exposing imperative methods to control the canvas.
   */
  InfiniteCanvasRef,
  /**
   * Represents the complete state of the canvas scene (view, elements, connections).
   */
  SceneState,
  /**
   * Represents a single element (node) on the canvas.
   */
  CanvasElement,
  /**
   * Represents a connection (edge) between two elements.
   */
  Connection,
  /**
   * Options for creating a new element programmatically.
   */
  CreateElementOptions,
  /**
   * Options for creating a new connection programmatically.
   */
  CreateConnectionOptions,
  /**
   * Union type of all supported element types.
   */
  ElementType,
  /**
   * Union type of all available tools.
   */
  Tool,
  /**
   * Represents the viewport state (position and zoom).
   */
  ViewState,
  /**
   * Union type of available connection handle positions.
   */
  HandleType,
} from './types';
