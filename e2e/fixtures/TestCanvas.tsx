import React, { useRef } from 'react';
import { InfiniteCanvas } from '../../src';
import type { SceneState, InfiniteCanvasRef } from '../../src/types';
import { INITIAL_STATE } from '../../src/constants';

// Test component for no-select feature testing
const NoSelectTestCard = ({ width, height, data }: { width: number; height: number; data: any }) => (
  <div style={{ width, height, padding: 16, border: '2px solid #000', backgroundColor: '#fff' }}>
    <h3 data-testid="card-title">{data?.title || 'Test Card'}</h3>
    <p>{data?.description || 'Description'}</p>
    <button 
      data-lumen-no-select 
      data-testid="no-select-button"
      onClick={() => console.log('Button clicked')}
      style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
    >
      Action Button
    </button>
    <input 
      data-lumen-no-select 
      data-testid="no-select-input"
      type="text" 
      placeholder="Type here..."
      style={{ marginLeft: '8px', padding: '8px' }}
    />
  </div>
);

// Built-in test components registry
const TEST_COMPONENTS: Record<string, React.FC<any>> = {
  NoSelectTestCard,
};

export interface TestCanvasProps {
  initialScene?: SceneState;
  width?: number;
  height?: number;
  onSceneChange?: (scene: SceneState) => void;
  onSelectionChange?: (ids: string[]) => void;
  showToolbar?: boolean;
  showZoomControls?: boolean;
  snapToGrid?: boolean;
  components?: Record<string, React.FC<any>>;
}

export function TestCanvas({
  initialScene = INITIAL_STATE,
  width = 800,
  height = 600,
  onSceneChange,
  onSelectionChange,
  showToolbar = true,
  showZoomControls = true,
  snapToGrid = false,
  components,
}: TestCanvasProps) {
  const canvasRef = useRef<InfiniteCanvasRef>(null);

  return (
    <div
      data-testid="test-canvas-wrapper"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #ccc',
        position: 'relative',
      }}
    >
      <InfiniteCanvas
        ref={canvasRef}
        initialData={initialScene}
        onChange={onSceneChange}
        onSelectionChange={onSelectionChange}
        components={{ ...TEST_COMPONENTS, ...components }}
        config={{
          snapToGrid,
          grid: true,
        }}
        uiConfig={{
          showToolbar,
          showZoomControls,
          showPropertiesPanel: false,
        }}
      />
    </div>
  );
}
