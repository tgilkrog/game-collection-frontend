import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getGameModes = () => api.get<Taxonomy[]>('/game-modes');
