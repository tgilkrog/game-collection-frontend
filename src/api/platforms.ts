import api from './axios';

const BASE_URL = '/platforms';

export const getPlatforms = () =>
  api.get(BASE_URL);