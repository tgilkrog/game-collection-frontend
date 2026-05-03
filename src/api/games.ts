import api from './axios';
import type { Game } from '../types/Game';

export const getGames = () =>
  api.get<{ data: Game[] }>('/game-base');

export const createGame = (data: FormData) =>
  api.post('/game-base', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteGame = (id: number) =>
  api.delete(`/game-base/${id}`);