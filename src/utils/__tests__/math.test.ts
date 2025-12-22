import { describe, it, expect } from 'vitest';
import { clampSize, snapValue, computeResize } from '../math';
import { MIN_ELEMENT_SIZE, MAX_ELEMENT_SIZE, GRID_SIZE } from '../../constants';

describe('math utilities', () => {
  describe('clampSize', () => {
    it('clamps below minimum', () => {
      expect(clampSize(10)).toBe(MIN_ELEMENT_SIZE);
      expect(clampSize(0)).toBe(MIN_ELEMENT_SIZE);
      expect(clampSize(-50)).toBe(MIN_ELEMENT_SIZE);
    });

    it('clamps above maximum', () => {
      expect(clampSize(10000)).toBe(MAX_ELEMENT_SIZE);
      expect(clampSize(6000)).toBe(MAX_ELEMENT_SIZE);
    });

    it('passes through valid values', () => {
      expect(clampSize(100)).toBe(100);
      expect(clampSize(500)).toBe(500);
      expect(clampSize(2500)).toBe(2500);
    });

    it('handles edge boundaries', () => {
      expect(clampSize(MIN_ELEMENT_SIZE)).toBe(MIN_ELEMENT_SIZE);
      expect(clampSize(MAX_ELEMENT_SIZE)).toBe(MAX_ELEMENT_SIZE);
    });
  });

  describe('snapValue', () => {
    it('snaps to grid when enabled', () => {
      expect(snapValue(23, true)).toBe(20);
      expect(snapValue(47, true)).toBe(40);
      expect(snapValue(51, true)).toBe(60);
      expect(snapValue(105, true)).toBe(100);
    });

    it('does not snap when disabled', () => {
      expect(snapValue(23, false)).toBe(23);
      expect(snapValue(47.5, false)).toBe(47.5);
      expect(snapValue(105, false)).toBe(105);
    });

    it('handles already aligned values', () => {
      expect(snapValue(0, true)).toBe(0);
      expect(snapValue(20, true)).toBe(20);
      expect(snapValue(100, true)).toBe(100);
      expect(snapValue(GRID_SIZE, true)).toBe(GRID_SIZE);
    });

    it('handles negative coordinates', () => {
      expect(snapValue(-23, true)).toBe(-20);
      expect(snapValue(-47, true)).toBe(-40);
      expect(Math.abs(snapValue(-10, true))).toBe(0);
      expect(snapValue(-31, true)).toBe(-40);
    });
  });

  describe('computeResize', () => {
    const initial = { x: 100, y: 100, width: 200, height: 150 };

    describe('corner handles - bottom-right', () => {
      it('increases size when dragging outward', () => {
        const result = computeResize(
          'bottom-right',
          initial,
          { dx: 50, dy: 30 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(initial.x);
        expect(result.y).toBe(initial.y);
        expect(result.width).toBeGreaterThan(initial.width);
        expect(result.height).toBeGreaterThan(initial.height);
      });

      it('preserves aspect ratio', () => {
        const result = computeResize(
          'bottom-right',
          initial,
          { dx: 100, dy: 50 },
          { snapToGrid: false }
        );

        const originalAspect = initial.width / initial.height;
        const newAspect = result.width / result.height;
        expect(Math.abs(originalAspect - newAspect)).toBeLessThan(0.01);
      });

      it('clamps to minimum size', () => {
        const result = computeResize(
          'bottom-right',
          initial,
          { dx: -300, dy: -300 },
          { snapToGrid: false }
        );

        expect(result.width).toBe(MIN_ELEMENT_SIZE);
        expect(result.height).toBe(MIN_ELEMENT_SIZE);
      });

      it('clamps to maximum size', () => {
        const result = computeResize(
          'bottom-right',
          initial,
          { dx: 10000, dy: 10000 },
          { snapToGrid: false }
        );

        expect(result.width).toBe(MAX_ELEMENT_SIZE);
        expect(result.height).toBe(MAX_ELEMENT_SIZE);
      });
    });

    describe('corner handles - top-left', () => {
      it('increases size when dragging outward', () => {
        const result = computeResize(
          'top-left',
          initial,
          { dx: -50, dy: -30 },
          { snapToGrid: false }
        );

        expect(result.width).toBeGreaterThan(initial.width);
        expect(result.height).toBeGreaterThan(initial.height);
      });

      it('maintains bottom-right corner position', () => {
        const result = computeResize(
          'top-left',
          initial,
          { dx: -50, dy: -30 },
          { snapToGrid: false }
        );

        const originalBottomRight = { x: initial.x + initial.width, y: initial.y + initial.height };
        const newBottomRight = { x: result.x + result.width, y: result.y + result.height };

        expect(Math.abs(newBottomRight.x - originalBottomRight.x)).toBeLessThan(1);
        expect(Math.abs(newBottomRight.y - originalBottomRight.y)).toBeLessThan(1);
      });

      it('preserves aspect ratio', () => {
        const result = computeResize(
          'top-left',
          initial,
          { dx: -100, dy: -50 },
          { snapToGrid: false }
        );

        const originalAspect = initial.width / initial.height;
        const newAspect = result.width / result.height;
        expect(Math.abs(originalAspect - newAspect)).toBeLessThan(0.01);
      });
    });

    describe('corner handles - top-right', () => {
      it('increases size when dragging outward', () => {
        const result = computeResize(
          'top-right',
          initial,
          { dx: 50, dy: -30 },
          { snapToGrid: false }
        );

        expect(result.width).toBeGreaterThan(initial.width);
        expect(result.height).toBeGreaterThan(initial.height);
      });

      it('maintains bottom-left corner position', () => {
        const result = computeResize(
          'top-right',
          initial,
          { dx: 50, dy: -30 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(initial.x);
        const originalBottom = initial.y + initial.height;
        const newBottom = result.y + result.height;
        expect(Math.abs(newBottom - originalBottom)).toBeLessThan(1);
      });

      it('preserves aspect ratio', () => {
        const result = computeResize(
          'top-right',
          initial,
          { dx: 100, dy: -50 },
          { snapToGrid: false }
        );

        const originalAspect = initial.width / initial.height;
        const newAspect = result.width / result.height;
        expect(Math.abs(originalAspect - newAspect)).toBeLessThan(0.01);
      });
    });

    describe('corner handles - bottom-left', () => {
      it('increases size when dragging outward', () => {
        const result = computeResize(
          'bottom-left',
          initial,
          { dx: -50, dy: 30 },
          { snapToGrid: false }
        );

        expect(result.width).toBeGreaterThan(initial.width);
        expect(result.height).toBeGreaterThan(initial.height);
      });

      it('maintains top-right corner position', () => {
        const result = computeResize(
          'bottom-left',
          initial,
          { dx: -50, dy: 30 },
          { snapToGrid: false }
        );

        expect(result.y).toBe(initial.y);
        const originalRight = initial.x + initial.width;
        const newRight = result.x + result.width;
        expect(Math.abs(newRight - originalRight)).toBeLessThan(1);
      });

      it('preserves aspect ratio', () => {
        const result = computeResize(
          'bottom-left',
          initial,
          { dx: -100, dy: 50 },
          { snapToGrid: false }
        );

        const originalAspect = initial.width / initial.height;
        const newAspect = result.width / result.height;
        expect(Math.abs(originalAspect - newAspect)).toBeLessThan(0.01);
      });
    });

    describe('edge handles - right-center', () => {
      it('changes only width', () => {
        const result = computeResize(
          'right-center',
          initial,
          { dx: 50, dy: 0 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(initial.x);
        expect(result.y).toBe(initial.y);
        expect(result.width).toBe(250);
        expect(result.height).toBe(initial.height);
      });

      it('does not preserve aspect ratio', () => {
        const result = computeResize(
          'right-center',
          initial,
          { dx: 100, dy: 0 },
          { snapToGrid: false }
        );

        const originalAspect = initial.width / initial.height;
        const newAspect = result.width / result.height;
        expect(newAspect).not.toBe(originalAspect);
      });
    });

    describe('edge handles - left-center', () => {
      it('changes only width and maintains right edge', () => {
        const result = computeResize(
          'left-center',
          initial,
          { dx: -50, dy: 0 },
          { snapToGrid: false }
        );

        expect(result.y).toBe(initial.y);
        expect(result.width).toBe(250);
        expect(result.height).toBe(initial.height);
        
        const originalRight = initial.x + initial.width;
        const newRight = result.x + result.width;
        expect(newRight).toBe(originalRight);
      });
    });

    describe('edge handles - bottom-center', () => {
      it('changes only height', () => {
        const result = computeResize(
          'bottom-center',
          initial,
          { dx: 0, dy: 50 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(initial.x);
        expect(result.y).toBe(initial.y);
        expect(result.width).toBe(initial.width);
        expect(result.height).toBe(200);
      });
    });

    describe('edge handles - top-center', () => {
      it('changes only height and maintains bottom edge', () => {
        const result = computeResize(
          'top-center',
          initial,
          { dx: 0, dy: -50 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(initial.x);
        expect(result.width).toBe(initial.width);
        expect(result.height).toBe(200);
        
        const originalBottom = initial.y + initial.height;
        const newBottom = result.y + result.height;
        expect(newBottom).toBe(originalBottom);
      });
    });

    describe('grid snapping', () => {
      it('snaps position and size to grid when enabled', () => {
        const result = computeResize(
          'bottom-right',
          { x: 103, y: 107, width: 203, height: 157 },
          { dx: 50, dy: 30 },
          { snapToGrid: true }
        );

        expect(result.x % GRID_SIZE).toBe(0);
        expect(result.y % GRID_SIZE).toBe(0);
        expect(result.width % GRID_SIZE).toBe(0);
        expect(result.height % GRID_SIZE).toBe(0);
      });

      it('does not snap when disabled', () => {
        const result = computeResize(
          'bottom-right',
          { x: 103, y: 107, width: 203, height: 157 },
          { dx: 13, dy: 17 },
          { snapToGrid: false }
        );

        expect(result.x).toBe(103);
        expect(result.y).toBe(107);
      });
    });

    describe('edge cases', () => {
      it('handles zero height initial dimensions', () => {
        const result = computeResize(
          'bottom-right',
          { x: 100, y: 100, width: 200, height: 0 },
          { dx: 50, dy: 50 },
          { snapToGrid: false }
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });

      it('handles very small initial dimensions', () => {
        const result = computeResize(
          'bottom-right',
          { x: 100, y: 100, width: MIN_ELEMENT_SIZE, height: MIN_ELEMENT_SIZE },
          { dx: 100, dy: 100 },
          { snapToGrid: false }
        );

        expect(result.width).toBeGreaterThan(MIN_ELEMENT_SIZE);
        expect(result.height).toBeGreaterThan(MIN_ELEMENT_SIZE);
      });
    });
  });
});
