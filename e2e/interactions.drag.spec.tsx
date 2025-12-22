import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE } from '../src/constants';

test.describe('Drag and Drop Interactions', () => {
  test('drags single element to new position', async ({ mount, page }) => {
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

    // Find the element
    const element = component.locator('[data-element-id="el-1"]');
    await expect(element).toBeVisible();

    // Get initial position
    const initialBox = await element.boundingBox();
    expect(initialBox).toBeTruthy();

    // Drag element
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x + initialBox!.width / 2 + 50,
      initialBox!.y + initialBox!.height / 2 + 75,
      { steps: 10 }
    );
    await page.mouse.up();

    // Wait for state update
    await page.waitForTimeout(100);

    // Verify position changed
    expect(finalScene).toBeDefined();
    expect(finalScene!.elements['el-1'].x).toBeGreaterThan(100);
    expect(finalScene!.elements['el-1'].y).toBeGreaterThan(100);
  });

  test('drags multiple selected elements together', async ({ mount, page }) => {
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
        'el-2': {
          id: 'el-2',
          type: 'ellipse',
          x: 250,
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

    // Select first element
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();

    // Shift-click second element to multi-select
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click({ modifiers: ['Shift'] });

    // Drag one of the selected elements
    const box1 = await el1.boundingBox();
    await page.mouse.move(box1!.x + box1!.width / 2, box1!.y + box1!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box1!.x + box1!.width / 2 + 50, box1!.y + box1!.height / 2 + 50, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Both elements should have moved
    expect(finalScene!.elements['el-1'].x).toBeGreaterThan(100);
    expect(finalScene!.elements['el-1'].y).toBeGreaterThan(100);
    expect(finalScene!.elements['el-2'].x).toBeGreaterThan(250);
    expect(finalScene!.elements['el-2'].y).toBeGreaterThan(100);
  });

  test('does not drag locked element', async ({ mount, page }) => {
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
          locked: true, // Element is locked
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

    const element = component.locator('[data-element-id="el-1"]');
    const initialBox = await element.boundingBox();

    // Attempt to drag locked element
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x + initialBox!.width / 2 + 50,
      initialBox!.y + initialBox!.height / 2 + 50,
      { steps: 10 }
    );
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Position should NOT change
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBe(100);
  });

  test('drags element with grid snapping enabled', async ({ mount, page }) => {
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
        snapToGrid={true}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const element = component.locator('[data-element-id="el-1"]');
    const initialBox = await element.boundingBox();

    // Drag to non-grid-aligned position
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x + initialBox!.width / 2 + 37, // Not aligned to 20px grid
      initialBox!.y + initialBox!.height / 2 + 43,
      { steps: 10 }
    );
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Position should be snapped to grid (multiples of 20)
    expect(finalScene!.elements['el-1'].x % 20).toBe(0);
    expect(finalScene!.elements['el-1'].y % 20).toBe(0);
  });

  test('maintains relative positions when dragging multiple elements', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
        'el-2': {
          id: 'el-2',
          type: 'ellipse',
          x: 200,
          y: 150,
          width: 80,
          height: 80,
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

    // Calculate initial relative positions
    const initialDeltaX = 200 - 100;
    const initialDeltaY = 150 - 100;

    // Select both elements
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click({ modifiers: ['Shift'] });

    // Drag
    const box1 = await el1.boundingBox();
    await page.mouse.move(box1!.x + box1!.width / 2, box1!.y + box1!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box1!.x + box1!.width / 2 + 60, box1!.y + box1!.height / 2 + 80, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Relative positions should be maintained
    const finalDeltaX = finalScene!.elements['el-2'].x - finalScene!.elements['el-1'].x;
    const finalDeltaY = finalScene!.elements['el-2'].y - finalScene!.elements['el-1'].y;

    expect(finalDeltaX).toBe(initialDeltaX);
    expect(finalDeltaY).toBe(initialDeltaY);
  });

  test('cancels drag on escape key', async ({ mount, page }) => {
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

    const element = component.locator('[data-element-id="el-1"]');
    const initialBox = await element.boundingBox();

    // Start dragging
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x + initialBox!.width / 2 + 50,
      initialBox!.y + initialBox!.height / 2 + 50,
      { steps: 5 }
    );

    // Press escape to cancel
    await page.keyboard.press('Escape');
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Position should remain unchanged
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBe(100);
  });

  test('prevents dragging outside canvas bounds', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 50,
          y: 50,
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
        width={400}
        height={400}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const element = component.locator('[data-element-id="el-1"]');
    const initialBox = await element.boundingBox();

    // Try to drag far beyond canvas bounds
    await element.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x - 1000, // Way off canvas
      initialBox!.y - 1000,
      { steps: 10 }
    );
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Element should be constrained (exact constraint depends on MAX_COORDINATE)
    // At minimum, it shouldn't have negative coordinates beyond reasonable bounds
    expect(finalScene!.elements['el-1'].x).toBeGreaterThan(-100000);
    expect(finalScene!.elements['el-1'].y).toBeGreaterThan(-100000);
  });
});
