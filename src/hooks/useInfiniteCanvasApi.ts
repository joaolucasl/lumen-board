import { useMemo } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type {
  CanvasElement,
  Connection,
  CreateConnectionOptions,
  CreateElementOptions,
  InfiniteCanvasRef,
  SceneState,
} from '../types';
import { DEFAULTS, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP, MAX_COORDINATE, MAX_ELEMENT_SIZE, MIN_ELEMENT_SIZE } from '../constants';
import { createConnectionId, createElementId } from '../utils/ids';
import { getDefaultElementSize } from '../utils/elementDefaults';
import { clampZoom, screenToWorldPoint, worldToScreenPoint } from '../utils/viewport';
import { deleteConnectionsForElements, deleteElementsFromMap, updateElementsInMap } from '../utils/scene';

const clampCoordinate = (val: number) => Math.min(Math.max(-MAX_COORDINATE, val), MAX_COORDINATE);
const clampDimension = (val: number) => Math.min(Math.max(MIN_ELEMENT_SIZE, val), MAX_ELEMENT_SIZE);

export type UseInfiniteCanvasApiArgs = {
  sceneRef: MutableRefObject<SceneState>;
  selectedIdsRef: MutableRefObject<string[]>;
  containerRef: RefObject<HTMLDivElement>;
  updateScene: (updater: (prev: SceneState) => SceneState) => SceneState;
  handleSelection: (ids: string[]) => void;
};

