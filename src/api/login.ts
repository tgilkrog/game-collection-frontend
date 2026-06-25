import authApi from './auth';

export async function login(email: string, password: string) {
  const response = await authApi.post('/login', {
    email,
    password,
  });

  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  const response = await authApi.post('/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });

  return response.data as { user: import('../types/user').User; token: string };
}