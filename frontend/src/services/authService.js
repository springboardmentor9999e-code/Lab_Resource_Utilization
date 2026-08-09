import api from '../api/client.js';

export async function register(data) {
  const { firstName, lastName, email, password } = data;
  const response = await api.post('/auth/register', {
    firstName,
    lastName,
    email,
    password,
  });

  return response.data;
}
