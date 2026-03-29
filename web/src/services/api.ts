const BASE_URL = '/api';

export const api = {
  login: async (password: string) => {
    return fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  },

  logout: async () => {
    return fetch(`${BASE_URL}/logout`, { method: 'POST' });
  },

  getSecrets: async () => {
    return fetch(`${BASE_URL}/secrets`);
  },

  addSecret: async (key: string, value: string) => {
    return fetch(`${BASE_URL}/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  },

  deleteSecret: async (key: string) => {
    return fetch(`${BASE_URL}/secrets/${key}`, {
      method: 'DELETE',
    });
  },

  exportSecrets: async () => {
    return fetch(`${BASE_URL}/export`);
  },

  importSecrets: async (data: string) => {
    return fetch(`${BASE_URL}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
  },
};