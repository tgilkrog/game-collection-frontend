import api from './axios';
import type { User } from '../types/user';
import type { GameCopy } from '../types/gamecopy';

export const getUser = (username: string) => api.get<User>(`/users/${username}`);
export const getUserCopies = (username: string) => api.get<GameCopy[]>(`/users/${username}/game-copies`);

// PHP only populates $_FILES for POST, so we spoof PUT via _method field.
// Callers must append _method='PUT' to the FormData before passing it here.
export const updateUser = (username: string, data: FormData) =>
  api.post<User>(`/users/${username}`, data);
