// const BASE_URL = '/api';

// async function request(path: string, options: any = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     ...options,
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.error || 'Something went wrong');
//   }

//   return data;
// }

// export const api = {
//   login: (password: string) =>
//     request('/login', {
//       method: 'POST',
//       body: JSON.stringify({ password }),
//     }),

//   logout: () =>
//     request('/logout', { method: 'POST' }),

//   getSecrets: () =>
//     request('/secrets'),

//   addSecret: (key: string, value: string) =>
//     request('/secrets', {
//       method: 'POST',
//       body: JSON.stringify({ key, value }),
//     }),

//   deleteSecret: (key: string) =>
//     request(`/secrets/${key}`, {
//       method: 'DELETE',
//     }),

//   exportSecrets: () =>
//     request('/export'),

//   importSecrets: (data: string) =>
//     request('/import', {
//       method: 'POST',
//       body: JSON.stringify({ data }),
//     }),

//   setEnv: (env: string) =>
//     request('/env', {
//       method: 'POST',
//       body: JSON.stringify({ env }),
//     }),

//   runCommand: (command: string) =>
//     request('/run', {
//       method: 'POST',
//       body: JSON.stringify({ command }),
//     }),
// };
const BASE_URL = '/api';

async function request(path: string, options: any = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // ✅ FIXED: Include cookies for session management
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// 📊 Types for metadata
export interface SecretData {
  key: string;
  value: string;
  tags?: string[];
  environment?: string;
  expiresAt?: number;
}

export const api = {
  login: (password: string) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  logout: () =>
    request('/logout', { method: 'POST' }),

  getSecrets: () =>
    request('/secrets'),

  addSecret: (key: string, value: string, metadata?: { tags?: string[]; environment?: string; expires?: string }) =>
    request('/secrets', {
      method: 'POST',
      body: JSON.stringify({ 
        key, 
        value,
        tags: metadata?.tags,
        environment: metadata?.environment,
        expires: metadata?.expires
      }),
    }),

  deleteSecret: (key: string) =>
    request(`/secrets/${key}`, {
      method: 'DELETE',
    }),

  exportSecrets: () =>
    request('/export'),

  importSecrets: (data: string) =>
    request('/import', {
      method: 'POST',
      body: JSON.stringify({ data }),
    }),

  setEnv: (env: string) =>
    request('/env', {
      method: 'POST',
      body: JSON.stringify({ env }),
    }),

  runCommand: (command: string) =>
    request('/run', {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  clearVault: (environment?: string) =>
    request("/secrets", {
      method: "DELETE",
      body: environment ? JSON.stringify({ environment }) : undefined,
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),

  recoverVaults: (oldPassword: string) =>
    request('/recover-vaults', {
      method: 'POST',
      body: JSON.stringify({ oldPassword }),
    }),
};