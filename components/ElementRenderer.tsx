
import React from 'react';
import { CanvasElement } from '../types';

interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  customComponent?: React.FC<any>;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected, customComponent: CustomComp }) => {
  const { id, type, x, y, width, height, rotation, backgroundColor, strokeColor, strokeWidth, opacity, text } = element;
  
  const commonProps = {
    'data-element-id': id,
    fill: backgroundColor || '#ffffff',
    stroke: isSelected ? '#3b82f6' : (strokeColor || '#000000'),
    strokeWidth: isSelected ? (strokeWidth || 2) + 1 : (strokeWidth || 2),
    style: { cursor: 'move', opacity }
  };

  const transform = `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`;

  const renderShape = () => {
    switch (type) {
      case 'rectangle':
        return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} {...commonProps} />;
      case 'ellipse':
        return <ellipse cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} {...commonProps} />;
      case 'diamond':
        const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`;
        return <polygon points={points} {...commonProps} />;
      case 'text':
        return (
          <g transform={transform} data-element-id={id}>
            <text 
              x={x + width / 2} 
              y={y + height / 2} 
              textAnchor="middle" 
              dominantBaseline="middle"
              className="select-none font-medium pointer-events-none"
              style={{ fontSize: 16, fill: strokeColor }}
            >
              {text}
            </text>
            <rect x={x} y={y} width={width} height={height} fill="transparent" stroke={isSelected ? '#3b82f6' : 'transparent'} strokeWidth={1} />
          </g>
        );
      case 'custom':
        if (!CustomComp) return null;
        return (
          <foreignObject x={x} y={y} width={width} height={height} transform={transform} data-element-id={id}>
            <div className={`w-full h-full overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
              <CustomComp width={width} height={height} data={element.props} />
            </div>
          </foreignObject>
        );
      default:
        return null;
    }
  };

  return (
    <g transform={type !== 'text' ? transform : ''}>
      {renderShape()}
      {isSelected && (
        <rect 
          x={x - 4} y={y - 4} width={width + 8} height={height + 8} 
          fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};

export default React.memo(ElementRenderer);
