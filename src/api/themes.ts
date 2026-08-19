import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getThemes = () => api.get<Taxonomy[]>('/themes');

export const createTheme = (data: Omit<Taxonomy, 'id'>) =>
  api.post('/themes', data);

export const updateTheme = (id: number, data: Partial<Taxonomy>) =>
  api.put(`/themes/${id}`, data);

export const deleteTheme = (id: number) =>
  api.delete(`/themes/${id}`);
