import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE, MIN_ELEMENT_SIZE, MAX_ELEMENT_SIZE } from '../src/constants';

test.describe('Resize Handle Interactions', () => {
  test('resizes element from bottom-right handle', async ({ mount, page }) => {
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

    // Select element to show resize handles
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();

    // Find bottom-right handle
    const handle = component.locator('[data-handle="bottom-right"]');
    await expect(handle).toBeVisible();

    const handleBox = await handle.boundingBox();
    
    // Drag handle to resize
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 50, handleBox!.y + 40, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Element should be larger
    expect(finalScene!.elements['el-1'].width).toBeGreaterThan(150);
    expect(finalScene!.elements['el-1'].height).toBeGreaterThan(100);
    // Position should remain the same (bottom-right doesn't move origin)
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBe(100);
  });

  test('resizes element from top-left handle', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 200,
          y: 200,
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
    await element.click();

    const handle = component.locator('[data-handle="top-left"]');
    const handleBox = await handle.boundingBox();
    
    // Drag handle inward (making element smaller)
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 30, handleBox!.y + 20, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Element should be smaller
    expect(finalScene!.elements['el-1'].width).toBeLessThan(150);
    expect(finalScene!.elements['el-1'].height).toBeLessThan(100);
    // Position should move (top-left moves the origin)
    expect(finalScene!.elements['el-1'].x).toBeGreaterThan(200);
    expect(finalScene!.elements['el-1'].y).toBeGreaterThan(200);
  });

  test('resizes element from right-center handle (width only)', async ({ mount, page }) => {
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
    await element.click();

    const handle = component.locator('[data-handle="right-center"]');
    const handleBox = await handle.boundingBox();
    
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 50, handleBox!.y, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Width should change, height should stay the same
    expect(finalScene!.elements['el-1'].width).toBeGreaterThan(150);
    expect(finalScene!.elements['el-1'].height).toBe(100);
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBe(100);
  });

  test('resizes element from top-center handle (height only)', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 200,
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
    await element.click();

    const handle = component.locator('[data-handle="top-center"]');
    const handleBox = await handle.boundingBox();
    
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x, handleBox!.y + 30, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Height should change, width should stay the same
    expect(finalScene!.elements['el-1'].width).toBe(150);
    expect(finalScene!.elements['el-1'].height).toBeLessThan(100);
    expect(finalScene!.elements['el-1'].x).toBe(100);
    expect(finalScene!.elements['el-1'].y).toBeGreaterThan(200);
  });

  test('maintains aspect ratio on corner resize', async ({ mount, page }) => {
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
    await element.click();

    // Calculate initial aspect ratio
    const initialAspect = 150 / 100; // 1.5

    const handle = component.locator('[data-handle="bottom-right"]');
    const handleBox = await handle.boundingBox();
    
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 60, handleBox!.y + 80, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Aspect ratio should be maintained
    const finalAspect = finalScene!.elements['el-1'].width / finalScene!.elements['el-1'].height;
    expect(Math.abs(finalAspect - initialAspect)).toBeLessThan(0.01);
  });

  test('enforces minimum element size', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
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
    await element.click();

    const handle = component.locator('[data-handle="bottom-right"]');
    const handleBox = await handle.boundingBox();
    
    // Try to resize to very small size
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x - 100, handleBox!.y - 100, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Size should be clamped to minimum
    expect(finalScene!.elements['el-1'].width).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
    expect(finalScene!.elements['el-1'].height).toBeGreaterThanOrEqual(MIN_ELEMENT_SIZE);
  });

  test('enforces maximum element size', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
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
    await element.click();

    const handle = component.locator('[data-handle="bottom-right"]');
    const handleBox = await handle.boundingBox();
    
    // Try to resize to very large size
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 10000, handleBox!.y + 10000, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Size should be clamped to maximum
    expect(finalScene!.elements['el-1'].width).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
    expect(finalScene!.elements['el-1'].height).toBeLessThanOrEqual(MAX_ELEMENT_SIZE);
  });

  test('snaps resize to grid when enabled', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 140,
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
    await element.click();

    const handle = component.locator('[data-handle="bottom-right"]');
    const handleBox = await handle.boundingBox();
    
    // Resize by non-grid-aligned amount
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 37, handleBox!.y + 43, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Dimensions should be snapped to grid (multiples of 20)
    expect(finalScene!.elements['el-1'].width % 20).toBe(0);
    expect(finalScene!.elements['el-1'].height % 20).toBe(0);
  });

  test('does not resize locked element', async ({ mount, page }) => {
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
          locked: true,
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
    await element.click();

    // Resize handles should not be visible for locked elements
    const handle = component.locator('[data-handle="bottom-right"]');
    await expect(handle).not.toBeVisible();

    // Even if we try to resize, dimensions should not change
    expect(finalScene!.elements['el-1'].width).toBe(150);
    expect(finalScene!.elements['el-1'].height).toBe(100);
  });

  test('all 8 resize handles work correctly', async ({ mount, page }) => {
    const handles = [
      'top-left', 'top-center', 'top-right',
      'left-center', 'right-center',
      'bottom-left', 'bottom-center', 'bottom-right'
    ];

    for (const handleName of handles) {
      const initialScene: SceneState = {
        ...INITIAL_STATE,
        elements: {
          'el-1': {
            id: 'el-1',
            type: 'rectangle',
            x: 200,
            y: 200,
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
      await element.click();

      const handle = component.locator(`[data-handle="${handleName}"]`);
      await expect(handle).toBeVisible();

      const handleBox = await handle.boundingBox();
      
      // Drag handle outward
      const deltaX = handleName.includes('right') ? 30 : handleName.includes('left') ? -30 : 0;
      const deltaY = handleName.includes('bottom') ? 30 : handleName.includes('top') ? -30 : 0;

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        handleBox!.x + handleBox!.width / 2 + deltaX,
        handleBox!.y + handleBox!.height / 2 + deltaY,
        { steps: 10 }
      );
      await page.mouse.up();

      await page.waitForTimeout(100);

      // Verify that dimensions changed appropriately
      const widthChanged = handleName.includes('left') || handleName.includes('right');
      const heightChanged = handleName.includes('top') || handleName.includes('bottom');

      if (widthChanged) {
        expect(finalScene!.elements['el-1'].width).not.toBe(150);
      }
      if (heightChanged) {
        expect(finalScene!.elements['el-1'].height).not.toBe(100);
      }

      await component.unmount();
    }
  });
});
