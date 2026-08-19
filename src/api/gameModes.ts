import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getGameModes = () => api.get<Taxonomy[]>('/game-modes');

export const createGameMode = (data: Omit<Taxonomy, 'id'>) =>
  api.post('/game-modes', data);

export const updateGameMode = (id: number, data: Partial<Taxonomy>) =>
  api.put(`/game-modes/${id}`, data);

export const deleteGameMode = (id: number) =>
  api.delete(`/game-modes/${id}`);
