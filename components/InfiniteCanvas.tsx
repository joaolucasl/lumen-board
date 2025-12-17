
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { SceneState, CanvasElement, Connection, ViewState, Tool, InfiniteCanvasRef, CreateElementOptions, CreateConnectionOptions, ElementType } from '../types';
import { 
  INITIAL_STATE, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, WHEEL_ZOOM_STEP, GRID_SIZE, 
  DEFAULT_ELEMENT_WIDTH, DEFAULT_ELEMENT_HEIGHT,
  DEFAULT_TEXT_WIDTH, DEFAULT_TEXT_HEIGHT,
  DEFAULT_CUSTOM_WIDTH, DEFAULT_CUSTOM_HEIGHT,
  DEFAULTS 
} from '../constants';
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

  useImperativeHandle(ref, () => {
    // Helper: Screen to World
    const screenToWorld = (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const view = sceneRef.current.view;
      return {
        x: (screenX - rect.left - view.x) / view.zoom,
        y: (screenY - rect.top - view.y) / view.zoom,
      };
    };

    // Helper: World to Screen
    const worldToScreen = (worldX: number, worldY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const view = sceneRef.current.view;
      return {
        x: (worldX * view.zoom) + view.x + rect.left,
        y: (worldY * view.zoom) + view.y + rect.top,
      };
    };

    // Helper: Get defaults based on type
    const getDefaults = (type: ElementType) => {
      let width = DEFAULT_ELEMENT_WIDTH;
      let height = DEFAULT_ELEMENT_HEIGHT;
      
      if (type === 'text') {
        width = DEFAULT_TEXT_WIDTH;
        height = DEFAULT_TEXT_HEIGHT;
      } else if (type === 'custom') {
        width = DEFAULT_CUSTOM_WIDTH;
        height = DEFAULT_CUSTOM_HEIGHT;
      }

      return { width, height };
    };

    return {
      exportJson: () => sceneRef.current,
      importJson: (data: SceneState) => updateScene(() => data),
      zoomIn: (amount = ZOOM_STEP) => updateScene(s => ({ ...s, view: { ...s.view, zoom: Math.min(MAX_ZOOM, s.view.zoom * amount) } })),
      zoomOut: (amount = ZOOM_STEP) => updateScene(s => ({ ...s, view: { ...s.view, zoom: Math.max(MIN_ZOOM, s.view.zoom / amount) } })),
      fitView: () => {
        updateScene(s => ({ ...s, view: { x: 0, y: 0, zoom: 1 } }));
      },
      selectElements: (ids: string[]) => handleSelection(ids),

      // EditorAPI - Elements
      createElement: (options: CreateElementOptions) => {
        const defaults = getDefaults(options.type);
        const center = (() => {
           const rect = containerRef.current?.getBoundingClientRect();
           if (!rect) return { x: 0, y: 0 };
           // Viewport center in world coords
           return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
        })();

        const newElement: CanvasElement = {
          id: options.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: options.type,
          x: options.x ?? center.x - (options.width ?? defaults.width) / 2,
          y: options.y ?? center.y - (options.height ?? defaults.height) / 2,
          width: options.width ?? defaults.width,
          height: options.height ?? defaults.height,
          rotation: options.rotation ?? DEFAULTS.rotation,
          opacity: options.opacity ?? DEFAULTS.opacity,
          backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
          strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
          strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
          text: options.text,
          componentType: options.componentType,
          props: options.props,
          locked: options.locked ?? false,
        };

        updateScene(prev => ({
          ...prev,
          elements: { ...prev.elements, [newElement.id]: newElement }
        }));

        return newElement;
      },

      createElements: (optionsList: CreateElementOptions[]) => {
        const rect = containerRef.current?.getBoundingClientRect();
        const center = rect ? screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2) : { x: 0, y: 0 };
        
        const newElements: CanvasElement[] = optionsList.map(options => {
          const defaults = getDefaults(options.type);
          return {
            id: options.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: options.type,
            x: options.x ?? center.x - (options.width ?? defaults.width) / 2,
            y: options.y ?? center.y - (options.height ?? defaults.height) / 2,
            width: options.width ?? defaults.width,
            height: options.height ?? defaults.height,
            rotation: options.rotation ?? DEFAULTS.rotation,
            opacity: options.opacity ?? DEFAULTS.opacity,
            backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
            strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
            strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
            text: options.text,
            componentType: options.componentType,
            props: options.props,
            locked: options.locked ?? false,
          };
        });

        updateScene(prev => {
          const nextElements = { ...prev.elements };
          newElements.forEach(el => {
            nextElements[el.id] = el;
          });
          return { ...prev, elements: nextElements };
        });

        return newElements;
      },

      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        let updatedElement: CanvasElement;
        
        updateScene(prev => {
          const element = prev.elements[id];
          if (!element) {
             updatedElement = element; 
             return prev;
          }
          updatedElement = { ...element, ...updates };
          return {
            ...prev,
            elements: { ...prev.elements, [id]: updatedElement }
          };
        });

        return updatedElement! || sceneRef.current.elements[id];
      },

      updateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => {
         const updatedElements: CanvasElement[] = [];

         updateScene(prev => {
           const nextElements = { ...prev.elements };
           updates.forEach(update => {
             const { id, ...changes } = update;
             if (nextElements[id]) {
               nextElements[id] = { ...nextElements[id], ...changes };
               updatedElements.push(nextElements[id]);
             }
           });
           return { ...prev, elements: nextElements };
         });
         
         return updatedElements;
      },

      deleteElement: (id: string) => {
        updateScene(prev => {
          const nextElements = { ...prev.elements };
          delete nextElements[id];
          const nextConnections = prev.connections.filter(c => c.sourceId !== id && c.targetId !== id);
          return { ...prev, elements: nextElements, connections: nextConnections };
        });
        
        if (selectedIdsRef.current.includes(id)) {
          handleSelection(selectedIdsRef.current.filter(sid => sid !== id));
        }
      },

      deleteElements: (ids: string[]) => {
        updateScene(prev => {
          const nextElements = { ...prev.elements };
          ids.forEach(id => delete nextElements[id]);
          const nextConnections = prev.connections.filter(c => !ids.includes(c.sourceId) && !ids.includes(c.targetId));
          return { ...prev, elements: nextElements, connections: nextConnections };
        });
        handleSelection(selectedIdsRef.current.filter(sid => !ids.includes(sid)));
      },

      getElement: (id: string) => sceneRef.current.elements[id],
      getElements: (ids?: string[]) => {
        if (!ids) return Object.values(sceneRef.current.elements);
        return ids.map(id => sceneRef.current.elements[id]).filter(Boolean);
      },

      // EditorAPI - Connections
      createConnection: (options: CreateConnectionOptions) => {
        const newConnection: Connection = {
          id: options.id || `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === 'auto' ? undefined : options.sourceHandle,
          targetHandle: options.targetHandle === 'auto' ? undefined : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature,
          }
        };

        updateScene(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }));

        return newConnection;
      },

      createConnections: (optionsList: CreateConnectionOptions[]) => {
         const newConnections: Connection[] = optionsList.map(options => ({
          id: options.id || `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === 'auto' ? undefined : options.sourceHandle,
          targetHandle: options.targetHandle === 'auto' ? undefined : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature,
          }
        }));

        updateScene(prev => ({
          ...prev,
          connections: [...prev.connections, ...newConnections]
        }));

        return newConnections;
      },

      updateConnection: (id: string, updates: Partial<Connection>) => {
        let updatedConnection: Connection;
        updateScene(prev => {
          const idx = prev.connections.findIndex(c => c.id === id);
          if (idx === -1) return prev;
          
          updatedConnection = { ...prev.connections[idx], ...updates };
          const newConnections = [...prev.connections];
          newConnections[idx] = updatedConnection;
          
          return { ...prev, connections: newConnections };
        });
        return updatedConnection! || sceneRef.current.connections.find(c => c.id === id);
      },

      deleteConnection: (id: string) => {
        updateScene(prev => ({
          ...prev,
          connections: prev.connections.filter(c => c.id !== id)
        }));
      },

      deleteConnections: (ids: string[]) => {
        updateScene(prev => ({
          ...prev,
          connections: prev.connections.filter(c => !ids.includes(c.id))
        }));
      },

      getConnection: (id: string) => sceneRef.current.connections.find(c => c.id === id),
      getConnections: (elementId?: string) => {
        if (!elementId) return sceneRef.current.connections;
        return sceneRef.current.connections.filter(c => c.sourceId === elementId || c.targetId === elementId);
      },
      getConnectionsBetween: (sourceId: string, targetId: string) => {
        return sceneRef.current.connections.filter(c => c.sourceId === sourceId && c.targetId === targetId);
      },

      // EditorAPI - Viewport
      getViewportCenter: () => {
         const rect = containerRef.current?.getBoundingClientRect();
         if (!rect) return { x: 0, y: 0 };
         return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      },
      getViewportBounds: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0, width: 0, height: 0 };
        const tl = screenToWorld(rect.left, rect.top);
        const br = screenToWorld(rect.right, rect.bottom);
        return {
          x: tl.x,
          y: tl.y,
          width: br.x - tl.x,
          height: br.y - tl.y
        };
      },
      screenToWorld,
      worldToScreen,
      panTo: (x: number, y: number, animate = false) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        updateScene(s => ({
          ...s,
          view: {
            ...s.view,
            x: centerX - x * s.view.zoom,
            y: centerY - y * s.view.zoom
          }
        }));
      },
      panToElement: (id: string, animate = false) => {
        const el = sceneRef.current.elements[id];
        if (!el) return;
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const viewCX = rect.width / 2;
        const viewCY = rect.height / 2;
        
        updateScene(s => ({
          ...s,
          view: {
            ...s.view,
            x: viewCX - centerX * s.view.zoom,
            y: viewCY - centerY * s.view.zoom
          }
        }));
      },
      setZoom: (level: number, focalPoint?: { x: number; y: number }) => {
        updateScene(s => {
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level));
          if (!focalPoint) {
             const rect = containerRef.current?.getBoundingClientRect();
             if (!rect) return { ...s, view: { ...s.view, zoom: newZoom } };
             
             const viewCX = rect.width / 2;
             const viewCY = rect.height / 2;
             const worldCX = (viewCX - s.view.x) / s.view.zoom;
             const worldCY = (viewCY - s.view.y) / s.view.zoom;
             
             const newViewX = viewCX - worldCX * newZoom;
             const newViewY = viewCY - worldCY * newZoom;
             
             return { ...s, view: { x: newViewX, y: newViewY, zoom: newZoom } };
          }
          return { ...s, view: { ...s.view, zoom: newZoom } };
        });
      },

      // EditorAPI - Selection
      selectAll: () => handleSelection(Object.keys(sceneRef.current.elements)),
      clearSelection: () => handleSelection([]),
      getSelectedIds: () => selectedIdsRef.current,
      focusElement: (id: string, options = {}) => {
        const el = sceneRef.current.elements[id];
        if (!el) return;
        handleSelection([id]);
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        updateScene(s => {
          const zoom = options.zoom ?? s.view.zoom;
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          
          return {
             ...s,
             view: {
               x: (rect.width / 2) - centerX * zoom,
               y: (rect.height / 2) - centerY * zoom,
               zoom
             }
          };
        });
      },
      focusElements: (ids: string[], options = {}) => {
        if (ids.length === 0) return;
        handleSelection(ids);
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let found = false;
        
        ids.forEach(id => {
          const el = sceneRef.current.elements[id];
          if (el) {
            found = true;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
          }
        });
        
        if (!found) return;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const padding = options.padding ?? 50;
        const contentW = maxX - minX + padding * 2;
        const contentH = maxY - minY + padding * 2;
        
        const zoomW = rect.width / contentW;
        const zoomH = rect.height / contentH;
        const zoom = Math.min(Math.min(zoomW, zoomH), MAX_ZOOM);
        
        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;
        
        updateScene(s => ({
          ...s,
          view: {
            x: (rect.width / 2) - centerX * zoom,
            y: (rect.height / 2) - centerY * zoom,
            zoom
          }
        }));
      }
    };
  }, [updateScene, handleSelection]);

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
          onZoomIn={() => (ref as any).current?.zoomIn()} 
          onZoomOut={() => (ref as any).current?.zoomOut()}
          onFitView={() => (ref as any).current?.fitView()}
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
