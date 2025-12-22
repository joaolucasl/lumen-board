import { describe, it, expect } from 'vitest';
import { screenToWorldPoint, worldToScreenPoint, clampZoom } from '../viewport';
import type { ViewState } from '../../types';

describe('viewport utilities', () => {
  const mockRect = {
    left: 100,
    top: 50,
    width: 800,
    height: 600,
    right: 900,
    bottom: 650,
  };

  describe('screenToWorldPoint', () => {
    it('converts screen coordinates to world coordinates at zoom 1', () => {
      const view: ViewState = { x: 0, y: 0, zoom: 1 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('accounts for view offset (pan)', () => {
      const view: ViewState = { x: 50, y: 25, zoom: 1 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(50);
      expect(result.y).toBe(75);
    });

    it('accounts for zoom level', () => {
      const view: ViewState = { x: 0, y: 0, zoom: 2 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(50);
      expect(result.y).toBe(50);
    });

    it('handles combined pan and zoom', () => {
      const view: ViewState = { x: 100, y: 50, zoom: 0.5 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(100);
    });

    it('handles negative world coordinates', () => {
      const view: ViewState = { x: 200, y: 100, zoom: 1 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(-100);
      expect(result.y).toBe(0);
    });

    it('handles high zoom levels', () => {
      const view: ViewState = { x: 0, y: 0, zoom: 5 };
      const result = screenToWorldPoint(200, 150, mockRect, view);
      
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
    });
  });

  describe('worldToScreenPoint', () => {
    it('converts world coordinates to screen coordinates at zoom 1', () => {
      const view: ViewState = { x: 0, y: 0, zoom: 1 };
      const result = worldToScreenPoint(100, 100, mockRect, view);
      
      expect(result.x).toBe(200);
      expect(result.y).toBe(150);
    });

    it('is the inverse of screenToWorldPoint', () => {
      const view: ViewState = { x: 50, y: 25, zoom: 1.5 };
      const screenX = 300;
      const screenY = 200;
      
      const world = screenToWorldPoint(screenX, screenY, mockRect, view);
      const backToScreen = worldToScreenPoint(world.x, world.y, mockRect, view);
      
      expect(backToScreen.x).toBeCloseTo(screenX, 5);
      expect(backToScreen.y).toBeCloseTo(screenY, 5);
    });

    it('handles negative world coordinates', () => {
      const view: ViewState = { x: 0, y: 0, zoom: 1 };
      const result = worldToScreenPoint(-50, -30, mockRect, view);
      
      expect(result.x).toBe(50);
      expect(result.y).toBe(20);
    });

    it('handles zoom and pan together', () => {
      const view: ViewState = { x: 100, y: 50, zoom: 2 };
      const result = worldToScreenPoint(50, 40, mockRect, view);
      
      expect(result.x).toBe(300);
      expect(result.y).toBe(180);
    });
  });

  describe('clampZoom', () => {
    it('clamps below minimum', () => {
      expect(clampZoom(0.05, 0.1, 5)).toBe(0.1);
    });

    it('clamps above maximum', () => {
      expect(clampZoom(10, 0.1, 5)).toBe(5);
    });

    it('passes through valid values', () => {
      expect(clampZoom(2, 0.1, 5)).toBe(2);
    });

    it('handles edge values', () => {
      expect(clampZoom(0.1, 0.1, 5)).toBe(0.1);
      expect(clampZoom(5, 0.1, 5)).toBe(5);
    });

    it('handles zero and negative values', () => {
      expect(clampZoom(0, 0.1, 5)).toBe(0.1);
      expect(clampZoom(-1, 0.1, 5)).toBe(0.1);
    });
  });
});
