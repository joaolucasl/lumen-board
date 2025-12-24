import { test, expect } from '@playwright/experimental-ct-react';
import { TestCanvas } from './fixtures/TestCanvas';
import type { SceneState } from '../src/types';
import { INITIAL_STATE } from '../src/constants';

// Uses built-in NoSelectTestCard component from TestCanvas fixture

test.describe('No-Select Attribute Interactions', () => {
  test('does NOT select element when clicking button with data-lumen-no-select', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          componentType: 'NoSelectTestCard',
          props: {
            title: 'Test Card',
            description: 'This is a test card with interactive elements'
          }
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

    // Ensure the custom element is visible
    await expect(component.locator('[data-element-id="el-1"]')).toBeVisible();
    
    // Click on the button inside the custom component
    const button = component.locator('button[data-lumen-no-select]');
    await expect(button).toBeVisible();
    await button.click();

    // Wait a bit for any potential selection to occur
    await page.waitForTimeout(100);

    // Element should NOT be selected
    expect(selectedIds).toHaveLength(0);
  });

  test('does NOT select element when clicking input with data-lumen-no-select', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          componentType: 'NoSelectTestCard',
          props: {
            title: 'Test Card',
            description: 'This is a test card with interactive elements'
          }
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

    // Ensure the custom element is visible
    await expect(component.locator('[data-element-id="el-1"]')).toBeVisible();
    
    // Click on the input inside the custom component
    const input = component.locator('input[data-lumen-no-select]');
    await expect(input).toBeVisible();
    await input.click();

    // Wait a bit for any potential selection to occur
    await page.waitForTimeout(100);

    // Element should NOT be selected
    expect(selectedIds).toHaveLength(0);
  });

  test('selects element when clicking on non-no-select parts of custom component', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          componentType: 'NoSelectTestCard',
          props: {
            title: 'Test Card',
            description: 'This is a test card with interactive elements'
          }
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

    // Ensure the custom element is visible
    await expect(component.locator('[data-element-id="el-1"]')).toBeVisible();
    
    // Click on the title text (not a no-select element)
    const title = component.locator('h3');
    await expect(title).toBeVisible();
    await title.click();

    // Wait a bit for selection to occur
    await page.waitForTimeout(100);

    // Element should be selected
    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toHaveLength(1);
  });

  test('selects element when clicking on empty space in custom component', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          componentType: 'NoSelectTestCard',
          props: {
            title: 'Test Card',
            description: 'This is a test card with interactive elements'
          }
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

    // Ensure the custom element is visible
    await expect(component.locator('[data-element-id="el-1"]')).toBeVisible();
    
    // Click on the custom component container (not on any interactive element)
    const customElement = component.locator('[data-element-id="el-1"]');
    await customElement.click({ position: { x: 10, y: 10 } }); // Click near the edge

    // Wait a bit for selection to occur
    await page.waitForTimeout(100);

    // Element should be selected
    expect(selectedIds).toContain('el-1');
    expect(selectedIds).toHaveLength(1);
  });

  test('button click still fires despite not selecting element', async ({ mount, page }) => {
    const initialScene: SceneState = {
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          componentType: 'NoSelectTestCard',
          props: {
            title: 'Test Card',
            description: 'This is a test card with interactive elements'
          }
        },
      },
    };

    // Capture console logs to verify button click fires
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    let selectedIds: string[] = [];
    const component = await mount(
      <TestCanvas
        initialScene={initialScene}
        onSelectionChange={(ids) => { selectedIds = ids; }}
      />
    );

    // Ensure the custom element is visible
    await expect(component.locator('[data-element-id="el-1"]')).toBeVisible();
    
    // Click on the button
    const button = component.locator('button[data-lumen-no-select]');
    await expect(button).toBeVisible();
    await button.click();

    // Wait a bit for the click handler to fire
    await page.waitForTimeout(100);

    // The button's onClick should have fired (logged to console)
    expect(consoleLogs).toContain('Button clicked');
    
    // And element should NOT be selected
    expect(selectedIds).toHaveLength(0);
  });
});
