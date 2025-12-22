
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
import { SceneState, CanvasElement, Tool, InfiniteCanvasRef } from '../../types';
import { INITIAL_STATE } from '../../constants';
import { useInfiniteCanvasApi } from '../../hooks/useInfiniteCanvasApi';
import { deleteConnectionsForElements, deleteElementsFromMap } from '../../utils/scene';
import SVGCanvas from './SVGCanvas';
import GridLayer from '../layers/GridLayer';
import Toolbar from '../ui/Toolbar';
import PropertiesPanel from '../ui/PropertiesPanel';
import ZoomControls from '../ui/ZoomControls';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Props for the InfiniteCanvas component.
 */
interface InfiniteCanvasProps {
  /**
   * Initial state of the scene (elements, connections, view).
   * @default INITIAL_STATE
   */
  initialData?: SceneState;
  
  /**
   * Configuration options for the canvas behavior and appearance.
   */
  config?: {
    /**
     * If true, the canvas is in read-only mode (no editing allowed).
     * @default false
     */
    readonly?: boolean;
    /**
     * Whether to show the background grid.
     * @default true
     */
    grid?: boolean;
    /**
     * Whether to snap elements to the grid when moving/resizing.
     * @default false
     */
    snapToGrid?: boolean;
    /**
     * UI theme (not fully implemented yet).
     * @default 'light'
     */
    theme?: 'light' | 'dark';
    /**
     * Whether to keep the selected tool active after use (instead of switching back to pointer).
     * @default false
     */
    keepToolActive?: boolean;
  };

  /**
   * Configuration for the built-in UI components.
   */
  uiConfig?: {
    /**
     * Whether to show the toolbar.
     * @default true
     */
    showToolbar?: boolean;
    /**
     * Whether to show the zoom controls.
     * @default true
     */
    showZoomControls?: boolean;
    /**
     * Whether to show the properties panel when elements are selected.
     * @default true
     */
    showPropertiesPanel?: boolean;
  };

  /**
   * Custom React components to render for specific element types.
   * Key matches the `componentType` of the element.
   */
  components?: Record<string, React.FC<any>>;

  /**
   * Callback fired when the scene state changes (elements, connections, etc.).
   */
  onChange?: (data: SceneState) => void;

  /**
   * Callback fired when the selection changes.
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Callback fired when a new element is added.
   */
  onElementAdd?: (element: CanvasElement) => void;
}

/**
 * The main InfiniteCanvas component.
 * 
 * Renders an interactive infinite canvas with support for:
 * - Panning and zooming
 * - Creating, moving, resizing, and deleting elements
 * - Connecting elements
 * - Undo/redo (via state management)
 * - Custom components
 * 
 * This component exposes an imperative API via a ref.
 * 
 * @example
 * ```tsx
 * const ref = useRef<InfiniteCanvasRef>(null);
 * 
 * <InfiniteCanvas
 *   ref={ref}
 *   initialData={myScene}
 *   onChange={setMyScene}
 * />
 * ```
 */
