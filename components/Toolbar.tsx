
import React from 'react';
import { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect }) => {

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pointer', icon: 'fa-mouse-pointer', label: 'Select' },
    { id: 'hand', icon: 'fa-hand', label: 'Pan' },
    { id: 'rectangle', icon: 'fa-square', label: 'Rectangle' },
    { id: 'ellipse', icon: 'fa-circle', label: 'Ellipse' },
    { id: 'diamond', icon: 'fa-rhombus', label: 'Diamond' },
    { id: 'text', icon: 'fa-font', label: 'Text' },
    { id: 'connection', icon: 'fa-share-alt', label: 'Connect' },
    { id: 'eraser', icon: 'fa-eraser', label: 'Eraser' },
  ];

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/40 z-50">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
            activeTool === tool.id 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={tool.label}
        >
          <i className={`fas ${tool.icon}`}></i>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
