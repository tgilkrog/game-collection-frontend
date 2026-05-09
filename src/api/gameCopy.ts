import api from './axios';
import type { GameCopy } from '../types/gamecopy';

const BASE_URL = '/game-copies';

export const getGameCopies = () =>
  api.get<GameCopy[]>(BASE_URL);

export const getGameCopy = (id: number) =>
  api.get(`${BASE_URL}/${id}`);

export const createGameCopy = (data: FormData) =>
  api.post(BASE_URL, data);

export const updateGameCopy = (id: number, data: FormData) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deleteGameCopy = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);