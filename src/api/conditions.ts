import api from './axios';

const BASE_URL = '/conditions';

export const getConditions = () =>
  api.get(BASE_URL);