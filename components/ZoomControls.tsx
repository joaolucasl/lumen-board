
import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, onFitView }) => {
  return (
    <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-100 z-50">
      <button 
        onClick={onZoomOut}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <i className="fas fa-minus text-xs"></i>
      </button>
      <span className="text-xs font-bold text-gray-700 w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={onZoomIn}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <i className="fas fa-plus text-xs"></i>
      </button>
      <div className="w-[1px] h-4 bg-gray-200 mx-1" />
      <button 
        onClick={onFitView}
        className="px-2 h-8 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg uppercase"
      >
        Fit View
      </button>
    </div>
  );
};

export default ZoomControls;
