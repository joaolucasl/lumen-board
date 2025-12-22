import React, { useRef } from 'react';
import { InfiniteCanvas } from '../../src';
import type { SceneState, InfiniteCanvasRef } from '../../src/types';
import { INITIAL_STATE } from '../../src/constants';

export interface TestCanvasProps {
  initialScene?: SceneState;
  width?: number;
  height?: number;
  onSceneChange?: (scene: SceneState) => void;
  onSelectionChange?: (ids: string[]) => void;
  showToolbar?: boolean;
  showZoomControls?: boolean;
  snapToGrid?: boolean;
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
