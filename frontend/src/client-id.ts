const CLIENT_ID_STORAGE_KEY = 'tdd-client-id';

export function getClientId(): string {
  const existingClientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);

  if (existingClientId) {
    return existingClientId;
  }

  const clientId = crypto.randomUUID();

  localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);

  return clientId;
}