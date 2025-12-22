import { describe, it, expect } from 'vitest';
import { deleteConnectionsForElements } from '../connections';
import type { Connection } from '../../../types';

describe('scene/connections utilities', () => {
  const createMockConnection = (id: string, sourceId: string, targetId: string): Connection => ({
    id,
    sourceId,
    targetId,
    style: {
      strokeColor: '#000000',
      width: 2,
      curvature: 0.5,
    },
  });

  describe('deleteConnectionsForElements', () => {
    it('deletes connections where element is source', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
        createMockConnection('conn-3', 'el-3', 'el-4'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1']);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.id === 'conn-1')).toBeUndefined();
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
      expect(result.find(c => c.id === 'conn-3')).toBeDefined();
    });

    it('deletes connections where element is target', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
        createMockConnection('conn-3', 'el-3', 'el-4'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-4']);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.id === 'conn-3')).toBeUndefined();
      expect(result.find(c => c.id === 'conn-1')).toBeDefined();
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('deletes connections where element is either source or target', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
        createMockConnection('conn-3', 'el-3', 'el-1'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1']);

      expect(result).toHaveLength(1);
      expect(result.find(c => c.id === 'conn-1')).toBeUndefined();
      expect(result.find(c => c.id === 'conn-3')).toBeUndefined();
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('deletes connections for multiple elements', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
        createMockConnection('conn-3', 'el-3', 'el-4'),
        createMockConnection('conn-4', 'el-4', 'el-5'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-2', 'el-4']);

      expect(result).toHaveLength(0);
    });

    it('returns original array when deleting empty element list', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
      ];

      const result = deleteConnectionsForElements(connections, []);

      expect(result).toBe(connections);
      expect(result).toHaveLength(2);
    });

    it('handles non-existent elements gracefully', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-99', 'el-100']);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.id === 'conn-1')).toBeDefined();
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('handles empty connections array', () => {
      const result = deleteConnectionsForElements([], ['el-1', 'el-2']);

      expect(result).toHaveLength(0);
    });

    it('deletes all connections when all elements are deleted', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1', 'el-2', 'el-3']);

      expect(result).toHaveLength(0);
    });

    it('preserves connections not involving deleted elements', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
        createMockConnection('conn-2', 'el-3', 'el-4'),
        createMockConnection('conn-3', 'el-5', 'el-6'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1']);

      expect(result).toHaveLength(2);
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
      expect(result.find(c => c.id === 'conn-3')).toBeDefined();
    });

    it('handles self-referencing connections', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-1'),
        createMockConnection('conn-2', 'el-2', 'el-3'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1']);

      expect(result).toHaveLength(1);
      expect(result.find(c => c.id === 'conn-1')).toBeUndefined();
      expect(result.find(c => c.id === 'conn-2')).toBeDefined();
    });

    it('returns new array reference (immutability)', () => {
      const connections = [
        createMockConnection('conn-1', 'el-1', 'el-2'),
      ];

      const result = deleteConnectionsForElements(connections, ['el-1']);

      expect(result).not.toBe(connections);
    });
  });
});
