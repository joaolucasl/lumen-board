import { describe, it, expect } from 'vitest';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  WHEEL_ZOOM_STEP,
  MIN_ELEMENT_SIZE,
  MAX_ELEMENT_SIZE,
  MAX_COORDINATE,
  GRID_SIZE,
  DEFAULT_ELEMENT_WIDTH,
  DEFAULT_ELEMENT_HEIGHT,
  DEFAULT_TEXT_WIDTH,
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_CUSTOM_WIDTH,
  DEFAULT_CUSTOM_HEIGHT,
} from '../index';

describe('constants validation', () => {
  describe('zoom constants', () => {
    it('MIN_ZOOM is less than MAX_ZOOM', () => {
      expect(MIN_ZOOM).toBeLessThan(MAX_ZOOM);
    });

    it('MIN_ZOOM is positive', () => {
      expect(MIN_ZOOM).toBeGreaterThan(0);
    });

    it('MAX_ZOOM is reasonable', () => {
      expect(MAX_ZOOM).toBeGreaterThan(1);
      expect(MAX_ZOOM).toBeLessThan(100);
    });

    it('ZOOM_STEP is greater than 1 for zoom in', () => {
      expect(ZOOM_STEP).toBeGreaterThan(1);
    });

    it('WHEEL_ZOOM_STEP is positive and small', () => {
      expect(WHEEL_ZOOM_STEP).toBeGreaterThan(0);
      expect(WHEEL_ZOOM_STEP).toBeLessThan(1);
    });
  });

  describe('element size constants', () => {
    it('MIN_ELEMENT_SIZE is less than MAX_ELEMENT_SIZE', () => {
      expect(MIN_ELEMENT_SIZE).toBeLessThan(MAX_ELEMENT_SIZE);
    });

    it('MIN_ELEMENT_SIZE is positive', () => {
      expect(MIN_ELEMENT_SIZE).toBeGreaterThan(0);
    });

    it('MAX_ELEMENT_SIZE is reasonable', () => {
      expect(MAX_ELEMENT_SIZE).toBeGreaterThan(100);
      expect(MAX_ELEMENT_SIZE).toBeLessThan(100000);
    });

    it('MAX_COORDINATE is very large', () => {
      expect(MAX_COORDINATE).toBeGreaterThan(MAX_ELEMENT_SIZE);
      expect(MAX_COORDINATE).toBeGreaterThan(10000);
    });
  });

  describe('grid constants', () => {
    it('GRID_SIZE is positive', () => {
      expect(GRID_SIZE).toBeGreaterThan(0);
    });

    it('GRID_SIZE is reasonable for snapping', () => {
      expect(GRID_SIZE).toBeGreaterThanOrEqual(10);
      expect(GRID_SIZE).toBeLessThanOrEqual(100);
    });
  });

  describe('default dimensions', () => {
    it('default element dimensions are within valid range', () => {
      expect(DEFAULT_ELEMENT_WIDTH).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_ELEMENT_WIDTH).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
      expect(DEFAULT_ELEMENT_HEIGHT).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_ELEMENT_HEIGHT).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
    });

    it('default text dimensions are within valid range', () => {
      expect(DEFAULT_TEXT_WIDTH).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_TEXT_WIDTH).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
      expect(DEFAULT_TEXT_HEIGHT).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_TEXT_HEIGHT).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
    });

    it('default custom dimensions are within valid range', () => {
      expect(DEFAULT_CUSTOM_WIDTH).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_CUSTOM_WIDTH).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
      expect(DEFAULT_CUSTOM_HEIGHT).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
      expect(DEFAULT_CUSTOM_HEIGHT).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
    });

    it('default dimensions are reasonable', () => {
      expect(DEFAULT_ELEMENT_WIDTH).toBeGreaterThan(50);
      expect(DEFAULT_ELEMENT_HEIGHT).toBeGreaterThan(50);
    });
  });

  describe('constant relationships', () => {
    it('default dimensions can fit multiple times in MAX_ELEMENT_SIZE', () => {
      expect(MAX_ELEMENT_SIZE / DEFAULT_ELEMENT_WIDTH).toBeGreaterThan(5);
      expect(MAX_ELEMENT_SIZE / DEFAULT_ELEMENT_HEIGHT).toBeGreaterThan(5);
    });

    it('GRID_SIZE is at most MIN_ELEMENT_SIZE', () => {
      expect(GRID_SIZE).toBeLessThanOrEqual(MIN_ELEMENT_SIZE);
    });

    it('zoom range is practical', () => {
      const zoomRange = MAX_ZOOM / MIN_ZOOM;
      expect(zoomRange).toBeGreaterThan(10);
      expect(zoomRange).toBeLessThan(1000);
    });
  });
});
