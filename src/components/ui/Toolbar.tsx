
import React from 'react';
import { Tool } from '../../types';
import { Icons } from './Icons';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
  keepToolActive: boolean;
  onToggleKeepToolActive: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolSelect, keepToolActive, onToggleKeepToolActive }) => {

  const tools: { id: Tool; icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }[] = [
    { id: 'pointer', icon: Icons.Pointer, label: 'Select' },
    { id: 'hand', icon: Icons.Hand, label: 'Pan' },
    { id: 'rectangle', icon: Icons.Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Icons.Circle, label: 'Ellipse' },
    { id: 'diamond', icon: Icons.Diamond, label: 'Diamond' },
    { id: 'text', icon: Icons.Type, label: 'Text' },
    { id: 'connection', icon: Icons.ArrowRight, label: 'Connect' },
    { id: 'eraser', icon: Icons.Eraser, label: 'Eraser' },
  ];

  return (
    <div className="lb-toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`lb-tool-button ${activeTool === tool.id ? 'lb-tool-button--active' : ''}`}
          title={tool.label}
        >
          <tool.icon width={20} height={20} />
        </button>
      ))}

      <div className="lb-toolbar__separator" />

      <button
        onClick={onToggleKeepToolActive}
        className={`lb-tool-button ${keepToolActive ? 'lb-tool-button--active' : ''}`}
        title="Keep selected tool active after use"
      >
        {keepToolActive ? <Icons.Lock width={18} height={18} /> : <Icons.Unlock width={18} height={18} />}
      </button>
    </div>
  );
};

export default Toolbar;
