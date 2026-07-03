import api from './axios';
import type { GameCopy } from '../types/gamecopy';
import type { Paginated } from '../types/pagination';

const BASE_URL = '/game-copies';

export const getFeed = (following = false, page = 1) => {
  const params = new URLSearchParams({ page: String(page) });
  if (following) params.set('following', '1');
  return api.get<Paginated<GameCopy>>(`/feed?${params}`);
};

export const getGameCopies = (page = 1, platformId?: number) => {
  const params = new URLSearchParams({ page: String(page) });
  if (platformId) params.set('platform_id', String(platformId));
  return api.get<Paginated<GameCopy>>(`${BASE_URL}?${params}`);
};

export const getGameCopy = (id: number) =>
  api.get<GameCopy>(`${BASE_URL}/${id}`);

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
