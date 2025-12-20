
import React from 'react';
import { Icons } from './Icons';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, onFitView }) => {
  return (
    <div className="lb-zoom-controls">
      <button 
        onClick={onZoomOut}
        className="lb-zoom-button"
      >
        <Icons.Minus width={12} height={12} />
      </button>
      <span className="lb-zoom-value">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={onZoomIn}
        className="lb-zoom-button"
      >
        <Icons.Plus width={12} height={12} />
      </button>
      <div className="lb-zoom-separator" />
      <button 
        onClick={onFitView}
        className="lb-fit-button"
      >
        Fit View
      </button>
    </div>
  );
};

export default ZoomControls;
