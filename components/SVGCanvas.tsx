
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { SceneState, CanvasElement, ViewState, Tool, HandleType } from '../types';
import ElementRenderer from './ElementRenderer';
import ConnectionRenderer from './ConnectionRenderer';
import { GRID_SIZE } from '../constants';

interface SVGCanvasProps {
  scene: SceneState;
  selectedIds: string[];
  activeTool: Tool;
  onUpdateScene: (updater: (prev: SceneState) => SceneState) => void;
  onSelect: (ids: string[]) => void;
  customComponents: Record<string, React.FC<any>>;
  snapToGrid?: boolean;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({ 
  scene, 
  selectedIds, 
  activeTool, 
  onUpdateScene, 
  onSelect,
  customComponents,
  snapToGrid
}) => {
  const { view, elements, connections } = scene;
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Drag states
  const [dragState, setDragState] = useState<{
    type: 'pan' | 'element' | 'create' | 'connect';
    startPos: { x: number; y: number };
    initialElements?: Record<string, CanvasElement>;
    targetId?: string;
  } | null>(null);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - view.x) / view.zoom,
      y: (clientY - rect.top - view.y) / view.zoom,
    };
  }, [view]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const target = e.target as SVGElement;
    const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');

    if (activeTool === 'hand' || (activeTool === 'pointer' && !elementId)) {
      if (activeTool === 'pointer') {
        onSelect([]);
      }
      setDragState({ type: 'pan', startPos: { x: e.clientX, y: e.clientY } });
    } else if (activeTool === 'pointer' && elementId) {
      if (!selectedIds.includes(elementId)) {
        onSelect(e.shiftKey ? [...selectedIds, elementId] : [elementId]);
      }
      setDragState({ 
        type: 'element', 
        startPos: worldPos, 
        initialElements: { ...elements } 
      });
    } else if (['rectangle', 'ellipse', 'diamond', 'text'].includes(activeTool)) {
      const id = `el_${Date.now()}`;
      const newElement: CanvasElement = {
        id,
        type: activeTool as any,
        x: snapToGrid ? Math.round(worldPos.x / GRID_SIZE) * GRID_SIZE : worldPos.x,
        y: snapToGrid ? Math.round(worldPos.y / GRID_SIZE) * GRID_SIZE : worldPos.y,
        width: 10,
        height: 10,
        rotation: 0,
        opacity: 1,
        locked: false,
        backgroundColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        text: activeTool === 'text' ? 'Double click to edit' : ''
      };
      onUpdateScene(s => ({ ...s, elements: { ...s.elements, [id]: newElement } }));
      onSelect([id]);
      setDragState({ type: 'create', startPos: worldPos, targetId: id });
    } else if (activeTool === 'connection') {
      if (elementId) {
        setDragState({ type: 'connect', startPos: worldPos, targetId: elementId });
      }
    } else if (activeTool === 'eraser' && elementId) {
      onUpdateScene(s => {
        const newElements = { ...s.elements };
        delete newElements[elementId];
        return {
          ...s,
          elements: newElements,
          connections: s.connections.filter(c => c.sourceId !== elementId && c.targetId !== elementId)
        };
      });
    }
    
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;

    if (dragState.type === 'pan') {
      const dx = e.clientX - dragState.startPos.x;
      const dy = e.clientY - dragState.startPos.y;
      onUpdateScene(s => ({ 
        ...s, 
        view: { ...s.view, x: s.view.x + dx, y: s.view.y + dy } 
      }));
      setDragState({ ...dragState, startPos: { x: e.clientX, y: e.clientY } });
    } else if (dragState.type === 'element') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const dx = worldPos.x - dragState.startPos.x;
      const dy = worldPos.y - dragState.startPos.y;
      
      onUpdateScene(s => {
        const nextElements = { ...s.elements };
        selectedIds.forEach(id => {
          const initial = dragState.initialElements?.[id];
          if (initial) {
            let nx = initial.x + dx;
            let ny = initial.y + dy;
            if (snapToGrid) {
              nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
              ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
            }
            nextElements[id] = { ...nextElements[id], x: nx, y: ny };
          }
        });
        return { ...s, elements: nextElements };
      });
    } else if (dragState.type === 'create' && dragState.targetId) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const width = Math.max(20, worldPos.x - dragState.startPos.x);
      const height = Math.max(20, worldPos.y - dragState.startPos.y);
      onUpdateScene(s => ({
        ...s,
        elements: {
          ...s.elements,
          [dragState.targetId!]: { ...s.elements[dragState.targetId!], width, height }
        }
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState?.type === 'connect' && dragState.targetId) {
      const targetId = (e.target as SVGElement).closest('[data-element-id]')?.getAttribute('data-element-id');
      if (targetId && targetId !== dragState.targetId) {
        const id = `conn_${Date.now()}`;
        onUpdateScene(s => ({
          ...s,
          connections: [...s.connections, {
            id,
            sourceId: dragState.targetId!,
            targetId,
            style: { strokeColor: '#000000', width: 2, curvature: 0.5 }
          }]
        }));
      }
    }
    setDragState(null);
  };

  const transform = `translate(${view.x}, ${view.y}) scale(${view.zoom})`;

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full touch-none outline-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={e => e.preventDefault()}
    >
      <g transform={transform}>
        {/* Connections */}
        {connections.map(conn => (
          <ConnectionRenderer 
            key={conn.id} 
            connection={conn} 
            elements={elements} 
          />
        ))}

        {/* Elements */}
        {/* Fix: Explicitly cast Object.values(elements) to CanvasElement[] to ensure TypeScript recognizes the properties on 'el' */}
        {(Object.values(elements) as CanvasElement[]).map(el => (
          <ElementRenderer 
            key={el.id} 
            element={el} 
            isSelected={selectedIds.includes(el.id)}
            customComponent={el.componentType ? customComponents[el.componentType] : undefined}
          />
        ))}

        {/* Active Connection Line Preview */}
        {dragState?.type === 'connect' && (
           <line 
             x1={elements[dragState.targetId!].x + elements[dragState.targetId!].width/2}
             y1={elements[dragState.targetId!].y + elements[dragState.targetId!].height/2}
             x2={screenToWorld(0,0).x /* logic simplified for demo */} 
             y2={0}
             stroke="#3b82f6"
             strokeWidth="2"
             strokeDasharray="4 2"
           />
        )}
      </g>
    </svg>
  );
};

export default SVGCanvas;
