import api from './axios';

export const getHome = () =>
  api.get('/home');