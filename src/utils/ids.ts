export type CreateIdOptions = {
  prefix: string;
  includeRandomSuffix?: boolean;
};

export function createId({ prefix, includeRandomSuffix = false }: CreateIdOptions): string {
  const ts = Date.now();
  if (!includeRandomSuffix) return `${prefix}_${ts}`;
  return `${prefix}_${ts}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createElementId(includeRandomSuffix = false): string {
  return createId({ prefix: 'el', includeRandomSuffix });
}

export function createConnectionId(includeRandomSuffix = false): string {
  return createId({ prefix: 'conn', includeRandomSuffix });
}
