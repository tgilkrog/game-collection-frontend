import type { Genre } from './genre';
import type { GameCopy } from './gamecopy';

export interface GameListItem {
  id: number;
  title: string;
  cover_image?: string;
}

export interface Game {
  id: number;
  title: string;
  release_year: number;
  publisher?: string;
  developer?: string;
  description?: string;
  cover_image?: string;
  game_copies?: GameCopy[];
  genres?: Genre[];
  themes?: Genre[];
  game_modes?: Genre[];
  player_perspectives?: Genre[];
  is_wishlisted?: boolean;
}

export interface GameSearchResult {
  source: 'local' | 'igdb';
  id?: number;
  igdb_id: number;
  title: string;
  cover_image?: string;
  platforms?: string[];
}