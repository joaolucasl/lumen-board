
import React from 'react';
import { CanvasElement } from '../../types';
import { Icons } from './Icons';

interface PropertiesPanelProps {
  elements: CanvasElement[];
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ elements, onUpdate }) => {
  if (elements.length === 0) return null;

  const isText = elements.every(el => el.type === 'text');
  const first = elements[0];

  return (
    <div className="lb-properties-panel">
      <h3 className="lb-properties-panel__title">Properties</h3>
      
      <div className="space-y-4">
        {/* Background Color */}
        {!isText && (
          <div className="lb-property-group">
            <label className="lb-property-label">Background</label>
            <div className="lb-color-grid">
              {['#ffffff', '#fecaca', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe'].map(color => (
                <button
                  key={color}
                  onClick={() => onUpdate({ backgroundColor: color })}
                  className="lb-color-swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Text Content */}
        {isText && (
          <div className="lb-property-group">
            <label className="lb-property-label">Text Value</label>
            <input 
              type="text"
              value={first.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="lb-input"
            />
          </div>
        )}

        {/* Stroke Color */}
        <div className="lb-property-group">
          <label className="lb-property-label">Stroke</label>
          <div className="lb-color-grid">
            {['#000000', '#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed'].map(color => (
              <button
                key={color}
                onClick={() => onUpdate({ strokeColor: color })}
                className="lb-color-swatch"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="lb-property-group">
          <label className="lb-property-label">Opacity</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={first.opacity ?? 1}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="lb-slider"
          />
        </div>

        {/* Layer Controls */}
        <div className="lb-panel-footer">
           <button className="lb-text-button">
             <div className="lb-icon-mr"><Icons.Layers width={14} height={14} /></div> Bring Forward
           </button>
           <button className="lb-text-button">
             <div className="lb-icon-mr"><Icons.Lock width={12} height={12} /></div> Lock
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
