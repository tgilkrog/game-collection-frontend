import api from './axios';

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/forgot-password', { email });
  return response.data;
}

export async function resetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/reset-password', {
    token,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  return response.data;
}
