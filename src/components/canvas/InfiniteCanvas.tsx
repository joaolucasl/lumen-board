
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { SceneState, CanvasElement, Tool, InfiniteCanvasRef } from '../../types';
import { INITIAL_STATE } from '../../constants';
import { useInfiniteCanvasApi } from '../../hooks/useInfiniteCanvasApi';
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

  // Use refs for state to support synchronous imperative API
  const sceneRef = useRef<SceneState>(initialData);
  const selectedIdsRef = useRef<string[]>([]);
  const [, setTick] = useState(0); // Force render
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pointer');

  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Sync with initialData if provided externally
  useEffect(() => {
    if (initialData) {
      sceneRef.current = initialData;
      forceUpdate();
    }
  }, [initialData, forceUpdate]);

  const updateScene = useCallback((updater: (prev: SceneState) => SceneState) => {
    const next = updater(sceneRef.current);
    sceneRef.current = next;
    onChange?.(next);
    forceUpdate();
    return next;
  }, [onChange, forceUpdate]);

  const handleSelection = useCallback((ids: string[]) => {
    selectedIdsRef.current = ids;
    onSelectionChange?.(ids);
    forceUpdate();
  }, [onSelectionChange, forceUpdate]);

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
      className={`relative w-full h-full overflow-hidden bg-[#fafafa] select-none ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
    >
      {config.grid !== false && <GridLayer view={sceneRef.current.view} />}
      
      <SVGCanvas 
        scene={sceneRef.current}
        selectedIds={selectedIdsRef.current}
        activeTool={activeTool}
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
        />
      )}

      {uiConfig.showZoomControls && (
        <ZoomControls 
          zoom={sceneRef.current.view.zoom} 
          onZoomIn={() => api.zoomIn()} 
          onZoomOut={() => api.zoomOut()}
          onFitView={() => api.fitView()}
        />
      )}

      {uiConfig.showPropertiesPanel && selectedIdsRef.current.length > 0 && (
        <PropertiesPanel 
          elements={selectedIdsRef.current.map(id => sceneRef.current.elements[id]).filter(Boolean)}
          onUpdate={(updates) => {
            updateScene(prev => {
              const newElements = { ...prev.elements };
              selectedIdsRef.current.forEach(id => {
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
