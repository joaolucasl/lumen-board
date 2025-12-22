import { describe, it, expect } from 'vitest';
import { deleteElementsFromMap, updateElementsInMap } from '../elements';
import type { CanvasElement } from '../../../types';

describe('scene/elements utilities', () => {
  const createMockElement = (id: string, overrides?: Partial<CanvasElement>): CanvasElement => ({
    id,
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 150,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    backgroundColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    ...overrides,
  });

  describe('deleteElementsFromMap', () => {
    it('deletes single element from map', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
        'el-3': createMockElement('el-3'),
      };

      const result = deleteElementsFromMap(elements, ['el-2']);

      expect(result).toHaveProperty('el-1');
      expect(result).toHaveProperty('el-3');
      expect(result).not.toHaveProperty('el-2');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('deletes multiple elements from map', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
        'el-3': createMockElement('el-3'),
        'el-4': createMockElement('el-4'),
      };

      const result = deleteElementsFromMap(elements, ['el-2', 'el-4']);

      expect(result).toHaveProperty('el-1');
      expect(result).toHaveProperty('el-3');
      expect(result).not.toHaveProperty('el-2');
      expect(result).not.toHaveProperty('el-4');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('returns original map when deleting empty array', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
      };

      const result = deleteElementsFromMap(elements, []);

      expect(result).toBe(elements);
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('handles deleting non-existent elements gracefully', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
      };

      const result = deleteElementsFromMap(elements, ['el-3', 'el-4']);

      expect(result).toHaveProperty('el-1');
      expect(result).toHaveProperty('el-2');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('handles mixed existing and non-existent elements', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
        'el-3': createMockElement('el-3'),
      };

      const result = deleteElementsFromMap(elements, ['el-2', 'el-99']);

      expect(result).toHaveProperty('el-1');
      expect(result).toHaveProperty('el-3');
      expect(result).not.toHaveProperty('el-2');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('returns new object reference (immutability)', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
      };

      const result = deleteElementsFromMap(elements, ['el-2']);

      expect(result).not.toBe(elements);
    });

    it('handles deleting all elements', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
        'el-2': createMockElement('el-2'),
      };

      const result = deleteElementsFromMap(elements, ['el-1', 'el-2']);

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('updateElementsInMap', () => {
    it('updates single element property', () => {
      const elements = {
        'el-1': createMockElement('el-1', { x: 100, y: 100 }),
        'el-2': createMockElement('el-2', { x: 200, y: 200 }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 150 },
      ]);

      expect(result.elements['el-1'].x).toBe(150);
      expect(result.elements['el-1'].y).toBe(100);
      expect(result.elements['el-2'].x).toBe(200);
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].id).toBe('el-1');
    });

    it('updates multiple properties of single element', () => {
      const elements = {
        'el-1': createMockElement('el-1', { x: 100, y: 100, width: 150, height: 100 }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 200, y: 250, width: 300 },
      ]);

      expect(result.elements['el-1'].x).toBe(200);
      expect(result.elements['el-1'].y).toBe(250);
      expect(result.elements['el-1'].width).toBe(300);
      expect(result.elements['el-1'].height).toBe(100);
    });

    it('updates multiple elements in batch', () => {
      const elements = {
        'el-1': createMockElement('el-1', { x: 100 }),
        'el-2': createMockElement('el-2', { x: 200 }),
        'el-3': createMockElement('el-3', { x: 300 }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 150 },
        { id: 'el-3', x: 350 },
      ]);

      expect(result.elements['el-1'].x).toBe(150);
      expect(result.elements['el-2'].x).toBe(200);
      expect(result.elements['el-3'].x).toBe(350);
      expect(result.updated).toHaveLength(2);
    });

    it('returns empty updated array when updating empty array', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
      };

      const result = updateElementsInMap(elements, []);

      expect(result.elements).toBe(elements);
      expect(result.updated).toHaveLength(0);
    });

    it('skips non-existent elements', () => {
      const elements = {
        'el-1': createMockElement('el-1', { x: 100 }),
        'el-2': createMockElement('el-2', { x: 200 }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 150 },
        { id: 'el-99', x: 999 },
      ]);

      expect(result.elements['el-1'].x).toBe(150);
      expect(result.elements['el-2'].x).toBe(200);
      expect(result.elements['el-99']).toBeUndefined();
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].id).toBe('el-1');
    });

    it('returns new object reference (immutability)', () => {
      const elements = {
        'el-1': createMockElement('el-1'),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 150 },
      ]);

      expect(result.elements).not.toBe(elements);
    });

    it('preserves all original properties not being updated', () => {
      const elements = {
        'el-1': createMockElement('el-1', {
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          rotation: 45,
          opacity: 0.8,
          backgroundColor: '#ff0000',
          strokeColor: '#00ff00',
          strokeWidth: 3,
          locked: true,
        }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', x: 200 },
      ]);

      const updated = result.elements['el-1'];
      expect(updated.x).toBe(200);
      expect(updated.y).toBe(100);
      expect(updated.width).toBe(150);
      expect(updated.height).toBe(100);
      expect(updated.rotation).toBe(45);
      expect(updated.opacity).toBe(0.8);
      expect(updated.backgroundColor).toBe('#ff0000');
      expect(updated.strokeColor).toBe('#00ff00');
      expect(updated.strokeWidth).toBe(3);
      expect(updated.locked).toBe(true);
    });

    it('can update element type', () => {
      const elements = {
        'el-1': createMockElement('el-1', { type: 'rectangle' }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', type: 'ellipse' },
      ]);

      expect(result.elements['el-1'].type).toBe('ellipse');
    });

    it('can update locked status', () => {
      const elements = {
        'el-1': createMockElement('el-1', { locked: false }),
      };

      const result = updateElementsInMap(elements, [
        { id: 'el-1', locked: true },
      ]);

      expect(result.elements['el-1'].locked).toBe(true);
    });
  });
});
