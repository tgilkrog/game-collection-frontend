import api from './axios';
import type { Game } from '../types/game';

export const getGames = () =>
  api.get<Game[]>('/game-base');

export const getGame = (id: number) =>
  api.get(`/game-base/${id}`);

export const createGame = (data: FormData) =>
  api.post('/game-base', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteGame = (id: number) =>
  api.delete(`/game-base/${id}`);