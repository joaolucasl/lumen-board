import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteCanvasApi } from '../useInfiniteCanvasApi';
import type { SceneState } from '../../types';
import { INITIAL_STATE } from '../../constants';

describe('useInfiniteCanvasApi - Selection Management', () => {
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

  describe('selectElements', () => {
    it('selects single element', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.selectElements(['el-1']);
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-1']);
    });

    it('selects multiple elements', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.selectElements(['el-1', 'el-2', 'el-3']);
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-1', 'el-2', 'el-3']);
    });

    it('replaces previous selection', () => {
      const args = createMockArgs();
      args.selectedIdsRef.current = ['el-1', 'el-2'];
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.selectElements(['el-3']);
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-3']);
    });

    it('accepts empty array', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.selectElements([]);
      });

      expect(args.handleSelection).toHaveBeenCalledWith([]);
    });
  });

  describe('selectAll', () => {
    it('selects all elements in scene', () => {
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

      act(() => {
        result.current.selectAll();
      });

      expect(args.handleSelection).toHaveBeenCalledWith(
        expect.arrayContaining(['el-1', 'el-2', 'el-3'])
      );
      expect(args.handleSelection.mock.calls[0][0]).toHaveLength(3);
    });

    it('selects empty array when no elements exist', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.selectAll();
      });

      expect(args.handleSelection).toHaveBeenCalledWith([]);
    });
  });

  describe('clearSelection', () => {
    it('clears current selection', () => {
      const args = createMockArgs();
      args.selectedIdsRef.current = ['el-1', 'el-2', 'el-3'];
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.clearSelection();
      });

      expect(args.handleSelection).toHaveBeenCalledWith([]);
    });

    it('works when no selection exists', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.clearSelection();
      });

      expect(args.handleSelection).toHaveBeenCalledWith([]);
    });
  });

  describe('getSelectedIds', () => {
    it('returns current selection', () => {
      const args = createMockArgs();
      args.selectedIdsRef.current = ['el-1', 'el-2'];
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const selected = result.current.getSelectedIds();

      expect(selected).toEqual(['el-1', 'el-2']);
    });

    it('returns empty array when no selection', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const selected = result.current.getSelectedIds();

      expect(selected).toEqual([]);
    });
  });

  describe('selection cleanup on delete', () => {
    it('removes deleted element from selection', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };
      args.selectedIdsRef.current = ['el-1', 'el-2'];

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElement('el-1');
      });

      expect(args.handleSelection).toHaveBeenCalledWith(['el-2']);
    });

    it('removes all deleted elements from selection in bulk delete', () => {
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

    it('does not modify selection when deleting unselected element', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };
      args.selectedIdsRef.current = ['el-1'];

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElement('el-2');
      });

      expect(args.handleSelection).not.toHaveBeenCalled();
    });

    it('clears selection when all selected elements are deleted', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        elements: {
          'el-1': { id: 'el-1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
          'el-2': { id: 'el-2', type: 'ellipse', x: 200, y: 0, width: 100, height: 100, rotation: 0, opacity: 1, locked: false },
        },
      };
      args.selectedIdsRef.current = ['el-1', 'el-2'];

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.deleteElements(['el-1', 'el-2']);
      });

      expect(args.handleSelection).toHaveBeenCalledWith([]);
    });
  });
});
