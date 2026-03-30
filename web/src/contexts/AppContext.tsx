// import React, { createContext, useContext, useState, useCallback } from "react";

// export interface Secret {
//   id: string;
//   key: string;
//   value: string;
// }

// export interface Environment {
//   id: string;
//   name: string;
//   active: boolean;
// }

// interface AppState {
//   isLoggedIn: boolean;
//   secrets: Secret[];
//   environments: Environment[];
//   activeEnvironment: string;
//   login: (password: string) => boolean;
//   logout: () => void;
//   addSecret: (key: string, value: string) => void;
//   updateSecret: (id: string, key: string, value: string) => void;
//   deleteSecret: (id: string) => void;
//   importSecrets: (text: string, mode: "overwrite" | "skip") => number;
//   addEnvironment: (name: string) => void;
//   switchEnvironment: (id: string) => void;
// }

// const AppContext = createContext<AppState | null>(null);

// const INITIAL_SECRETS: Secret[] = [
//   { id: "1", key: "DATABASE_URL", value: "postgres://user:pass@localhost:5432/db" },
//   { id: "2", key: "API_KEY", value: "sk-proj-abc123def456" },
//   { id: "3", key: "JWT_SECRET", value: "super-secret-jwt-key-2024" },
//   { id: "4", key: "REDIS_URL", value: "redis://localhost:6379" },
//   { id: "5", key: "SMTP_PASSWORD", value: "mail-pass-xyz" },
// ];

// const INITIAL_ENVS: Environment[] = [
//   { id: "1", name: "development", active: true },
//   { id: "2", name: "staging", active: false },
//   { id: "3", name: "production", active: false },
// ];

// export function AppProvider({ children }: { children: React.ReactNode }) {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [secrets, setSecrets] = useState<Secret[]>(INITIAL_SECRETS);
//   const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVS);

//   const activeEnvironment = environments.find((e) => e.active)?.name || "development";

//   const login = useCallback((password: string) => {
//     if (password.length > 0) {
//       setIsLoggedIn(true);
//       return true;
//     }
//     return false;
//   }, []);

//   // const logout = useCallback(() => setIsLoggedIn(false), []);
// const logout = useCallback(async () => {
//   try {
//     await fetch('/api/logout', {
//       method: 'POST',
//     });
//   } catch (err) {
//     console.error('Logout API failed');
//   }

//   // ✅ clear UI state
//   setIsLoggedIn(false);

//   // ✅ clear local storage
//   localStorage.removeItem('cloakx_logged_in');

// }, []);
//   const addSecret = useCallback((key: string, value: string) => {
//     setSecrets((prev) => [...prev, { id: Date.now().toString(), key, value }]);
//   }, []);

//   const updateSecret = useCallback((id: string, key: string, value: string) => {
//     setSecrets((prev) => prev.map((s) => (s.id === id ? { ...s, key, value } : s)));
//   }, []);

//   const deleteSecret = useCallback((id: string) => {
//     setSecrets((prev) => prev.filter((s) => s.id !== id));
//   }, []);

//   const importSecrets = useCallback((text: string, mode: "overwrite" | "skip") => {
//     const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
//     let count = 0;
//     const parsed = lines.map((line) => {
//       const eqIndex = line.indexOf("=");
//       if (eqIndex === -1) return null;
//       return { key: line.slice(0, eqIndex).trim(), value: line.slice(eqIndex + 1).trim() };
//     }).filter(Boolean) as { key: string; value: string }[];

//     setSecrets((prev) => {
//       const updated = [...prev];
//       for (const { key, value } of parsed) {
//         const existing = updated.findIndex((s) => s.key === key);
//         if (existing >= 0) {
//           if (mode === "overwrite") {
//             updated[existing] = { ...updated[existing], value };
//             count++;
//           }
//         } else {
//           updated.push({ id: Date.now().toString() + Math.random(), key, value });
//           count++;
//         }
//       }
//       return updated;
//     });
//     return count;
//   }, []);

//   const addEnvironment = useCallback((name: string) => {
//     setEnvironments((prev) => [...prev, { id: Date.now().toString(), name, active: false }]);
//   }, []);

//   const switchEnvironment = useCallback((id: string) => {
//     setEnvironments((prev) => prev.map((e) => ({ ...e, active: e.id === id })));
//   }, []);

