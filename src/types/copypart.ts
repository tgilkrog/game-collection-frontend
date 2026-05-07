import type { Condition } from './condition';

export interface CopyPart {
  id?: number;
  type: string;
  condition: Condition;
  notes?: string;
}