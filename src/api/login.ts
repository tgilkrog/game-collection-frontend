import api from './axios';
import type { User } from '../types/user';

export async function login(email: string, password: string): Promise<{ user: User }> {
  const response = await api.post<{ user: User }>('/login', { email, password });
  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ user: User }> {
  const response = await api.post<{ user: User }>('/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return response.data;
}
