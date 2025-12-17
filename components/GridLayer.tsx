
import React from 'react';
import { ViewState } from '../types';
import { GRID_SIZE } from '../constants';

interface GridLayerProps {
  view: ViewState;
}

const GridLayer: React.FC<GridLayerProps> = ({ view }) => {
  const size = GRID_SIZE * view.zoom;
  const offsetX = view.x % size;
  const offsetY = view.y % size;

  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-20"
      style={{
        backgroundImage: `radial-gradient(circle, #4b5563 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`
      }}
    />
  );
};

export default React.memo(GridLayer);
