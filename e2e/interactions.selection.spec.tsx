import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE } from '../src/constants';

test.describe('Selection Interactions', () => {
  test('selects element on click', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    const element = component.locator('[data-element-id="el-1"]');
    await element.click();

    await page.waitForTimeout(100);

    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toHaveLength(1);
  });

  test('deselects element on canvas click', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    // Select element
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();
    await page.waitForTimeout(50);

    expect(selectedIds).toContain('el-1');

    // Click empty canvas area
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();
    await page.mouse.click(canvasBox!.x + 500, canvasBox!.y + 500);

    await page.waitForTimeout(100);

    expect(selectedIds).toHaveLength(0);
  });

  test('multi-selects with shift+click', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    // Select first element
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();
    await page.waitForTimeout(50);

    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toHaveLength(1);

    // Shift-click second element
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click({ modifiers: ['Shift'] });
    await page.waitForTimeout(50);

    // Both should be selected
    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toContain('el-2');
    expect(selectedIds).toHaveLength(2);
  });

  test('replaces selection without shift', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    // Select first element
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();
    await page.waitForTimeout(50);

    expect(selectedIds).toContain('el-1');

    // Click second element without shift
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click();
    await page.waitForTimeout(50);

    // Only second should be selected
    expect(selectedIds).not.toContain('el-1');
    expect(selectedIds).toContain('el-2');
    expect(selectedIds).toHaveLength(1);
  });

  test('shows resize handles for selected element', async ({ mount, page }) => {
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

    const component = await mount(
      <TestCanvas initialScene={initialScene} />
    );

    // Initially no handles visible
    const handle = component.locator('[data-handle="bottom-right"]');
    await expect(handle).not.toBeVisible();

    // Select element
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();

    // Handles should appear
    await expect(handle).toBeVisible();
  });

  test('deletes selected elements with delete key', async ({ mount, page }) => {
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

    // Select element
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();
    await page.waitForTimeout(50);

    // Press delete
    await page.keyboard.press('Delete');
    await page.waitForTimeout(100);

    // Element should be deleted
    expect(finalScene!.elements['el-1']).toBeUndefined();
    expect(finalScene!.elements['el-2']).toBeDefined();
  });

  test('deletes selected elements with backspace key', async ({ mount, page }) => {
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

    const element = component.locator('[data-element-id="el-1"]');
    await element.click();
    await page.waitForTimeout(50);

    await page.keyboard.press('Backspace');
    await page.waitForTimeout(100);

    expect(finalScene!.elements['el-1']).toBeUndefined();
  });

  test('deletes multiple selected elements', async ({ mount, page }) => {
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
        'el-3': {
          id: 'el-3',
          type: 'diamond',
          x: 400,
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

    // Multi-select
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click({ modifiers: ['Shift'] });
    await page.waitForTimeout(50);

    // Delete
    await page.keyboard.press('Delete');
    await page.waitForTimeout(100);

    // Both selected elements should be deleted
    expect(finalScene!.elements['el-1']).toBeUndefined();
    expect(finalScene!.elements['el-2']).toBeUndefined();
    expect(finalScene!.elements['el-3']).toBeDefined();
  });

  test('can select locked element', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    const element = component.locator('[data-element-id="el-1"]');
    await element.click();
    await page.waitForTimeout(100);

    // Locked element should be selectable but not movable
    expect(selectedIds).toHaveLength(1);
    expect(selectedIds[0]).toBe('el-1');
  });

  test('selection box selects multiple elements', async ({ mount, page }) => {
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
          y: 100,
          width: 80,
          height: 80,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
        'el-3': {
          id: 'el-3',
          type: 'diamond',
          x: 400,
          y: 100,
          width: 80,
          height: 80,
          rotation: 0,
          opacity: 1,
          locked: false,
        },
      },
    };

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Draw selection box around first two elements
    await page.mouse.move(canvasBox!.x + 80, canvasBox!.y + 80);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // First two elements should be selected
    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toContain('el-2');
    expect(selectedIds).not.toContain('el-3');
  });

  test('clears selection on escape key', async ({ mount, page }) => {
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

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    // Select element
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();
    await page.waitForTimeout(50);

    expect(selectedIds).toContain('el-1');

    // Press escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    expect(selectedIds).toHaveLength(0);
  });
});
