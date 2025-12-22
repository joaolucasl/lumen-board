import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteCanvasApi } from '../useInfiniteCanvasApi';
import type { SceneState } from '../../types';
import { INITIAL_STATE, MIN_ELEMENT_SIZE, MAX_ELEMENT_SIZE, MAX_COORDINATE } from '../../constants';

describe('useInfiniteCanvasApi - Element CRUD', () => {
  const createMockArgs = () => {
    const scene: SceneState = { ...INITIAL_STATE };
    const sceneRef = { current: scene };
    const selectedIdsRef = { current: [] as string[] };
    const containerRef = { current: null } as React.RefObject<HTMLDivElement>;
    
    const updateScene = vi.fn((updater: (prev: SceneState) => SceneState) => {
      const next = updater(sceneRef.current);
      sceneRef.current = next;
      return next;
    });
    
    const handleSelection = vi.fn((ids: string[]) => {
      selectedIdsRef.current = ids;
    });

    return { sceneRef, selectedIdsRef, containerRef, updateScene, handleSelection };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createElement', () => {
    it('creates element with default values', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({ type: 'rectangle' });
      });

      expect(element!.type).toBe('rectangle');
      expect(element!.id).toBeDefined();
      expect(element!.id).toMatch(/^el_/);
      expect(element!.opacity).toBe(1);
      expect(element!.locked).toBe(false);
      expect(element!.rotation).toBe(0);
      expect(args.updateScene).toHaveBeenCalled();
    });

    it('creates element with custom values', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'ellipse',
          x: 50,
          y: 75,
          width: 200,
          height: 150,
          backgroundColor: '#ff0000',
          strokeColor: '#00ff00',
          strokeWidth: 3,
          opacity: 0.8,
          rotation: 45,
          locked: true,
        });
      });

      expect(element!.type).toBe('ellipse');
      expect(element!.x).toBe(50);
      expect(element!.y).toBe(75);
      expect(element!.width).toBe(200);
      expect(element!.height).toBe(150);
      expect(element!.backgroundColor).toBe('#ff0000');
      expect(element!.strokeColor).toBe('#00ff00');
      expect(element!.strokeWidth).toBe(3);
      expect(element!.opacity).toBe(0.8);
      expect(element!.rotation).toBe(45);
      expect(element!.locked).toBe(true);
    });

    it('clamps dimensions to valid range', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'rectangle',
          width: 10,
          height: 10000,
        });
      });

      expect(element!.width).toBe(MIN_ELEMENT_SIZE);
      expect(element!.height).toBe(MAX_ELEMENT_SIZE);
    });

    it('clamps coordinates to valid range', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'rectangle',
          x: MAX_COORDINATE + 1000,
          y: -MAX_COORDINATE - 1000,
        });
      });

      expect(element!.x).toBe(MAX_COORDINATE);
      expect(element!.y).toBe(-MAX_COORDINATE);
    });

    it('uses custom id when provided', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'rectangle',
          id: 'custom-id-123',
        });
      });

      expect(element!.id).toBe('custom-id-123');
    });

    it('creates text element with text property', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'text',
          text: 'Hello World',
        });
      });

      expect(element!.type).toBe('text');
      expect(element!.text).toBe('Hello World');
    });

    it('creates custom element with componentType and props', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({
          type: 'custom',
          componentType: 'MyComponent',
          props: { foo: 'bar', count: 42 },
        });
      });

      expect(element!.type).toBe('custom');
      expect(element!.componentType).toBe('MyComponent');
      expect(element!.props).toEqual({ foo: 'bar', count: 42 });
    });

    it('adds element to scene state', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let element: ReturnType<typeof result.current.createElement>;
      act(() => {
        element = result.current.createElement({ type: 'rectangle' });
      });

      expect(args.sceneRef.current.elements[element!.id]).toBeDefined();
      expect(args.sceneRef.current.elements[element!.id]).toEqual(element);
    });
  });

  describe('updateElement', () => {
    it('updates existing element properties', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 100, y: 100, width: 150, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElement>;
      act(() => {
        updated = result.current.updateElement('el-1', { x: 200, y: 250 });
      });

      expect(updated!.x).toBe(200);
      expect(updated!.y).toBe(250);
      expect(updated!.width).toBe(150);
      expect(updated!.height).toBe(100);
    });

    it('clamps updated dimensions', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 100, y: 100, width: 150, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElement>;
      act(() => {
        updated = result.current.updateElement('el-1', { width: 5, height: 10000 });
      });

      expect(updated!.width).toBe(MIN_ELEMENT_SIZE);
      expect(updated!.height).toBe(MAX_ELEMENT_SIZE);
    });

    it('clamps updated coordinates', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 100, y: 100, width: 150, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElement>;
      act(() => {
        updated = result.current.updateElement('el-1', { 
          x: MAX_COORDINATE + 1000, 
          y: -MAX_COORDINATE - 1000 
        });
      });

      expect(updated!.x).toBe(MAX_COORDINATE);
      expect(updated!.y).toBe(-MAX_COORDINATE);
    });

    it('returns undefined for non-existent element', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElement>;
      act(() => {
        updated = result.current.updateElement('non-existent', { x: 200 });
      });

      expect(updated).toBeUndefined();
      expect(args.updateScene).toHaveBeenCalled();
    });

    it('updates element in scene state', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 100, y: 100, width: 150, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.updateElement('el-1', { x: 200, backgroundColor: '#ff0000' });
      });

      expect(args.sceneRef.current.elements['el-1'].x).toBe(200);
      expect(args.sceneRef.current.elements['el-1'].backgroundColor).toBe('#ff0000');
    });
  });

  describe('deleteElement', () => {
    it('deletes existing element and returns true', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 0, y: 0, width: 100, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteElement('el-1');
      });

      expect(deleted!).toBe(true);
      expect(args.sceneRef.current.elements['el-1']).toBeUndefined();
    });

    it('returns false for non-existent element', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteElement('non-existent');
      });

      expect(deleted!).toBe(false);
    });

    it('removes deleted element from selection', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 0, y: 0, width: 100, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
          'el-2': {
            id: 'el-2',
            type: 'rectangle',
            x: 200, y: 0, width: 100, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };
      args.selectedIdsRef.current = ['el-1', 'el-2'];

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElement('el-1');
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-2']);
    });

    it('deletes connections involving the element', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'rectangle', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElement('el-1');
      });

      expect(args.sceneRef.current.connections).toHaveLength(0);
    });
  });

  describe('getElement', () => {
    it('returns element by id', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 100, y: 100, width: 150, height: 100,
            rotation: 0, opacity: 1, locked: false,
          },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const element = result.current.getElement('el-1');

      expect(element).toBeDefined();
      expect(element!.id).toBe('el-1');
      expect(element!.type).toBe('rectangle');
    });

    it('returns undefined for non-existent element', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const element = result.current.getElement('non-existent');

      expect(element).toBeUndefined();
    });
  });

  describe('getElements', () => {
    it('returns all elements when no ids provided', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const elements = result.current.getElements();

      expect(elements).toHaveLength(2);
      expect(elements.find(e => e.id === 'el-1')).toBeDefined();
      expect(elements.find(e => e.id === 'el-2')).toBeDefined();
    });

    it('returns specific elements by ids', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-3': { id: 'el-3', type: 'diamond', x: 400, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const elements = result.current.getElements(['el-1', 'el-3']);

      expect(elements).toHaveLength(2);
      expect(elements.find(e => e.id === 'el-1')).toBeDefined();
      expect(elements.find(e => e.id === 'el-3')).toBeDefined();
      expect(elements.find(e => e.id === 'el-2')).toBeUndefined();
    });

    it('filters out non-existent elements', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const elements = result.current.getElements(['el-1', 'non-existent']);

      expect(elements).toHaveLength(1);
      expect(elements[0].id).toBe('el-1');
    });
  });
});
