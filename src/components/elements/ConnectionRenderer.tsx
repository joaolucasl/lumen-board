
import React from 'react';
import { Connection, CanvasElement } from '../types';

interface ConnectionRendererProps {
  connection: Connection;
  elements: Record<string, CanvasElement>;
}

const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({ connection, elements }) => {
  const source = elements[connection.sourceId];
  const target = elements[connection.targetId];

  if (!source || !target) return null;

  const getCenter = (el: CanvasElement) => ({
    x: el.x + el.width / 2,
    y: el.y + el.height / 2
  });

  const p1 = getCenter(source);
  const p2 = getCenter(target);

  const curvature = connection.style?.curvature ?? 0.5;
  const dx = Math.abs(p2.x - p1.x) * curvature;
  const dy = Math.abs(p2.y - p1.y) * curvature;

  const cp1 = { x: p1.x + (p2.x > p1.x ? dx : -dx), y: p1.y };
  const cp2 = { x: p2.x + (p2.x > p1.x ? -dx : dx), y: p2.y };

  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;

  return (
    <g>
      <path 
        d={path} 
        fill="none" 
        stroke={connection.style?.strokeColor || '#000'} 
        strokeWidth={connection.style?.width || 2} 
        className="transition-all duration-300"
      />
      <circle cx={p2.x} cy={p2.y} r={4} fill={connection.style?.strokeColor || '#000'} />
    </g>
  );
};

export default React.memo(ConnectionRenderer);
