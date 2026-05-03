// api/genres.ts
import api from './axios';

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export const getGenres = () =>
  api.get('/genres');

export const getGenre = (id: number) =>
  api.get(`/genres/${id}`);

export const createGenre = (data: Omit<Genre, 'id'>) =>
  api.post('/genres', data);

export const updateGenre = (id: number, data: Partial<Genre>) =>
  api.put(`/genres/${id}`, data);

export const deleteGenre = (id: number) =>
  api.delete(`/genres/${id}`);