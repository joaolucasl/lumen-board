import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import { INITIAL_STATE } from '../src/constants';

test.describe('Canvas Setup', () => {
  test('renders canvas component', async ({ mount }) => {
    const component = await mount(<TestCanvas />);
    await expect(component).toBeVisible();
    
    // Check that canvas container is rendered
    const container = component.locator('.lb-canvas-container');
    await expect(container).toBeVisible();
  });

  test('renders canvas with initial scene', async ({ mount }) => {
    const initialScene = {
      ...INITIAL_STATE,
      elements: {
        'test-el-1': {
          id: 'test-el-1',
          type: 'rectangle' as const,
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          backgroundColor: '#ff0000',
        },
      },
    };

    const component = await mount(<TestCanvas initialScene={initialScene} />);
    await expect(component).toBeVisible();
    
    // Check that main SVG canvas is rendered (not toolbar icons)
    const svg = component.locator('svg.lb-svg-canvas');
    await expect(svg).toBeVisible();
  });

  test('canvas wrapper has correct dimensions', async ({ mount }) => {
    const component = await mount(
      <TestCanvas width={800} height={600} />
    );
    
    await expect(component).toBeVisible();
    const box = await component.boundingBox();
    
    // Allow for small rounding differences
    expect(box?.width).toBeGreaterThanOrEqual(798);
    expect(box?.width).toBeLessThanOrEqual(802);
    expect(box?.height).toBeGreaterThanOrEqual(598);
    expect(box?.height).toBeLessThanOrEqual(602);
  });
});
