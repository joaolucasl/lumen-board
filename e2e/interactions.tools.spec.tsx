import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE } from '../src/constants';

test.describe('Tool Interactions', () => {
  test('creates rectangle with rectangle tool', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select rectangle tool
    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();

    // Draw rectangle
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 250, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // A rectangle element should be created
    const elements = Object.values(finalScene!.elements);
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('rectangle');
  });

  test('creates ellipse with ellipse tool', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const ellipseTool = component.getByRole('button', { name: 'Ellipse' });
    await ellipseTool.click();

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 250, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    const elements = Object.values(finalScene!.elements);
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('ellipse');
  });

  test('creates diamond with diamond tool', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const diamondTool = component.getByRole('button', { name: 'Diamond' });
    await diamondTool.click();

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    const elements = Object.values(finalScene!.elements);
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('diamond');
  });

  test('switches between tools', async ({ mount, page }) => {
    const component = await mount(<TestCanvas initialScene={INITIAL_STATE} />);

    // Select rectangle tool
    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();
    await expect(rectTool).toHaveClass(/active|selected/);

    // Switch to ellipse tool
    const ellipseTool = component.getByRole('button', { name: 'Ellipse' });
    await ellipseTool.click();
    await expect(ellipseTool).toHaveClass(/active|selected/);
    await expect(rectTool).not.toHaveClass(/active|selected/);

    // Switch to pointer tool
    const pointerTool = component.getByRole('button', { name: 'Select' });
    await pointerTool.click();
    await expect(pointerTool).toHaveClass(/active|selected/);
    await expect(ellipseTool).not.toHaveClass(/active|selected/);
  });

  test('pointer tool allows element selection', async ({ mount, page }) => {
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

    // Ensure pointer tool is active
    const pointerTool = component.getByRole('button', { name: 'Select' });
    await pointerTool.click();

    // Click element
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();

    await page.waitForTimeout(100);

    expect(selectedIds).toContain('el-1');
  });

  test('hand tool enables panning', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select hand tool
    const handTool = component.getByRole('button', { name: 'Pan' });
    await handTool.click();

    // Drag to pan
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 200, canvasBox!.y + 200);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 300, canvasBox!.y + 250, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // View should have changed
    expect(finalScene!.view.x).not.toBe(0);
    expect(finalScene!.view.y).not.toBe(0);
  });

  test('eraser tool deletes elements on click', async ({ mount, page }) => {
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
        'el-2': {
          id: 'el-2',
          type: 'ellipse',
          x: 300,
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

    // Select eraser tool
    const eraserTool = component.getByRole('button', { name: 'Eraser' });
    await eraserTool.click();

    // Click element to erase
    const element = component.locator('[data-element-id="el-1"]');
    await element.click();

    await page.waitForTimeout(100);

    // Element should be deleted
    expect(finalScene!.elements['el-1']).toBeUndefined();
    expect(finalScene!.elements['el-2']).toBeDefined();
  });

  test('tool returns to pointer after creating element (when keepToolActive is false)', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select rectangle tool
    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();

    // Draw rectangle
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 250, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Tool should return to pointer
    const pointerTool = component.getByRole('button', { name: 'Select' });
    await expect(pointerTool).toHaveClass(/active|selected/);
    await expect(rectTool).not.toHaveClass(/active|selected/);
  });

  test('connection tool creates connections between elements', async ({ mount, page }) => {
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
          x: 300,
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

    // Select connection tool
    const connTool = component.getByRole('button', { name: 'Connect' });
    await connTool.click();

    // Click first element
    const el1 = component.locator('[data-element-id="el-1"]');
    await el1.click();

    // Click second element
    const el2 = component.locator('[data-element-id="el-2"]');
    await el2.click();

    await page.waitForTimeout(100);

    // Connection should be created
    expect(finalScene!.connections).toHaveLength(1);
    expect(finalScene!.connections[0].sourceId).toBe('el-1');
    expect(finalScene!.connections[0].targetId).toBe('el-2');
  });

  test('text tool creates text element', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    // Select text tool
    const textTool = component.getByRole('button', { name: 'Text' });
    await textTool.click();

    // Click to create text
    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.click(canvasBox!.x + 150, canvasBox!.y + 150);

    await page.waitForTimeout(100);

    // Text element should be created
    const elements = Object.values(finalScene!.elements);
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('text');
  });

  test('escape key returns to pointer tool', async ({ mount, page }) => {
    const component = await mount(<TestCanvas initialScene={INITIAL_STATE} />);

    // Select rectangle tool
    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();
    await expect(rectTool).toHaveClass(/active|selected/);

    // Press escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Should return to pointer tool
    const pointerTool = component.getByRole('button', { name: 'Select' });
    await expect(pointerTool).toHaveClass(/active|selected/);
    await expect(rectTool).not.toHaveClass(/active|selected/);
  });

  test('created elements have correct default properties', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 250, canvasBox!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    const element = Object.values(finalScene!.elements)[0];
    expect(element.rotation).toBe(0);
    expect(element.opacity).toBe(1);
    expect(element.locked).toBe(false);
  });

  test('drawing with minimum size creates valid element', async ({ mount, page }) => {
    let finalScene: SceneState | undefined;
    const component = await mount(
      <TestCanvas
        initialScene={INITIAL_STATE}
        onSceneChange={(scene) => { finalScene = scene; }}
      />
    );

    const rectTool = component.getByRole('button', { name: 'Rectangle' });
    await rectTool.click();

    const canvas = component.locator('svg.lb-svg-canvas');
    const canvasBox = await canvas.boundingBox();

    // Draw very small rectangle
    await page.mouse.move(canvasBox!.x + 100, canvasBox!.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox!.x + 105, canvasBox!.y + 105, { steps: 2 });
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Element should be created with minimum size
    const elements = Object.values(finalScene!.elements);
    expect(elements).toHaveLength(1);
    expect(elements[0].width).toBeGreaterThanOrEqual(20); // MIN_ELEMENT_SIZE
    expect(elements[0].height).toBeGreaterThanOrEqual(20);
  });
});
