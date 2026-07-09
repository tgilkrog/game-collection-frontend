import api from './axios';
import type { Taxonomy } from '../types/taxonomy';

export const getThemes = () => api.get<Taxonomy[]>('/themes');
