export function getApiErrorMessage(error, fallback = 'Unable to complete the request.') {
  const data = error?.response?.data;

  if (data?.validationErrors) {
    return Object.values(data.validationErrors).join(' ');
  }

  if (data?.message) {
    return data.message;
  }

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to access this resource.';
  }

  if (!error?.response) {
    return 'Backend API is offline or unreachable.';
  }

  return fallback;
}

export function isForbidden(error) {
  return error?.response?.status === 403;
}
