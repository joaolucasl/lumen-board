import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE, MIN_ZOOM, MAX_ZOOM } from '../src/constants';

test.describe('Pan and Zoom Interactions', () => {
  test('pans canvas with hand tool', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select hand tool
    const handTool = component.getByRole('button', { name: 'Pan' });
    await handTool.click();

    // Get canvas
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Pan the canvas
    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 250, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // View should have changed
    expect(finalScene!.view.x).not.toBe(0);
    expect(finalScene!.view.y).not.toBe(0);
  });

  test('pans canvas with space + drag', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Hold space and drag
    await page.keyboard.down('Space');
    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 250, { steps: 10 });
    await page.mouse.up();
    await page.keyboard.up('Space');

    await page.waitForTimeout(100);

    // View should have changed
    expect(finalScene!.view.x).not.toBe(0);
    expect(finalScene!.view.y).not.toBe(0);
  });

  test('zooms in with mouse wheel', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Zoom in (negative wheel delta)
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(100);

    // Zoom should have increased
    expect(finalScene!.view.zoom).toBeGreaterThan(1);
  });

  test('zooms out with mouse wheel', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Zoom out (positive wheel delta)
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    await page.mouse.wheel(0, 100);

    await page.waitForTimeout(100);

    // Zoom should have decreased
    expect(finalScene!.view.zoom).toBeLessThan(1);
  });

  test('zooms with zoom controls buttons', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Click zoom in button
    const zoomInBtn = component.locator('button').filter({ hasText: '+' }).or(
      component.locator('button[aria-label*="Zoom in"]')
    ).first();
    await zoomInBtn.click();

    await page.waitForTimeout(100);

    expect(finalScene!.view.zoom).toBeGreaterThan(1);

    const zoomAfterIn = finalScene!.view.zoom;

    // Click zoom out button
    const zoomOutBtn = component.locator('button').filter({ hasText: '-' }).or(
      component.locator('button[aria-label*="Zoom out"]')
    ).first();
    await zoomOutBtn.click();

    await page.waitForTimeout(100);

    expect(finalScene!.view.zoom).toBeLessThan(zoomAfterIn);
  });

  test('enforces minimum zoom level', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: MIN_ZOOM + 0.01 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Try to zoom out beyond minimum
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(100);

    // Zoom should be clamped to minimum
    expect(finalScene!.view.zoom).toBeGreaterThanOrEqual(MIN_ZOOM);
  });

  test('enforces maximum zoom level', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: MAX_ZOOM - 0.1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Try to zoom in beyond maximum
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(100);

    // Zoom should be clamped to maximum
    expect(finalScene!.view.zoom).toBeLessThanOrEqual(MAX_ZOOM);
  });

  test('zooms toward mouse cursor position', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Position mouse over a specific point
    const targetX = canvasBox!.x + 150;
    const targetY = canvasBox!.y + 150;

    await page.mouse.move(targetX, targetY);
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(100);

    // The view should have adjusted so that the point under the cursor
    // remains relatively in the same screen position
    expect(finalScene!.view.zoom).toBeGreaterThan(1);
    // View x and y should have changed to keep focal point stable
    expect(finalScene!.view.x).not.toBe(0);
    expect(finalScene!.view.y).not.toBe(0);
  });

  test('fit view button resets zoom and centers content', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 100, y: 100, zoom: 2 },
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Click fit view button
    const fitViewBtn = component.locator('button').filter({ hasText: '⊡' }).or(
      component.locator('button[aria-label*="Fit"]')
    ).first();
    await fitViewBtn.click();

    await page.waitForTimeout(100);

    // View should be reset
    expect(finalScene!.view.x).toBe(0);
    expect(finalScene!.view.y).toBe(0);
    expect(finalScene!.view.zoom).toBe(1);
  });

  test('maintains element positions during pan', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select hand tool and pan
    const handTool = component.getByRole('button', { name: 'Pan' });
    await handTool.click();

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 250, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Element world coordinates should not change
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBe(100);
    // Only view should change
    expect(finalScene!.view.x).not.toBe(0);
  });

  test('maintains element sizes during zoom', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Zoom in
    await page.mouse.move(canvasBox!.x + canvasBox!.width / 2, canvasBox!.y + canvasBox!.height / 2);
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(100);

    // Element world dimensions should not change
    expect(finalScene!.elements['el-1'].width).toBe(150);
    expect(finalScene!.elements['el-1'].height).toBe(100);
    // Only zoom should change
    expect(finalScene!.view.zoom).toBeGreaterThan(1);
  });

  test('combines pan and zoom operations smoothly', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      view: { x: 0, y: 0, zoom: 1 },
    };

    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Zoom in
    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(50);

    const zoomAfterZoomIn = finalScene!.view.zoom;

    // Pan with space
    await page.keyboard.down('Space');
    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 250, { steps: 5 });
    await page.mouse.up();
    await page.keyboard.up('Space');
    await page.waitForTimeout(50);

    // Zoom out
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(50);

    // Both operations should have affected the view
    expect(finalScene!.view.zoom).not.toBe(1);
    expect(finalScene!.view.zoom).toBeLessThan(zoomAfterZoomIn);
    expect(finalScene!.view.x).not.toBe(0);
    expect(finalScene!.view.y).not.toBe(0);
  });
});
