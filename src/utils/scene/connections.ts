import type { Connection } from '../../types';

export function deleteConnectionsForElements(connections: Connection[], elementIds: string[]): Connection[] {
  if (elementIds.length === 0) return connections;
  const idSet = new Set(elementIds);
  return connections.filter((c) => !idSet.has(c.sourceId) && !idSet.has(c.targetId));
}
