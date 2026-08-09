export const TOKEN_KEY = 'lab_resource_token';
export const USER_KEY = 'lab_resource_user';

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getToken() {
  return storage()?.getItem(TOKEN_KEY) ?? '';
}

export function getStoredUser() {
  const value = storage()?.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function saveSession({ token, user }) {
  if (!token) {
    throw new Error('A session token is required');
  }

  storage()?.setItem(TOKEN_KEY, token);

  if (user) {
    saveUser(user);
  }
}

export function saveUser(user) {
  if (user) {
    storage()?.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  storage()?.removeItem(TOKEN_KEY);
  storage()?.removeItem(USER_KEY);
}

export function displayName(user) {
  if (!user) {
    return 'Lab Manager';
  }

  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

export function formatRole(role) {
  if (!role) {
    return 'Lab Manager';
  }

  return role
    .replace(/^ROLE_/, '')
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