const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>((props, ref) => {
  const { 
    initialData = INITIAL_STATE, 
    config = {}, 
    uiConfig = { showToolbar: true, showZoomControls: true, showPropertiesPanel: true },
    components = {},
    onChange,
    onSelectionChange
  } = props;

  // Proper React state management
  const [scene, setScene] = useState<SceneState>(initialData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pointer');
  // Removed internal keepToolActive state, now derived from config
  const keepToolActive = config.keepToolActive ?? false;

  // Keep refs in sync for imperative API methods that need current values
  const sceneRef = useRef<SceneState>(scene);
  const selectedIdsRef = useRef<string[]>(selectedIds);
  sceneRef.current = scene;
  selectedIdsRef.current = selectedIds;

  // Sync with initialData if provided externally
  useEffect(() => {
    let isMounted = true;
    if (initialData && isMounted) {
      setScene(initialData);
    }
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const updateScene = useCallback((updater: (prev: SceneState) => SceneState) => {
    setScene((prev) => {
      const nextScene = updater(prev);
      return nextScene;
    });
    // Note: onChange is called via useEffect to ensure we have the latest state
    return scene; // Return current scene for immediate use
  }, []);

  const handleSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }, [onSelectionChange]);

  // Call onChange whenever scene changes
  useEffect(() => {
    onChange?.(scene);
  }, [scene, onChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (config.readonly) return;
      
      // Check if we're in an input field
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (active as any).isContentEditable) return;
      }

      // Handle Escape key - return to pointer tool and clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveTool('pointer');
        handleSelection([]);
        return;
      }

      // Handle Delete/Backspace keys - delete selected elements
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;

      const ids = selectedIdsRef.current;
      if (ids.length === 0) return;

      e.preventDefault();

      updateScene((prev) => {
        const selectedElements = ids.filter((id) => Boolean(prev.elements[id]));
        const selectedConnections = ids.filter((id) => prev.connections.some((c) => c.id === id));

        const nextElements = selectedElements.length > 0 ? deleteElementsFromMap(prev.elements, selectedElements) : prev.elements;

        let nextConnections = prev.connections;
        if (selectedElements.length > 0) {
          nextConnections = deleteConnectionsForElements(nextConnections, selectedElements);
        }
        if (selectedConnections.length > 0) {
          const idSet = new Set(selectedConnections);
          nextConnections = nextConnections.filter((c) => !idSet.has(c.id));
        }

        return { ...prev, elements: nextElements, connections: nextConnections };
      });

      handleSelection([]);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [config.readonly, handleSelection, updateScene]);

  const api = useInfiniteCanvasApi({
    sceneRef,
    selectedIdsRef,
    containerRef,
    updateScene,
    handleSelection,
  });

  useImperativeHandle(ref, () => api, [api]);

  return (
    <div 
      ref={containerRef}
      className={`lb-canvas-container ${activeTool === 'hand' ? 'lb-canvas-container--hand' : 'lb-canvas-container--default'}`}
    >
      {config.grid !== false && <GridLayer view={scene.view} />}
      
      <ErrorBoundary fallback={
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#ef4444',
          backgroundColor: '#fef2f2' 
        }}>
          <div>
            <h3>Something went wrong</h3>
            <p>The canvas encountered an error and cannot be displayed.</p>
          </div>
        </div>
      }>
        <SVGCanvas 
          scene={scene}
          selectedIds={selectedIds}
          activeTool={activeTool}
          keepToolActive={keepToolActive}
          onUpdateScene={updateScene}
          onSelect={handleSelection}
          customComponents={components}
          snapToGrid={config.snapToGrid}
          onToolChange={setActiveTool}
        />
      </ErrorBoundary>

      {uiConfig.showToolbar && (
        <Toolbar 
          activeTool={activeTool} 
          onToolSelect={setActiveTool} 
          keepToolActive={keepToolActive}
          // Removing internal toggle for now as it's controlled via config
          onToggleKeepToolActive={() => {}}
        />
      )}

      {uiConfig.showZoomControls && (
        <ZoomControls 
          zoom={scene.view.zoom} 
          onZoomIn={() => api.zoomIn()} 
          onZoomOut={() => api.zoomOut()}
          onFitView={() => api.fitView()}
        />
      )}

      {uiConfig.showPropertiesPanel && selectedIds.length > 0 && (
        <PropertiesPanel 
          elements={selectedIds.map(id => scene.elements[id]).filter(Boolean)}
          onUpdate={(updates) => {
            updateScene(prev => {
              const newElements = { ...prev.elements };
              selectedIds.forEach(id => {
                if (newElements[id]) {
                  newElements[id] = { ...newElements[id], ...updates };
                }
              });
              return { ...prev, elements: newElements };
            });
          }}
        />
      )}

    </div>
  );
});

export default InfiniteCanvas;
