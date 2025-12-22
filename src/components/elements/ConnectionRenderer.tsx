
import React from 'react';
import { Connection, CanvasElement } from '../../types';

interface ConnectionRendererProps {
  connection: Connection;
  elements: Record<string, CanvasElement>;
  isSelected?: boolean;
  cursor?: React.CSSProperties['cursor'];
}

const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({ connection, elements, isSelected = false, cursor }) => {
  const source = elements[connection.sourceId];
  const target = elements[connection.targetId];

  if (!source || !target) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[LumenBoard] Connection ${connection.id} has missing ${!source ? 'source' : 'target'} element (source: ${connection.sourceId}, target: ${connection.targetId})`
      );
    }
    return null;
  }

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

  const strokeColor = connection.style?.strokeColor || '#000';
  const strokeWidth = connection.style?.width || 2;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(12, strokeWidth + 10)}
        strokeLinecap="round"
        pointerEvents="stroke"
        data-connection-id={connection.id}
        style={{ cursor }}
      />
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke="#3b82f6"
          strokeOpacity={0.35}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      <path 
        d={path} 
        fill="none" 
        stroke={isSelected ? '#3b82f6' : strokeColor} 
        strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth} 
        strokeLinecap="round"
        className="lb-connection"
        pointerEvents="none"
      />
      <circle cx={p2.x} cy={p2.y} r={4} fill={strokeColor} pointerEvents="none" />
    </g>
  );
};

export default React.memo(ConnectionRenderer);
