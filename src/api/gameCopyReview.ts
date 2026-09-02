import api from './axios';
import type { GameCopyReview } from '../types/gamecopyreview';
import type { Paginated } from '../types/pagination';

const BASE_URL = '/game-copy-reviews';

export const deleteGameCopyReview = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);

export const getReviewHistory = (page = 1) =>
  api.get<Paginated<GameCopyReview>>(`${BASE_URL}/history?page=${page}`);
