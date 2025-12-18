import type { CanvasElement } from '../../types';

export function deleteElementsFromMap(
  elements: Record<string, CanvasElement>,
  ids: string[]
): Record<string, CanvasElement> {
  if (ids.length === 0) return elements;

  const next = { ...elements };
  for (const id of ids) {
    delete next[id];
  }
  return next;
}

export function updateElementsInMap(
  elements: Record<string, CanvasElement>,
  updates: Array<{ id: string } & Partial<CanvasElement>>
): { elements: Record<string, CanvasElement>; updated: CanvasElement[] } {
  if (updates.length === 0) return { elements, updated: [] };

  const next = { ...elements };
  const updated: CanvasElement[] = [];

  for (const update of updates) {
    const { id, ...changes } = update;
    const existing = next[id];
    if (!existing) continue;
    const merged = { ...existing, ...changes };
    next[id] = merged;
    updated.push(merged);
  }

  return { elements: next, updated };
}
