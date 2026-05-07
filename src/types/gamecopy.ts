import type { CopyPart } from './CopyPart';

export interface GameCopy {
  id?: number;
  title: string;
  game_base_id: number;
  platform_id: number;
  region?: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  parts: CopyPart[];
}