import type { Genre } from './genre';
import type { GameCopy } from './gamecopy';

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
}