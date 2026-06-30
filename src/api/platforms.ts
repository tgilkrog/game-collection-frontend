import api from './axios';
import type { Platform } from '../types/platform';

export const getPlatforms = () => api.get<Platform[]>('/platforms');
