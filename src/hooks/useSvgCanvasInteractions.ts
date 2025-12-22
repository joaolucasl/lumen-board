import { useCallback, useState } from 'react';
import type React from 'react';
import type { RefObject } from 'react';
import type { CanvasElement, ElementType, ResizeHandleType, SceneState, Tool } from '../types';
import { GRID_SIZE, MIN_ELEMENT_SIZE } from '../constants';
import { createConnectionId, createElementId } from '../utils/ids';
import { screenToWorldPoint } from '../utils/viewport';
import { deleteConnectionsForElements, deleteElementsFromMap } from '../utils/scene';

export type UseSvgCanvasInteractionsArgs = {
  svgRef: RefObject<SVGSVGElement>;
  scene: SceneState;
  selectedIds: string[];
  activeTool: Tool;
  keepToolActive?: boolean;
  snapToGrid?: boolean;
  onUpdateScene: (updater: (prev: SceneState) => SceneState) => void;
  onSelect: (ids: string[]) => void;
  onToolChange?: (tool: Tool) => void;
};

type ResizeDelta = { dx: number; dy: number };
type ResizeOptions = { snapToGrid: boolean };

const clampSize = (value: number) => Math.max(MIN_ELEMENT_SIZE, value);

const snapValue = (value: number, enabled: boolean) =>
  enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

