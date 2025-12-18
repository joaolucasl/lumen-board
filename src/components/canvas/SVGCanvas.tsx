
import React, { useRef } from 'react';
import { SceneState, CanvasElement, Tool } from '../../types';
import ElementRenderer from '../elements/ElementRenderer';
import ConnectionRenderer from '../elements/ConnectionRenderer';
import { useSvgCanvasInteractions } from '../../hooks/useSvgCanvasInteractions';
import ConnectionPreview from './ConnectionPreview';

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

  const {
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
    snapToGrid,
    onUpdateScene,
    onSelect,
    onToolChange,
  });

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
