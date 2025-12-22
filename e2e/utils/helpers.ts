import type { Page, Locator } from '@playwright/test';

export class CanvasHelper {
  constructor(private page: Page) {}

  async getCanvas(): Promise<Locator> {
    return this.page.locator('[data-testid="infinite-canvas"]');
  }

  async getCanvasBounds() {
    const canvas = await this.getCanvas();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    return box;
  }

  async dragElement(
    elementSelector: string,
    deltaX: number,
    deltaY: number
  ): Promise<void> {
    const element = this.page.locator(elementSelector);
    const box = await element.boundingBox();
    if (!box) throw new Error(`Element ${elementSelector} not found`);

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
    await this.page.mouse.up();
  }

  async resizeElement(
    handleSelector: string,
    deltaX: number,
    deltaY: number
  ): Promise<void> {
    const handle = this.page.locator(handleSelector);
    const box = await handle.boundingBox();
    if (!box) throw new Error(`Handle ${handleSelector} not found`);

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
    await this.page.mouse.up();
  }

  async panCanvas(deltaX: number, deltaY: number): Promise<void> {
    const bounds = await this.getCanvasBounds();
    const startX = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
    await this.page.mouse.up();
  }

  async zoomCanvas(delta: number, x?: number, y?: number): Promise<void> {
    const bounds = await this.getCanvasBounds();
    const zoomX = x ?? bounds.x + bounds.width / 2;
    const zoomY = y ?? bounds.y + bounds.height / 2;

    await this.page.mouse.move(zoomX, zoomY);
    await this.page.mouse.wheel(0, delta);
  }

  async clickCanvas(x: number, y: number): Promise<void> {
    const bounds = await this.getCanvasBounds();
    await this.page.mouse.click(bounds.x + x, bounds.y + y);
  }

  async getElementPosition(elementSelector: string): Promise<{ x: number; y: number }> {
    const element = this.page.locator(elementSelector);
    const box = await element.boundingBox();
    if (!box) throw new Error(`Element ${elementSelector} not found`);
    return { x: box.x, y: box.y };
  }

  async getElementSize(elementSelector: string): Promise<{ width: number; height: number }> {
    const element = this.page.locator(elementSelector);
    const box = await element.boundingBox();
    if (!box) throw new Error(`Element ${elementSelector} not found`);
    return { width: box.width, height: box.height };
  }

  async waitForElement(elementSelector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(elementSelector, { timeout });
  }

  async isElementSelected(elementSelector: string): Promise<boolean> {
    const element = this.page.locator(elementSelector);
    const classes = await element.getAttribute('class');
    return classes?.includes('selected') ?? false;
  }
}
