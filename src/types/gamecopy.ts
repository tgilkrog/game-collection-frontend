import type { CopyPart } from './copypart';
import type { Platform } from './platform';
import type { Game } from './game';

export type PlayStatus = 'playing' | 'on_hold' | 'completed' | 'completionist' | 'abandoned';

export const PLAY_STATUSES: { value: PlayStatus; label: string }[] = [
  { value: 'playing', label: 'Playing' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'completionist', label: '100%' },
  { value: 'abandoned', label: 'Abandoned' },
];

export function playStatusLabel(status: string | undefined | null): string {
  return PLAY_STATUSES.find(s => s.value === status)?.label ?? status ?? '';
}

export interface GameCopy {
  id?: number;
  title: string;
  game: Game;
  platform_id: number;
  platform: Platform;
  region?: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  review_id?: number | null;
  play_status?: PlayStatus;
  rating?: number | null;
  hours_played?: number | null;
  playthrough_count?: number | null;
  would_replay?: boolean | null;
  would_recommend?: boolean | null;
  parts: CopyPart[];
  user?: { id: number; name: string; avatar?: string; rank?: string; copy_count?: number };
}