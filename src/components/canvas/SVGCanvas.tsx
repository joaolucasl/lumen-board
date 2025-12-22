
import React, { useRef, useMemo } from 'react';
import { SceneState, CanvasElement, Tool } from '../../types';
import ElementRenderer from '../elements/ElementRenderer';
import ConnectionRenderer from '../elements/ConnectionRenderer';
import { useSvgCanvasInteractions } from '../../hooks/useSvgCanvasInteractions';
import ConnectionPreview from './ConnectionPreview';
import ResizeHandles from './ResizeHandles';

interface SVGCanvasProps {
  scene: SceneState;
  selectedIds: string[];
  activeTool: Tool;
  keepToolActive?: boolean;
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
  keepToolActive,
  onUpdateScene, 
  onSelect,
  customComponents,
  snapToGrid,
  onToolChange
}) => {
  const { view, elements, connections } = scene;
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    dragState,
    pendingConnection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  } = useSvgCanvasInteractions({
    svgRef,
    scene,
    selectedIds,
    activeTool,
    keepToolActive,
    snapToGrid,
    onUpdateScene,
    onSelect,
    onToolChange,
  });

  const transform = `translate(${view.x}, ${view.y}) scale(${view.zoom})`;

  // Memoize single selected element computation (Fix 6.3)
  const singleSelectedElement = useMemo(
    () => (selectedIds.length === 1 ? elements[selectedIds[0]] : undefined),
    [selectedIds, elements]
  );

  // Viewport culling: only render elements within viewport bounds (Fix 6.5)
  const visibleElements = useMemo(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return Object.values(elements) as CanvasElement[];

    // Calculate viewport bounds in world coordinates
    const padding = 200; // Extra padding to avoid pop-in
    const minX = (-view.x - padding) / view.zoom;
    const minY = (-view.y - padding) / view.zoom;
    const maxX = (rect.width - view.x + padding) / view.zoom;
    const maxY = (rect.height - view.y + padding) / view.zoom;

    return (Object.values(elements) as CanvasElement[]).filter((el) => {
      // Check if element intersects with viewport
      const elRight = el.x + el.width;
      const elBottom = el.y + el.height;
      return !(el.x > maxX || elRight < minX || el.y > maxY || elBottom < minY);
    });
  }, [elements, view, svgRef]);

  const isDragging = Boolean(dragState);
  const canvasCursor: React.CSSProperties['cursor'] = isDragging
    ? 'grabbing'
    : activeTool === 'hand'
      ? 'grab'
      : 'default';

  const hoverCursor: React.CSSProperties['cursor'] = isDragging
    ? 'grabbing'
    : activeTool === 'pointer'
      ? 'pointer'
      : undefined;

  return (
    <svg 
      ref={svgRef}
      className="lb-svg-canvas"
      style={{ cursor: canvasCursor }}
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
            isSelected={selectedIds.includes(conn.id)}
            cursor={hoverCursor}
          />
        ))}

        {/* Elements (with viewport culling) */}
        {visibleElements.map(el => (
          <ElementRenderer 
            key={el.id} 
            element={el} 
            isSelected={selectedIds.includes(el.id)}
            customComponent={el.componentType ? customComponents[el.componentType] : undefined}
            cursor={hoverCursor}
          />
        ))}

        {/* Resize Handles for single element selection */}
        {singleSelectedElement && !singleSelectedElement.locked && (
          <ResizeHandles element={singleSelectedElement} />
        )}

        {/* Active Connection Line Preview */}
        {pendingConnection && elements[pendingConnection.sourceId] && (
          <ConnectionPreview
            source={elements[pendingConnection.sourceId]}
            currentPos={pendingConnection.currentPos}
          />
        )}
      </g>
    </svg>
  );
};

export default SVGCanvas;
