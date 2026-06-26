import api from './axios';
import type { GameCopy } from '../types/gamecopy';
import type { Paginated } from '../types/pagination';

const BASE_URL = '/game-copies';

export const getFeed = (page = 1) =>
  api.get<Paginated<GameCopy>>(`/feed?page=${page}`);

export const getGameCopies = (page = 1) =>
  api.get<Paginated<GameCopy>>(`${BASE_URL}?page=${page}`);

export const getGameCopy = (id: number) =>
  api.get(`${BASE_URL}/${id}`);

export const createGameCopy = (data: FormData) =>
  api.post(BASE_URL, data);

export const updateGameCopy = (id: number, data: FormData) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deleteGameCopy = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);
