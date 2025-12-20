import React from 'react';
import type { CanvasElement } from '../../types';

type ConnectionPreviewProps = {
  source: CanvasElement;
  currentPos: { x: number; y: number };
};

const ConnectionPreview: React.FC<ConnectionPreviewProps> = ({ source, currentPos }) => {
  const p1 = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const p2 = currentPos;
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
        className="lb-connection-preview"
      />
      <circle cx={p2.x} cy={p2.y} r={4} fill="#3b82f6" />
    </g>
  );
};

export default ConnectionPreview;
