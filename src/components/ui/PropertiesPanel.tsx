
import React from 'react';
import { CanvasElement } from '../../types';

interface PropertiesPanelProps {
  elements: CanvasElement[];
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ elements, onUpdate }) => {
  if (elements.length === 0) return null;

  const isText = elements.every(el => el.type === 'text');
  const first = elements[0];

  return (
    <div className="absolute top-6 right-6 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Properties</h3>
      
      <div className="space-y-4">
        {/* Background Color */}
        {!isText && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Background</label>
            <div className="flex flex-wrap gap-2">
              {['#ffffff', '#fecaca', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe'].map(color => (
                <button
                  key={color}
                  onClick={() => onUpdate({ backgroundColor: color })}
                  className="w-6 h-6 rounded-md border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Text Content */}
        {isText && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Text Value</label>
            <input 
              type="text"
              value={first.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {/* Stroke Color */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">Stroke</label>
          <div className="flex flex-wrap gap-2">
            {['#000000', '#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed'].map(color => (
              <button
                key={color}
                onClick={() => onUpdate({ strokeColor: color })}
                className="w-6 h-6 rounded-md border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">Opacity</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={first.opacity ?? 1}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Layer Controls */}
        <div className="pt-2 border-t border-gray-100 flex justify-between">
           <button className="text-xs font-medium text-gray-500 hover:text-blue-500 flex items-center">
             <i className="fas fa-layer-group mr-1.5"></i> Bring Forward
           </button>
           <button className="text-xs font-medium text-gray-500 hover:text-blue-500 flex items-center">
             <i className="fas fa-lock mr-1.5"></i> Lock
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
