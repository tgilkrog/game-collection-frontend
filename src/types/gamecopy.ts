import type { CopyPart } from './copypart';
import type { Platform } from './platform';
import type { Game } from './game';

export interface GameCopy {
  id?: number;
  title: string;
  game: Game;
  platform_id: number;
  platform: Platform,
  region?: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  parts: CopyPart[];
}