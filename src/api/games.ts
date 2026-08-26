import api from './axios';
import type { Game, GameListItem, GameSearchResult } from '../types/game';
import type { Paginated } from '../types/pagination';
import { appendArrayParams } from '../utils/queryParams';

export interface GameBaseFilters {
  genre_id?: number[];
  theme_id?: number[];
  game_mode_id?: number[];
  player_perspective_id?: number[];
  platform_id?: number[];
  [key: string]: number[] | undefined;
}

export const getGames = (page = 1, filters: GameBaseFilters = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  appendArrayParams(params, filters);
  return api.get<Paginated<GameListItem>>(`/game-base?${params}`);
};

export const getGame = (id: number) =>
  api.get<Game>(`/game-base/${id}`);

export const createGame = (data: FormData) =>
  api.post('/game-base', data);

export const updateGame = (id: number, data: FormData) =>
  api.put(`/game-base/${id}`, data);

export const deleteGame = (id: number) =>
  api.delete(`/game-base/${id}`);

export const searchGame = (q: string, source?: 'local' | 'igdb', signal?: AbortSignal) =>
  api.get<GameSearchResult[]>(
    `/game-base/search?q=${encodeURIComponent(q)}${source ? `&source=${source}` : ''}`,
    { signal }
  );
