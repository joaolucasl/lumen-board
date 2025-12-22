import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteCanvasApi } from '../useInfiniteCanvasApi';
import type { SceneState } from '../../types';
import { INITIAL_STATE } from '../../constants';

describe('useInfiniteCanvasApi - Bulk Operations', () => {
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

  describe('createElements', () => {
    it('creates multiple elements in batch', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let elements: ReturnType<typeof result.current.createElements>;
      act(() => {
        elements = result.current.createElements([
          { type: 'rectangle', x: 100, y: 100 },
          { type: 'ellipse', x: 200, y: 200 },
          { type: 'diamond', x: 300, y: 300 },
        ]);
      });

      expect(elements!).toHaveLength(3);
      expect(elements![0].type).toBe('rectangle');
      expect(elements![1].type).toBe('ellipse');
      expect(elements![2].type).toBe('diamond');
      expect(args.sceneRef.current.elements[elements![0].id]).toBeDefined();
      expect(args.sceneRef.current.elements[elements![1].id]).toBeDefined();
      expect(args.sceneRef.current.elements[elements![2].id]).toBeDefined();
    });

    it('creates empty array when given empty input', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let elements: ReturnType<typeof result.current.createElements>;
      act(() => {
        elements = result.current.createElements([]);
      });

      expect(elements!).toHaveLength(0);
    });

    it('generates unique ids for all elements', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let elements: ReturnType<typeof result.current.createElements>;
      act(() => {
        elements = result.current.createElements([
          { type: 'rectangle' },
          { type: 'rectangle' },
          { type: 'rectangle' },
        ]);
      });

      const ids = elements!.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('respects custom ids when provided', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let elements: ReturnType<typeof result.current.createElements>;
      act(() => {
        elements = result.current.createElements([
          { type: 'rectangle', id: 'custom-1' },
          { type: 'ellipse', id: 'custom-2' },
        ]);
      });

      expect(elements![0].id).toBe('custom-1');
      expect(elements![1].id).toBe('custom-2');
    });
  });

  describe('updateElements', () => {
    it('updates multiple elements in batch', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 150, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 200, width: 150, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-3': { id: 'el-3', type: 'diamond', x: 300, y: 300, width: 150, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElements>;
      act(() => {
        updated = result.current.updateElements([
          { id: 'el-1', x: 150 },
          { id: 'el-3', y: 350 },
        ]);
      });

      expect(updated!).toHaveLength(2);
      expect(args.sceneRef.current.elements['el-1'].x).toBe(150);
      expect(args.sceneRef.current.elements['el-2'].x).toBe(200);
      expect(args.sceneRef.current.elements['el-3'].y).toBe(350);
    });

    it('returns empty array when given empty input', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElements>;
      act(() => {
        updated = result.current.updateElements([]);
      });

      expect(updated!).toHaveLength(0);
    });

    it('skips non-existent elements', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 150, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateElements>;
      act(() => {
        updated = result.current.updateElements([
          { id: 'el-1', x: 150 },
          { id: 'non-existent', x: 999 },
        ]);
      });

      expect(updated!).toHaveLength(1);
      expect(updated![0].id).toBe('el-1');
    });
  });

  describe('deleteElements', () => {
    it('deletes multiple elements in batch', () => {
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

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteElements(['el-1', 'el-3']);
      });

      expect(deleted!).toBe(true);
      expect(args.sceneRef.current.elements['el-1']).toBeUndefined();
      expect(args.sceneRef.current.elements['el-2']).toBeDefined();
      expect(args.sceneRef.current.elements['el-3']).toBeUndefined();
    });

    it('returns false when no elements exist', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteElements(['non-existent']);
      });

      expect(deleted!).toBe(false);
    });

    it('deletes only existing elements and returns true', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteElements(['el-1', 'non-existent']);
      });

      expect(deleted!).toBe(true);
      expect(args.sceneRef.current.elements['el-1']).toBeUndefined();
    });

    it('removes deleted elements from selection', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-3': { id: 'el-3', type: 'diamond', x: 400, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };
      args.selectedIdsRef.current = ['el-1', 'el-2', 'el-3'];

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElements(['el-1', 'el-3']);
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-2']);
    });

    it('deletes connections involving deleted elements', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-3': { id: 'el-3', type: 'diamond', x: 400, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElements(['el-1', 'el-3']);
      });

      expect(args.sceneRef.current.connections).toHaveLength(0);
    });
  });
});
