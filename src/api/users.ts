import api from './axios';
import type { User, UserListItem } from '../types/user';
import type { GameCopy } from '../types/gamecopy';
import type { Paginated } from '../types/pagination';

export const getUsers = (search = '', page = 1) =>
  api.get<Paginated<UserListItem>>(`/users?search=${encodeURIComponent(search)}&page=${page}`);

export const getUser = (username: string) => api.get<User>(`/users/${username}`);

export const getUserCopies = (username: string, page = 1) =>
  api.get<Paginated<GameCopy>>(`/users/${username}/game-copies?page=${page}`);

export const updateUser = (username: string, data: FormData) =>
  api.post<User>(`/users/${username}`, data);

export const changePassword = (username: string, data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) => api.put(`/users/${username}/password`, data);

export const followUser = (username: string) =>
  api.post(`/users/${username}/follow`);

export const unfollowUser = (username: string) =>
  api.delete(`/users/${username}/follow`);

export const getUserWishlist = (username: string, page = 1) =>
  api.get(`/users/${username}/wishlist?page=${page}`);
