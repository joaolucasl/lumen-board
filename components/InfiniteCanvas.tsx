
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { SceneState, CanvasElement, Connection, ViewState, Tool, InfiniteCanvasRef } from '../types';
import { INITIAL_STATE, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, GRID_SIZE, DEFAULT_ELEMENT_WIDTH, DEFAULT_ELEMENT_HEIGHT } from '../constants';
import SVGCanvas from './SVGCanvas';
import GridLayer from './GridLayer';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import ZoomControls from './ZoomControls';

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

  const [scene, setScene] = useState<SceneState>(initialData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>('pointer');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with initialData if provided externally
  useEffect(() => {
    if (initialData) setScene(initialData);
  }, [initialData]);

  const updateScene = useCallback((updater: (prev: SceneState) => SceneState) => {
    setScene(prev => {
      const next = updater(prev);
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    exportJson: () => scene,
    importJson: (data: SceneState) => updateScene(() => data),
    zoomIn: (amount = ZOOM_STEP) => setScene(s => ({ ...s, view: { ...s.view, zoom: Math.min(MAX_ZOOM, s.view.zoom * amount) } })),
    zoomOut: (amount = ZOOM_STEP) => setScene(s => ({ ...s, view: { ...s.view, zoom: Math.max(MIN_ZOOM, s.view.zoom / amount) } })),
    fitView: () => {
      // Basic implementation: reset to center
      setScene(s => ({ ...s, view: { x: 0, y: 0, zoom: 1 } }));
    },
    selectElements: (ids: string[]) => setSelectedIds(ids)
  }), [scene, updateScene]);

  const handleSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }, [onSelectionChange]);


  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#fafafa] select-none ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
    >
      {config.grid !== false && <GridLayer view={scene.view} />}
      
      <SVGCanvas 
        scene={scene}
        selectedIds={selectedIds}
        activeTool={activeTool}
        onUpdateScene={updateScene}
        onSelect={handleSelection}
        customComponents={components}
        snapToGrid={config.snapToGrid}
      />

      {uiConfig.showToolbar && (
        <Toolbar 
          activeTool={activeTool} 
          onToolSelect={setActiveTool} 
        />
      )}

      {uiConfig.showZoomControls && (
        <ZoomControls 
          zoom={scene.view.zoom} 
          onZoomIn={() => (ref as any).current?.zoomIn()} 
          onZoomOut={() => (ref as any).current?.zoomOut()}
          onFitView={() => (ref as any).current?.fitView()}
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
