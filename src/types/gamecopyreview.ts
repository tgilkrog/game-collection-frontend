import type { GameListItem } from './game';
import type { PlayStatus } from './gamecopy';

export interface GameCopyReview {
  id: number;
  play_status: PlayStatus;
  rating?: number | null;
  hours_played?: number | null;
  playthrough_count?: number | null;
  would_replay?: boolean | null;
  would_recommend?: boolean | null;
  notes?: string;
  created_at?: string;
  game: GameListItem;
}
