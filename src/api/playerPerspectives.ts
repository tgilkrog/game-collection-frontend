import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getPlayerPerspectives = () => api.get<Taxonomy[]>('/player-perspectives');
