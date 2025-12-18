
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { SceneState, CanvasElement, ViewState, Tool, HandleType } from '../../types';
import ElementRenderer from '../elements/ElementRenderer';
import ConnectionRenderer from '../elements/ConnectionRenderer';
import { GRID_SIZE } from '../../constants';
import { createConnectionId, createElementId } from '../../utils/ids';
import { screenToWorldPoint } from '../../utils/viewport';

interface SVGCanvasProps {
  scene: SceneState;
  selectedIds: string[];
  activeTool: Tool;
  onUpdateScene: (updater: (prev: SceneState) => SceneState) => void;
  onSelect: (ids: string[]) => void;
  customComponents: Record<string, React.FC<any>>;
  snapToGrid?: boolean;
  onToolChange?: (tool: Tool) => void;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({ 
  scene, 
  selectedIds, 
  activeTool, 
  onUpdateScene, 
  onSelect,
  customComponents,
  snapToGrid,
  onToolChange
}) => {
  const { view, elements, connections } = scene;
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Drag states
  const [dragState, setDragState] = useState<{
    type: 'pan' | 'element' | 'create';
    startPos: { x: number; y: number };
    initialElements?: Record<string, CanvasElement>;
    targetId?: string;
  } | null>(null);

  // Connection tool state (click-based, not drag-based)
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
    currentPos: { x: number; y: number };
  } | null>(null);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToWorldPoint(clientX, clientY, rect, view);
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
      const id = createElementId(false);
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
        if (pendingConnection) {
          // Second click: complete the connection
          if (elementId !== pendingConnection.sourceId) {
            const id = createConnectionId(false);
            onUpdateScene(s => ({
              ...s,
              connections: [...s.connections, {
                id,
                sourceId: pendingConnection.sourceId,
                targetId: elementId,
                style: { strokeColor: '#000000', width: 2, curvature: 0.5 }
              }]
            }));
          }
          setPendingConnection(null);
        } else {
          // First click: start the connection
          setPendingConnection({ sourceId: elementId, currentPos: worldPos });
        }
      } else {
        // Clicked on empty space: cancel pending connection
        setPendingConnection(null);
      }
      return; // Don't capture pointer for connection tool
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
    // Update pending connection position
    if (pendingConnection) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setPendingConnection({ ...pendingConnection, currentPos: worldPos });
    }

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
    if (dragState?.type === 'create' && onToolChange) {
      // Switch back to pointer tool after creating an element
      onToolChange('pointer');
    }
    setDragState(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
  };

  const transform = `translate(${view.x}, ${view.y}) scale(${view.zoom})`;

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full touch-none outline-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
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
        {pendingConnection && elements[pendingConnection.sourceId] && (() => {
          const source = elements[pendingConnection.sourceId];
          const p1 = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
          const p2 = pendingConnection.currentPos;
          const curvature = 0.5;
          const dx = Math.abs(p2.x - p1.x) * curvature;
          const cp1 = { x: p1.x + (p2.x > p1.x ? dx : -dx), y: p1.y };
          const cp2 = { x: p2.x + (p2.x > p1.x ? -dx : dx), y: p2.y };
          const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
          return (
            <g pointerEvents="none">
              <path 
                d={path} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                strokeDasharray="4 2"
                className="transition-none"
              />
              <circle cx={p2.x} cy={p2.y} r={4} fill="#3b82f6" />
            </g>
          );
        })()}
      </g>
    </svg>
  );
};

export default SVGCanvas;
