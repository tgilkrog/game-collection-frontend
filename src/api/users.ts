import api from './axios';
import type { User } from '../Context/AuthContext';
import type { GameCopy } from '../types/gamecopy';

export const getUser = (username: string) => api.get<User>(`/users/${username}`);
export const getUserCopies = (username: string) => api.get<GameCopy[]>(`/users/${username}/game-copies`);