function computeResize(
  handle: ResizeHandleType,
  initial: { x: number; y: number; width: number; height: number },
  delta: ResizeDelta,
  options: ResizeOptions
): { x: number; y: number; width: number; height: number } {
  const { dx, dy } = delta;
  const { snapToGrid } = options;
  const aspect = initial.width / initial.height || 1;

  let x = initial.x;
  let y = initial.y;
  let width = initial.width;
  let height = initial.height;

  switch (handle) {
    case 'top-left': {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height - dy);
      x = initial.x + (initial.width - width);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'top-right': {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'bottom-left': {
      width = clampSize(initial.width - dx);
      height = clampSize(initial.height + dy);
      x = initial.x + (initial.width - width);
      break;
    }
    case 'bottom-right': {
      width = clampSize(initial.width + dx);
      height = clampSize(initial.height + dy);
      break;
    }
    case 'left-center': {
      width = clampSize(initial.width - dx);
      x = initial.x + (initial.width - width);
      break;
    }
    case 'right-center': {
      width = clampSize(initial.width + dx);
      break;
    }
    case 'top-center': {
      height = clampSize(initial.height - dy);
      y = initial.y + (initial.height - height);
      break;
    }
    case 'bottom-center': {
      height = clampSize(initial.height + dy);
      break;
    }
  }

  // Preserve aspect ratio for corner handles only
  if (
    handle === 'top-left' ||
    handle === 'top-right' ||
    handle === 'bottom-left' ||
    handle === 'bottom-right'
  ) {
    const targetHeight = width / aspect;
    const targetWidth = height * aspect;
    const lockToWidth = Math.abs(width - initial.width) >= Math.abs(height - initial.height);
    if (lockToWidth) {
      height = clampSize(targetHeight);
    } else {
      width = clampSize(targetWidth);
    }
    // Re-apply anchor offsets after aspect correction
    switch (handle) {
      case 'top-left':
        x = initial.x + (initial.width - width);
        y = initial.y + (initial.height - height);
        break;
      case 'top-right':
        y = initial.y + (initial.height - height);
        break;
      case 'bottom-left':
        x = initial.x + (initial.width - width);
        break;
      case 'bottom-right':
        break;
    }
  }

  const snappedX = snapValue(x, snapToGrid);
  const snappedY = snapValue(y, snapToGrid);
  const snappedWidth = snapValue(width, snapToGrid);
  const snappedHeight = snapValue(height, snapToGrid);

  return {
    x: snappedX,
    y: snappedY,
    width: snappedWidth,
    height: snappedHeight,
  };
}

export function useSvgCanvasInteractions({
  svgRef,
  scene,
  selectedIds,
  activeTool,
  keepToolActive,
  snapToGrid,
  onUpdateScene,
  onSelect,
  onToolChange,
}: UseSvgCanvasInteractionsArgs) {
  const { view, elements } = scene;

  const [dragState, setDragState] = useState<{
    type: 'pan' | 'element' | 'create' | 'resize';
    startPos: { x: number; y: number };
    initialElements?: Record<string, CanvasElement>;
    targetId?: string;
    resizeHandle?: ResizeHandleType;
    initialDimensions?: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
    currentPos: { x: number; y: number };
  } | null>(null);

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return screenToWorldPoint(clientX, clientY, rect, view);
    },
    [svgRef, view]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const target = e.target as SVGElement;
      const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');
      const connectionId = target.closest('[data-connection-id]')?.getAttribute('data-connection-id');
      const resizeHandle = target.closest('[data-resize-handle]')?.getAttribute('data-resize-handle') as ResizeHandleType | null;
      const resizeTargetId = target.closest('[data-resize-target]')?.getAttribute('data-resize-target');

      if (activeTool === 'pointer' && resizeHandle && resizeTargetId) {
        const el = elements[resizeTargetId];
        if (el && !el.locked) {
          setDragState({
            type: 'resize',
            startPos: worldPos,
            initialElements: { ...elements },
            targetId: resizeTargetId,
            resizeHandle,
            initialDimensions: { x: el.x, y: el.y, width: el.width, height: el.height },
          });
          try {
            (e.target as Element).setPointerCapture(e.pointerId);
          } catch {
            // Pointer capture may fail if element is removed or pointer is invalid
          }
          return;
        }
      }

      if (activeTool === 'pointer' && !elementId && connectionId) {
        if (!selectedIds.includes(connectionId)) {
          onSelect(e.shiftKey ? [...selectedIds, connectionId] : [connectionId]);
        }
      } else if (activeTool === 'hand' || (activeTool === 'pointer' && !elementId && !connectionId)) {
        if (activeTool === 'pointer') {
          onSelect([]);
        }
        setDragState({ type: 'pan', startPos: { x: e.clientX, y: e.clientY } });
      } else if (activeTool === 'pointer' && elementId) {
        if (!selectedIds.includes(elementId)) {
          onSelect(e.shiftKey ? [...selectedIds, elementId] : [elementId]);
        }
        setDragState({
          type: 'element',
          startPos: worldPos,
          initialElements: { ...elements },
        });
      } else if (['rectangle', 'ellipse', 'diamond', 'text'].includes(activeTool)) {
        const id = createElementId(false);
        const newElement: CanvasElement = {
          id,
          type: activeTool as ElementType,
          x: snapToGrid ? Math.round(worldPos.x / GRID_SIZE) * GRID_SIZE : worldPos.x,
          y: snapToGrid ? Math.round(worldPos.y / GRID_SIZE) * GRID_SIZE : worldPos.y,
          width: 10,
          height: 10,
          rotation: 0,
          opacity: 1,
          locked: false,
          backgroundColor: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 2,
          text: activeTool === 'text' ? 'Double click to edit' : '',
        };

        onUpdateScene((s) => ({ ...s, elements: { ...s.elements, [id]: newElement } }));
        onSelect([id]);
        setDragState({ type: 'create', startPos: worldPos, targetId: id });
      } else if (activeTool === 'connection') {
        if (elementId) {
          if (pendingConnection) {
            if (elementId !== pendingConnection.sourceId) {
              const id = createConnectionId(false);
              onUpdateScene((s) => ({
                ...s,
                connections: [
                  ...s.connections,
                  {
                    id,
                    sourceId: pendingConnection.sourceId,
                    targetId: elementId,
                    style: { strokeColor: '#000000', width: 2, curvature: 0.5 },
                  },
                ],
              }));

              if (!keepToolActive && onToolChange) {
                onToolChange('pointer');
              }
            }
            setPendingConnection(null);
          } else {
            setPendingConnection({ sourceId: elementId, currentPos: worldPos });
          }
        } else {
          setPendingConnection(null);
        }
        return;
      } else if (activeTool === 'eraser' && (elementId || connectionId)) {
        if (elementId) {
          onUpdateScene((s) => {
            const newElements = deleteElementsFromMap(s.elements, [elementId]);
            return {
              ...s,
              elements: newElements,
              connections: deleteConnectionsForElements(s.connections, [elementId]),
            };
          });
        } else if (connectionId) {
          onUpdateScene((s) => ({
            ...s,
            connections: s.connections.filter((c) => c.id !== connectionId),
          }));
        }

        if (!keepToolActive && onToolChange) {
          onToolChange('pointer');
        }
      }

      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture may fail if element is removed or pointer is invalid
      }
    },
    [
      activeTool,
      elements,
      keepToolActive,
      onSelect,
      onUpdateScene,
      onToolChange,
      pendingConnection,
      screenToWorld,
      selectedIds,
      snapToGrid,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pendingConnection) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        setPendingConnection({ ...pendingConnection, currentPos: worldPos });
      }

      if (!dragState) return;

      if (dragState.type === 'pan') {
        const dx = e.clientX - dragState.startPos.x;
        const dy = e.clientY - dragState.startPos.y;
        onUpdateScene((s) => ({
          ...s,
          view: { ...s.view, x: s.view.x + dx, y: s.view.y + dy },
        }));
        setDragState({ ...dragState, startPos: { x: e.clientX, y: e.clientY } });
      } else if (dragState.type === 'element') {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const dx = worldPos.x - dragState.startPos.x;
        const dy = worldPos.y - dragState.startPos.y;

        onUpdateScene((s) => {
          const nextElements = { ...s.elements };
          selectedIds.forEach((id) => {
            const initial = dragState.initialElements?.[id];
            if (initial) {
              let nx = initial.x + dx;
              let ny = initial.y + dy;
              if (snapToGrid) {
                nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
                ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
              }
              nextElements[id] = { ...nextElements[id], x: nx, y: ny };
            }
          });
          return { ...s, elements: nextElements };
        });
      } else if (dragState.type === 'create' && dragState.targetId) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const width = Math.max(20, worldPos.x - dragState.startPos.x);
        const height = Math.max(20, worldPos.y - dragState.startPos.y);
        onUpdateScene((s) => ({
          ...s,
          elements: {
            ...s.elements,
            [dragState.targetId!]: {
              ...s.elements[dragState.targetId!],
              width,
              height,
            },
          },
        }));
      } else if (dragState.type === 'resize' && dragState.targetId && dragState.resizeHandle && dragState.initialDimensions) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const dx = worldPos.x - dragState.startPos.x;
        const dy = worldPos.y - dragState.startPos.y;

        onUpdateScene((s) => {
          const nextElements = { ...s.elements };
          const initial = dragState.initialElements?.[dragState.targetId];
          if (!initial) {
            return s;
          }

          const updated = computeResize(
            dragState.resizeHandle,
            dragState.initialDimensions,
            { dx, dy },
            { snapToGrid: false }
          );

          nextElements[dragState.targetId] = { ...nextElements[dragState.targetId], ...updated };
          return { ...s, elements: nextElements };
        });
      }
    },
    [dragState, onUpdateScene, pendingConnection, screenToWorld, selectedIds, snapToGrid]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragState?.type === 'create' && onToolChange && !keepToolActive) {
        onToolChange('pointer');
      }

      if (dragState?.type === 'resize' && dragState.targetId && dragState.resizeHandle && dragState.initialDimensions) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const dx = worldPos.x - dragState.startPos.x;
        const dy = worldPos.y - dragState.startPos.y;

        onUpdateScene((s) => {
          const nextElements = { ...s.elements };
          const initial = dragState.initialElements?.[dragState.targetId];
          if (!initial) {
            return s;
          }

          const updated = computeResize(
            dragState.resizeHandle!,
            dragState.initialDimensions!,
            { dx, dy },
            { snapToGrid: Boolean(snapToGrid) }
          );

          nextElements[dragState.targetId!] = { ...nextElements[dragState.targetId!], ...updated };
          return { ...s, elements: nextElements };
        });
      }

      setDragState(null);
    },
    [dragState, keepToolActive, onToolChange, onUpdateScene, screenToWorld, snapToGrid]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
  }, []);

  return {
    dragState,
    pendingConnection,
    setPendingConnection,
    screenToWorld,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  };
}
