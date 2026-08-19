import api from './axios';
import type { Condition } from '../types/condition';

const BASE_URL = '/conditions';

export const getConditions = () =>
  api.get(BASE_URL);

export const createCondition = (data: Omit<Condition, 'id'>) =>
  api.post(BASE_URL, data);

export const updateCondition = (id: number, data: Partial<Condition>) =>
  api.put(`${BASE_URL}/${id}`, data);

export const deleteCondition = (id: number) =>
  api.delete(`${BASE_URL}/${id}`);
