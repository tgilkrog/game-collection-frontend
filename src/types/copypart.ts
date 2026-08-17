import type { Condition } from './condition';

export const BASE_PART_TYPES = ['Disc', 'Case', 'Manual'] as const;

export const isBasePartType = (type: string, baseType: string) =>
  type.trim().toLowerCase() === baseType.toLowerCase();

export interface CopyPart {
  id?: number;
  type: string;
  condition: Condition;
  notes?: string;
}

export const resolveBaseParts = (parts: CopyPart[], conditions: Condition[]): CopyPart[] =>
  BASE_PART_TYPES.map(baseType =>
    parts.find(p => isBasePartType(p.type, baseType)) ?? {
      type: baseType,
      condition: conditions[0],
      notes: '',
    }
  );

export const resolveExtraParts = (parts: CopyPart[]): CopyPart[] =>
  parts.filter(p => !BASE_PART_TYPES.some(baseType => isBasePartType(p.type, baseType)));

export const resolvePartsForSubmit = (parts: CopyPart[], conditions: Condition[]): CopyPart[] => [
  ...resolveBaseParts(parts, conditions),
  ...resolveExtraParts(parts),
];