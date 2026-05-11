import authApi from './auth';

export async function login(email: string, password: string) {
  const response = await authApi.post('/login', {
    email,
    password,
  });

  return response.data;
}