import api from './axios';
import type { Platform } from '../types/platform';

export const getPlatforms = () => api.get<Platform[]>('/platforms');

export const createPlatform = (data: Omit<Platform, 'id' | 'copy_count'>) =>
  api.post('/platforms', data);

export const updatePlatform = (id: number, data: Partial<Omit<Platform, 'id' | 'copy_count'>>) =>
  api.put(`/platforms/${id}`, data);

export const deletePlatform = (id: number) =>
  api.delete(`/platforms/${id}`);