export function useInfiniteCanvasApi({
  sceneRef,
  selectedIdsRef,
  containerRef,
  updateScene,
  handleSelection,
}: UseInfiniteCanvasApiArgs): InfiniteCanvasRef {
  return useMemo(() => {
    const screenToWorld = (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return screenToWorldPoint(screenX, screenY, rect, sceneRef.current.view);
    };

    const worldToScreen = (worldX: number, worldY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return worldToScreenPoint(worldX, worldY, rect, sceneRef.current.view);
    };

    return {
      exportJson: () => sceneRef.current,
      importJson: (data: SceneState) => updateScene(() => data),

      zoomIn: (amount = ZOOM_STEP) =>
        updateScene((s) => ({
          ...s,
          view: { ...s.view, zoom: clampZoom(s.view.zoom * amount, MIN_ZOOM, MAX_ZOOM) },
        })),

      zoomOut: (amount = ZOOM_STEP) =>
        updateScene((s) => ({
          ...s,
          view: { ...s.view, zoom: clampZoom(s.view.zoom / amount, MIN_ZOOM, MAX_ZOOM) },
        })),

      fitView: () => {
        updateScene((s) => ({ ...s, view: { x: 0, y: 0, zoom: 1 } }));
      },

      selectElements: (ids: string[]) => handleSelection(ids),

      createElement: (options: CreateElementOptions) => {
        const defaults = getDefaultElementSize(options.type);

        const center = (() => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return { x: 0, y: 0 };
          return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
        })();

        const newElement: CanvasElement = {
          id: options.id || createElementId(true),
          type: options.type,
          x: clampCoordinate(options.x ?? center.x - (options.width ?? defaults.width) / 2),
          y: clampCoordinate(options.y ?? center.y - (options.height ?? defaults.height) / 2),
          width: clampDimension(options.width ?? defaults.width),
          height: clampDimension(options.height ?? defaults.height),
          rotation: options.rotation ?? DEFAULTS.rotation,
          opacity: options.opacity ?? DEFAULTS.opacity,
          backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
          strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
          strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
          text: options.text,
          componentType: options.componentType,
          props: options.props,
          locked: options.locked ?? false,
        };

        updateScene((prev) => ({
          ...prev,
          elements: { ...prev.elements, [newElement.id]: newElement },
        }));

        return newElement;
      },

      createElements: (optionsList: CreateElementOptions[]) => {
        const rect = containerRef.current?.getBoundingClientRect();
        const center = rect
          ? screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
          : { x: 0, y: 0 };

        const newElements: CanvasElement[] = optionsList.map((options) => {
          const defaults = getDefaultElementSize(options.type);
          return {
            id: options.id || createElementId(true),
            type: options.type,
            x: clampCoordinate(options.x ?? center.x - (options.width ?? defaults.width) / 2),
            y: clampCoordinate(options.y ?? center.y - (options.height ?? defaults.height) / 2),
            width: clampDimension(options.width ?? defaults.width),
            height: clampDimension(options.height ?? defaults.height),
            rotation: options.rotation ?? DEFAULTS.rotation,
            opacity: options.opacity ?? DEFAULTS.opacity,
            backgroundColor: options.backgroundColor ?? DEFAULTS.backgroundColor,
            strokeColor: options.strokeColor ?? DEFAULTS.strokeColor,
            strokeWidth: options.strokeWidth ?? DEFAULTS.strokeWidth,
            text: options.text,
            componentType: options.componentType,
            props: options.props,
            locked: options.locked ?? false,
          };
        });

        updateScene((prev) => {
          const nextElements = { ...prev.elements };
          newElements.forEach((el) => {
            nextElements[el.id] = el;
          });
          return { ...prev, elements: nextElements };
        });

        return newElements;
      },

      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        let updatedElement: CanvasElement | undefined;

        updateScene((prev) => {
          const element = prev.elements[id];
          if (!element) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[LumenBoard] updateElement: Element with id '${id}' not found`);
            }
            return prev;
          }
          
          // Basic validation/clamping
          const newWidth = updates.width !== undefined ? clampDimension(updates.width) : element.width;
          const newHeight = updates.height !== undefined ? clampDimension(updates.height) : element.height;
          const newX = updates.x !== undefined ? clampCoordinate(updates.x) : element.x;
          const newY = updates.y !== undefined ? clampCoordinate(updates.y) : element.y;
          
          updatedElement = { ...element, ...updates, x: newX, y: newY, width: newWidth, height: newHeight };
          return {
            ...prev,
            elements: { ...prev.elements, [id]: updatedElement },
          };
        });

        return updatedElement || sceneRef.current.elements[id];
      },

      updateElements: (updates: Array<{ id: string } & Partial<CanvasElement>>) => {
        let updatedElements: CanvasElement[] = [];

        updateScene((prev) => {
          const result = updateElementsInMap(prev.elements, updates);
          updatedElements = result.updated;
          return { ...prev, elements: result.elements };
        });

        return updatedElements;
      },

      deleteElement: (id: string) => {
        if (!sceneRef.current.elements[id]) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LumenBoard] deleteElement: Element with id '${id}' not found`);
          }
          return false;
        }

        updateScene((prev) => {
          const nextElements = deleteElementsFromMap(prev.elements, [id]);
          const nextConnections = deleteConnectionsForElements(prev.connections, [id]);
          return { ...prev, elements: nextElements, connections: nextConnections };
        });

        if (selectedIdsRef.current.includes(id)) {
          handleSelection(selectedIdsRef.current.filter((sid) => sid !== id));
        }
        
        return true;
      },

      deleteElements: (ids: string[]) => {
        const existingIds = ids.filter(id => Boolean(sceneRef.current.elements[id]));
        if (existingIds.length === 0) return false;

        updateScene((prev) => {
          const nextElements = deleteElementsFromMap(prev.elements, existingIds);
          const nextConnections = deleteConnectionsForElements(prev.connections, existingIds);
          return { ...prev, elements: nextElements, connections: nextConnections };
        });
        handleSelection(selectedIdsRef.current.filter((sid) => !existingIds.includes(sid)));
        
        return true;
      },

      getElement: (id: string) => sceneRef.current.elements[id],

      getElements: (ids?: string[]) => {
        if (!ids) return Object.values(sceneRef.current.elements);
        return ids.map((id) => sceneRef.current.elements[id]).filter(Boolean);
      },

      createConnection: (options: CreateConnectionOptions) => {
        const newConnection: Connection = {
          id: options.id || createConnectionId(true),
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === 'auto' ? undefined : options.sourceHandle,
          targetHandle: options.targetHandle === 'auto' ? undefined : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature,
          },
        };

        updateScene((prev) => ({
          ...prev,
          connections: [...prev.connections, newConnection],
        }));

        return newConnection;
      },

      createConnections: (optionsList: CreateConnectionOptions[]) => {
        const newConnections: Connection[] = optionsList.map((options) => ({
          id: options.id || createConnectionId(true),
          sourceId: options.sourceId,
          targetId: options.targetId,
          sourceHandle: options.sourceHandle === 'auto' ? undefined : options.sourceHandle,
          targetHandle: options.targetHandle === 'auto' ? undefined : options.targetHandle,
          style: {
            strokeColor: options.style?.strokeColor ?? DEFAULTS.strokeColor,
            width: options.style?.width ?? DEFAULTS.connectionWidth,
            curvature: options.style?.curvature ?? DEFAULTS.connectionCurvature,
          },
        }));

        updateScene((prev) => ({
          ...prev,
          connections: [...prev.connections, ...newConnections],
        }));

        return newConnections;
      },

      updateConnection: (id: string, updates: Partial<Connection>) => {
        let updatedConnection: Connection | undefined;

        updateScene((prev) => {
          const idx = prev.connections.findIndex((c) => c.id === id);
          if (idx === -1) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[LumenBoard] updateConnection: Connection with id '${id}' not found`);
            }
            return prev;
          }

          updatedConnection = { ...prev.connections[idx], ...updates };
          const newConnections = [...prev.connections];
          newConnections[idx] = updatedConnection;

          return { ...prev, connections: newConnections };
        });

        return updatedConnection || sceneRef.current.connections.find((c) => c.id === id);
      },

      deleteConnection: (id: string) => {
        const exists = sceneRef.current.connections.some(c => c.id === id);
        if (!exists) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LumenBoard] deleteConnection: Connection with id '${id}' not found`);
          }
          return false;
        }

        updateScene((prev) => ({
          ...prev,
          connections: prev.connections.filter((c) => c.id !== id),
        }));
        return true;
      },

      deleteConnections: (ids: string[]) => {
        const existingIds = ids.filter(id => sceneRef.current.connections.some(c => c.id === id));
        if (existingIds.length === 0) return false;

        updateScene((prev) => ({
          ...prev,
          connections: prev.connections.filter((c) => !existingIds.includes(c.id)),
        }));
        return true;
      },

      getConnection: (id: string) => sceneRef.current.connections.find((c) => c.id === id),

      getConnections: (elementId?: string) => {
        if (!elementId) return sceneRef.current.connections;
        return sceneRef.current.connections.filter((c) => c.sourceId === elementId || c.targetId === elementId);
      },

      getConnectionsBetween: (sourceId: string, targetId: string) => {
        return sceneRef.current.connections.filter((c) => c.sourceId === sourceId && c.targetId === targetId);
      },

      getViewportCenter: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      },

      getViewportBounds: () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0, width: 0, height: 0 };
        const tl = screenToWorld(rect.left, rect.top);
        const br = screenToWorld(rect.right, rect.bottom);
        return {
          x: tl.x,
          y: tl.y,
          width: br.x - tl.x,
          height: br.y - tl.y,
        };
      },

      screenToWorld,
      worldToScreen,

      panTo: (x: number, y: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        updateScene((s) => ({
          ...s,
          view: {
            ...s.view,
            x: centerX - x * s.view.zoom,
            y: centerY - y * s.view.zoom,
          },
        }));
      },

      panToElement: (id: string) => {
        const el = sceneRef.current.elements[id];
        if (!el) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LumenBoard] panToElement: Element with id '${id}' not found`);
          }
          return false;
        }

        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;

        const viewCX = rect.width / 2;
        const viewCY = rect.height / 2;

        updateScene((s) => ({
          ...s,
          view: {
            ...s.view,
            x: viewCX - centerX * s.view.zoom,
            y: viewCY - centerY * s.view.zoom,
          },
        }));
        return true;
      },

      setZoom: (level: number, focalPoint?: { x: number; y: number }) => {
        updateScene((s) => {
          const newZoom = clampZoom(level, MIN_ZOOM, MAX_ZOOM);

          if (!focalPoint) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return { ...s, view: { ...s.view, zoom: newZoom } };

            const viewCX = rect.width / 2;
            const viewCY = rect.height / 2;
            const worldCX = (viewCX - s.view.x) / s.view.zoom;
            const worldCY = (viewCY - s.view.y) / s.view.zoom;

            const newViewX = viewCX - worldCX * newZoom;
            const newViewY = viewCY - worldCY * newZoom;

            return { ...s, view: { x: newViewX, y: newViewY, zoom: newZoom } };
          }

          return { ...s, view: { ...s.view, zoom: newZoom } };
        });
      },

      selectAll: () => handleSelection(Object.keys(sceneRef.current.elements)),

      clearSelection: () => handleSelection([]),

      getSelectedIds: () => selectedIdsRef.current,

      focusElement: (id: string, options = {}) => {
        const el = sceneRef.current.elements[id];
        if (!el) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LumenBoard] focusElement: Element with id '${id}' not found`);
          }
          return false;
        }

        handleSelection([id]);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;

        updateScene((s) => {
          const zoom = (options as { zoom?: number }).zoom ?? s.view.zoom;
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;

          return {
            ...s,
            view: {
              x: rect.width / 2 - centerX * zoom,
              y: rect.height / 2 - centerY * zoom,
              zoom,
            },
          };
        });
        return true;
      },

      focusElements: (ids: string[], options = {}) => {
        if (ids.length === 0) return false;

        handleSelection(ids);

        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        let found = false;

        ids.forEach((id) => {
          const el = sceneRef.current.elements[id];
          if (el) {
            found = true;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
          }
        });

        if (!found) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[LumenBoard] focusElements: No elements found for ids: ${ids.join(', ')}`);
          }
          return false;
        }

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return false;

        const padding = (options as { padding?: number }).padding ?? 50;
        const contentW = maxX - minX + padding * 2;
        const contentH = maxY - minY + padding * 2;

        const zoomW = rect.width / contentW;
        const zoomH = rect.height / contentH;
        const zoom = Math.min(Math.min(zoomW, zoomH), MAX_ZOOM);

        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;

        updateScene((s) => ({
          ...s,
          view: {
            x: rect.width / 2 - centerX * zoom,
            y: rect.height / 2 - centerY * zoom,
            zoom,
          },
        }));
        return true;
      },
    };
  }, [containerRef, handleSelection, sceneRef, selectedIdsRef, updateScene]);
}
