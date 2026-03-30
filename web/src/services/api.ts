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
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
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

  addSecret: (key: string, value: string) =>
    request('/secrets', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
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

  clearVault: () =>
    request("/secrets", {
      method: "DELETE",
    }),
};