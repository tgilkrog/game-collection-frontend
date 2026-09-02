import api from './axios';
import type { GameCopy } from '../types/gamecopy';
import type { Paginated } from '../types/pagination';
import { appendArrayParams } from '../utils/queryParams';

const BASE_URL = '/game-copies';

export interface GameCopyFilters {
  platform_id?: number[];
  condition_id?: number[];
  genre_id?: number[];
  theme_id?: number[];
  game_mode_id?: number[];
  player_perspective_id?: number[];
  game_base_id?: number[];
  exclude_ids?: number[];
  play_status?: string[];
  [key: string]: (number | string)[] | undefined;
}

export const getFeed = (following = false, page = 1, perPage?: number) => {
  const params = new URLSearchParams({ page: String(page) });
  if (following) params.set('following', '1');
  if (perPage) params.set('per_page', String(perPage));
  return api.get<Paginated<GameCopy>>(`/feed?${params}`);
};

export const getGameCopies = (page = 1, filters: GameCopyFilters = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  appendArrayParams(params, filters);
  return api.get<Paginated<GameCopy>>(`${BASE_URL}?${params}`);
};

export const getGameCopy = (id: number) =>
  api.get<GameCopy>(`${BASE_URL}/${id}`);

export const getRandomBacklogCopy = () =>
  api.get<GameCopy>(`${BASE_URL}/random-backlog`);

export const createGameCopy = (data: FormData) =>
  api.post(BASE_URL, data);

export const updateGameCopy = (id: number, data: object) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deleteGameCopy = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);

export const exportGameCopies = (columns: string[], format: 'xlsx' | 'csv') =>
  api.get(`${BASE_URL}/export`, {
    params: { columns, format },
    responseType: 'blob',
  });
