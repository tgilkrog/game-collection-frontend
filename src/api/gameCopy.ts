import api from './axios';
import type { Game } from '../types/game';

const BASE_URL = '/game-copies';

export const getGames = () =>
  api.get<Game[]>(BASE_URL);

export const getGame = (id: number) =>
  api.get(`${BASE_URL}/${id}`);

export const createGame = (data: FormData) =>
  api.post(BASE_URL, data);

export const updateGame = (id: number, data: FormData) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deleteGame = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);