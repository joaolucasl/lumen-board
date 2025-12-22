import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteCanvasApi } from '../useInfiniteCanvasApi';
import type { SceneState } from '../../types';
import { INITIAL_STATE } from '../../constants';

describe('useInfiniteCanvasApi - Connections', () => {
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

  describe('createConnection', () => {
    it('creates connection with default values', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
        });
      });

      expect(connection!.sourceId).toBe('el-1');
      expect(connection!.targetId).toBe('el-2');
      expect(connection!.id).toBeDefined();
      expect(connection!.id).toMatch(/^conn_/);
      expect(connection!.style?.strokeColor).toBe('#000000');
      expect(connection!.style?.width).toBe(2);
      expect(connection!.style?.curvature).toBe(0.5);
    });

    it('creates connection with custom style', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
          style: {
            strokeColor: '#ff0000',
            width: 4,
            curvature: 0.8,
          },
        });
      });

      expect(connection!.style?.strokeColor).toBe('#ff0000');
      expect(connection!.style?.width).toBe(4);
      expect(connection!.style?.curvature).toBe(0.8);
    });

    it('creates connection with handles', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
          sourceHandle: 'right',
          targetHandle: 'left',
        });
      });

      expect(connection!.sourceHandle).toBe('right');
      expect(connection!.targetHandle).toBe('left');
    });

    it('ignores auto handles', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
          sourceHandle: 'auto',
          targetHandle: 'auto',
        });
      });

      expect(connection!.sourceHandle).toBeUndefined();
      expect(connection!.targetHandle).toBeUndefined();
    });

    it('uses custom id when provided', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
          id: 'custom-conn-123',
        });
      });

      expect(connection!.id).toBe('custom-conn-123');
    });

    it('adds connection to scene state', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connection: ReturnType<typeof result.current.createConnection>;
      act(() => {
        connection = result.current.createConnection({
          sourceId: 'el-1',
          targetId: 'el-2',
        });
      });

      expect(args.sceneRef.current.connections).toHaveLength(1);
      expect(args.sceneRef.current.connections[0]).toEqual(connection);
    });
  });

  describe('createConnections', () => {
    it('creates multiple connections in batch', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connections: ReturnType<typeof result.current.createConnections>;
      act(() => {
        connections = result.current.createConnections([
          { sourceId: 'el-1', targetId: 'el-2' },
          { sourceId: 'el-2', targetId: 'el-3' },
          { sourceId: 'el-3', targetId: 'el-4' },
        ]);
      });

      expect(connections!).toHaveLength(3);
      expect(args.sceneRef.current.connections).toHaveLength(3);
    });

    it('generates unique ids for all connections', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let connections: ReturnType<typeof result.current.createConnections>;
      act(() => {
        connections = result.current.createConnections([
          { sourceId: 'el-1', targetId: 'el-2' },
          { sourceId: 'el-2', targetId: 'el-3' },
        ]);
      });

      const ids = connections!.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(2);
    });
  });

  describe('updateConnection', () => {
    it('updates existing connection', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          {
            id: 'conn-1',
            sourceId: 'el-1',
            targetId: 'el-2',
            style: { strokeColor: '#000000', width: 2, curvature: 0.5 },
          },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateConnection>;
      act(() => {
        updated = result.current.updateConnection('conn-1', {
          style: { strokeColor: '#ff0000', width: 4, curvature: 0.8 },
        });
      });

      expect(updated!.style?.strokeColor).toBe('#ff0000');
      expect(updated!.style?.width).toBe(4);
      expect(updated!.style?.curvature).toBe(0.8);
    });

    it('returns undefined for non-existent connection', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let updated: ReturnType<typeof result.current.updateConnection>;
      act(() => {
        updated = result.current.updateConnection('non-existent', {
          style: { strokeColor: '#ff0000', width: 4, curvature: 0.8 },
        });
      });

      expect(updated).toBeUndefined();
    });

    it('updates connection in scene state', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          {
            id: 'conn-1',
            sourceId: 'el-1',
            targetId: 'el-2',
            style: { strokeColor: '#000000', width: 2, curvature: 0.5 },
          },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      act(() => {
        result.current.updateConnection('conn-1', {
          sourceHandle: 'right',
          targetHandle: 'left',
        });
      });

      expect(args.sceneRef.current.connections[0].sourceHandle).toBe('right');
      expect(args.sceneRef.current.connections[0].targetHandle).toBe('left');
    });
  });

  describe('deleteConnection', () => {
    it('deletes existing connection and returns true', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteConnection('conn-1');
      });

      expect(deleted!).toBe(true);
      expect(args.sceneRef.current.connections).toHaveLength(1);
      expect(args.sceneRef.current.connections[0].id).toBe('conn-2');
    });

    it('returns false for non-existent connection', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteConnection('non-existent');
      });

      expect(deleted!).toBe(false);
    });
  });

  describe('deleteConnections', () => {
    it('deletes multiple connections in batch', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-3', sourceId: 'el-3', targetId: 'el-4', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteConnections(['conn-1', 'conn-3']);
      });

      expect(deleted!).toBe(true);
      expect(args.sceneRef.current.connections).toHaveLength(1);
      expect(args.sceneRef.current.connections[0].id).toBe('conn-2');
    });

    it('returns false when no connections exist', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteConnections(['non-existent']);
      });

      expect(deleted!).toBe(false);
    });
  });

  describe('getConnection', () => {
    it('returns connection by id', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connection = result.current.getConnection('conn-1');

      expect(connection).toBeDefined();
      expect(connection!.id).toBe('conn-1');
      expect(connection!.sourceId).toBe('el-1');
      expect(connection!.targetId).toBe('el-2');
    });

    it('returns undefined for non-existent connection', () => {
      const args = createMockArgs();
      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connection = result.current.getConnection('non-existent');

      expect(connection).toBeUndefined();
    });
  });

  describe('getConnections', () => {
    it('returns all connections when no elementId provided', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connections = result.current.getConnections();

      expect(connections).toHaveLength(2);
    });

    it('returns connections for specific element', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-3', sourceId: 'el-3', targetId: 'el-4', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connections = result.current.getConnections('el-2');

      expect(connections).toHaveLength(2);
      expect(connections.find(c => c.id === 'conn-1')).toBeDefined();
      expect(connections.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('returns empty array for element with no connections', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connections = result.current.getConnections('el-99');

      expect(connections).toHaveLength(0);
    });
  });

  describe('getConnectionsBetween', () => {
    it('returns connections between two specific elements', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
          { id: 'conn-2', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#f00', width: 3, curvature: 0.7 } },
          { id: 'conn-3', sourceId: 'el-2', targetId: 'el-3', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connections = result.current.getConnectionsBetween('el-1', 'el-2');

      expect(connections).toHaveLength(2);
      expect(connections.find(c => c.id === 'conn-1')).toBeDefined();
      expect(connections.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('returns empty array when no connections exist between elements', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const connections = result.current.getConnectionsBetween('el-1', 'el-3');

      expect(connections).toHaveLength(0);
    });

    it('is directional (source to target)', () => {
      const args = createMockArgs();
      args.sceneRef.current = {
        ...INITIAL_STATE,
        connections: [
          { id: 'conn-1', sourceId: 'el-1', targetId: 'el-2', style: { strokeColor: '#000', width: 2, curvature: 0.5 } },
        ],
      };

      const { result } = renderHook(() => useInfiniteCanvasApi(args));

      const forward = result.current.getConnectionsBetween('el-1', 'el-2');
      const reverse = result.current.getConnectionsBetween('el-2', 'el-1');

      expect(forward).toHaveLength(1);
      expect(reverse).toHaveLength(0);
    });
  });
});
