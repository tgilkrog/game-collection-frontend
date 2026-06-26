import api from './axios';
import type { Game, GameSearchResult } from '../types/game';

export const getGames = () =>
  api.get<Game[]>('/game-base');

export const getGame = (id: number) =>
  api.get(`/game-base/${id}`);

export const createGame = (data: FormData) =>
  api.post('/game-base', data);

export const updateGame = (id: number, data: FormData) =>
  api.put(`/game-base/${id}`, data);

export const deleteGame = (id: number) =>
  api.delete(`/game-base/${id}`);

export const searchGame = (q: string) =>
  api.get<GameSearchResult[]>(`/game-base/search?q=${encodeURIComponent(q)}`);