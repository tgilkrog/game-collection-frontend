import api from './axios';
import type { Game, GameListItem, GameSearchResult } from '../types/game';
import type { Paginated } from '../types/pagination';

export const getGames = (page = 1) =>
  api.get<Paginated<GameListItem>>(`/game-base?page=${page}`);

export const getGame = (id: number) =>
  api.get<Game>(`/game-base/${id}`);

export const createGame = (data: FormData) =>
  api.post('/game-base', data);

export const updateGame = (id: number, data: FormData) =>
  api.put(`/game-base/${id}`, data);

export const deleteGame = (id: number) =>
  api.delete(`/game-base/${id}`);

export const searchGame = (q: string, source?: 'local' | 'igdb') =>
  api.get<GameSearchResult[]>(
    `/game-base/search?q=${encodeURIComponent(q)}${source ? `&source=${source}` : ''}`
  );
