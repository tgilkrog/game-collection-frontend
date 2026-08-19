import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getPlayerPerspectives = () => api.get<Taxonomy[]>('/player-perspectives');

export const createPlayerPerspective = (data: Omit<Taxonomy, 'id'>) =>
  api.post('/player-perspectives', data);

export const updatePlayerPerspective = (id: number, data: Partial<Taxonomy>) =>
  api.put(`/player-perspectives/${id}`, data);

export const deletePlayerPerspective = (id: number) =>
  api.delete(`/player-perspectives/${id}`);