//   return (
//     <AppContext.Provider
//       value={{
//         isLoggedIn, secrets, environments, activeEnvironment,
//         login, logout, addSecret, updateSecret, deleteSecret,
//         importSecrets, addEnvironment, switchEnvironment,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// }

// export function useApp() {
//   const ctx = useContext(AppContext);
//   if (!ctx) throw new Error("useApp must be used within AppProvider");
//   return ctx;
// }


import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface Secret {
  id: string;
  key: string;
  value: string;
}

export interface Environment {
  id: string;
  name: string;
  active: boolean;
}

interface AppState {
  isLoggedIn: boolean;
  secrets: Secret[];
  environments: Environment[];
  activeEnvironment: string;

  loadingSecrets: boolean;
  fetchSecrets: () => Promise<void>;


  login: () => void;
  logout: () => void;

  addSecret: (key: string, value: string) => void;
  updateSecret: (id: string, key: string, value: string) => void;
  deleteSecret: (id: string) => void;
  importSecrets: (text: string, mode: "overwrite" | "skip") => number;

  addEnvironment: (name: string) => void;
  switchEnvironment: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const INITIAL_SECRETS: Secret[] = [
  { id: "1", key: "DATABASE_URL", value: "postgres://user:pass@localhost:5432/db" },
];

const INITIAL_ENVS: Environment[] = [
  { id: "1", name: "development", active: true },
  { id: "2", name: "staging", active: false },
  { id: "3", name: "production", active: false },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [secrets, setSecrets] = useState<Secret[]>();
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVS);
const [loadingSecrets, setLoadingSecrets] = useState(false);

  const activeEnvironment =
    environments.find((e) => e.active)?.name || "development";

  // ✅ sync login state from localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem("cloakx_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // ✅ login (state only)
  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);
const fetchSecrets = useCallback(async () => {
  try {
    setLoadingSecrets(true);

    const res = await fetch("/api/secrets", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch secrets");
    }

    const data = await res.json();

    // adjust if your API wraps response
    setSecrets(data);

  } catch (err) {
    console.error("Error fetching secrets", err);
  } finally {
    setLoadingSecrets(false);
  }
}, []);
  // ✅ logout with API
const logout = useCallback(async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout API failed");
  }

  // ✅ clear everything regardless of API result
  setIsLoggedIn(false);
  localStorage.removeItem("cloakx_logged_in");

  // ✅ redirect to login page
  // window.location.href = "/login";

}, []);  const addSecret = useCallback((key: string, value: string) => {
    setSecrets((prev) => [
      ...prev,
      { id: Date.now().toString(), key, value },
    ]);
  }, []);

  const updateSecret = useCallback(
    (id: string, key: string, value: string) => {
      setSecrets((prev) =>
        prev.map((s) => (s.id === id ? { ...s, key, value } : s))
      );
    },
    []
  );

  const deleteSecret = useCallback((id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const importSecrets = useCallback(
    (text: string, mode: "overwrite" | "skip") => {
      const lines = text
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"));

      let count = 0;

      const parsed = lines
        .map((line) => {
          const eqIndex = line.indexOf("=");
          if (eqIndex === -1) return null;
          return {
            key: line.slice(0, eqIndex).trim(),
            value: line.slice(eqIndex + 1).trim(),
          };
        })
        .filter(Boolean) as { key: string; value: string }[];

      setSecrets((prev) => {
        const updated = [...prev];

        for (const { key, value } of parsed) {
          const existing = updated.findIndex((s) => s.key === key);

          if (existing >= 0) {
            if (mode === "overwrite") {
              updated[existing] = { ...updated[existing], value };
              count++;
            }
          } else {
            updated.push({
              id: Date.now().toString() + Math.random(),
              key,
              value,
            });
            count++;
          }
        }

        return updated;
      });

      return count;
    },
    []
  );

  const addEnvironment = useCallback((name: string) => {
    setEnvironments((prev) => [
      ...prev,
      { id: Date.now().toString(), name, active: false },
    ]);
  }, []);

  const switchEnvironment = useCallback((id: string) => {
    setEnvironments((prev) =>
      prev.map((e) => ({ ...e, active: e.id === id }))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        secrets,
        environments,
        activeEnvironment,
        loadingSecrets,
        fetchSecrets,

        login,
        logout,
        addSecret,
        updateSecret,
        deleteSecret,
        importSecrets,
        addEnvironment,
        switchEnvironment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}