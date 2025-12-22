
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

interface InfiniteCanvasProps {
  initialData?: SceneState;
  config?: {
    readonly?: boolean;
    grid?: boolean;
    snapToGrid?: boolean;
    theme?: 'light' | 'dark';
  };
  uiConfig?: {
    showToolbar?: boolean;
    showZoomControls?: boolean;
    showPropertiesPanel?: boolean;
  };
  components?: Record<string, React.FC<any>>;
  onChange?: (data: SceneState) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onElementAdd?: (element: CanvasElement) => void;
}

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
  const [keepToolActive, setKeepToolActive] = useState(false);

  // Keep refs in sync for imperative API methods that need current values
  const sceneRef = useRef<SceneState>(scene);
  const selectedIdsRef = useRef<string[]>(selectedIds);
  sceneRef.current = scene;
  selectedIdsRef.current = selectedIds;

  // Sync with initialData if provided externally
  useEffect(() => {
    if (initialData) {
      setScene(initialData);
    }
  }, [initialData]);

  const updateScene = useCallback((updater: (prev: SceneState) => SceneState) => {
    let nextScene: SceneState;
    setScene((prev) => {
      nextScene = updater(prev);
      return nextScene;
    });
    // Note: onChange is called with the new state, but due to React's batching,
    // the state may not be immediately available via ref after this call
    onChange?.(nextScene!);
    return nextScene!;
  }, [onChange]);

  const handleSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }, [onSelectionChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (config.readonly) return;
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;

      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (active as any).isContentEditable) return;
      }

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

      {uiConfig.showToolbar && (
        <Toolbar 
          activeTool={activeTool} 
          onToolSelect={setActiveTool} 
          keepToolActive={keepToolActive}
          onToggleKeepToolActive={() => setKeepToolActive((v) => !v)}
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
