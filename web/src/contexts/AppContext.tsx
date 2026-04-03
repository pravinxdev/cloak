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
  needsRecovery: boolean;
  sessionKey: string; // 🔐 Base64-encoded session key for frontend decryption

  loadingSecrets: boolean;
  fetchSecrets: () => Promise<void>;
  fetchEnvironments: () => Promise<void>;
  fetchSessionKey: () => Promise<void>; // 🔐 Fetch session key from backend

  login: () => void;
  logout: () => void;

  addSecret: (key: string, value: string) => void;
  updateSecret: (id: string, key: string, value: string) => void;
  deleteSecret: (id: string) => void;
  importSecrets: (text: string, mode: "overwrite" | "skip") => number;

  addEnvironment: (name: string) => Promise<void>;
  switchEnvironment: (id: string) => Promise<void>;
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
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVS);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [sessionKey, setSessionKey] = useState<string>(""); // 🔐 Store base64 session key

  const activeEnvironment =
    environments.find((e) => e.active)?.name || "development";

  // ✅ sync login state from localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem("cloakx_logged_in") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // ✅ Fetch environments from API
  const fetchEnvironments = useCallback(async () => {
    try {
      const res = await fetch("/api/environments", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch environments");
      }

      const data = await res.json();
      
      // 🔥 Backend now returns { environments: string[], activeEnvironment: string }
      const envList = Array.isArray(data) ? data : (data.environments || []);
      const activeEnv = typeof data === 'object' && data.activeEnvironment ? data.activeEnvironment : envList[0];
      
      // Convert to Environment objects
      const envs: Environment[] = envList.map((name: string) => ({
        id: name,
        name,
        active: name === activeEnv,
      }));
      setEnvironments(envs.length > 0 ? envs : INITIAL_ENVS);
    } catch (err) {
      console.error("Error fetching environments", err);
      // fallback to initial envs
      setEnvironments(INITIAL_ENVS);
    }
  }, []);

  // ✅ Fetch session key from API
  const fetchSessionKey = useCallback(async () => {
    try {
      console.log('🔑 Fetching session key...');
      const res = await fetch("/api/session-key", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch session key");
      }

      const data = await res.json();
      console.log('✅ Session key fetched (base64):', data.sessionKey?.substring(0, 30) + '...');
      setSessionKey(data.sessionKey || "");
      console.log('✅ Session key stored in context state');
    } catch (err) {
      console.error("❌ Error fetching session key", err);
    }
  }, []);

  // ✅ login (state only)
  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  // ✅ Fetch secrets from API
  const fetchSecrets = useCallback(async () => {
    try {
      setLoadingSecrets(true);
      setNeedsRecovery(false);

      const res = await fetch("/api/secrets", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401 && errorText.includes("bad decrypt")) {
          setNeedsRecovery(true);
          return;
        }
        throw new Error("Failed to fetch secrets");
      }

      const data = await res.json();
      
      // 🔥 Convert API response to Secret[] format (add id field)
      const secrets: Secret[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.key,  // Use key as id
        key: item.key,
        value: item.value,
        // metadata is kept in item but not in Secret type
      }));
      
      setSecrets(secrets);
      setNeedsRecovery(false);

    } catch (err: any) {
      console.error("Error fetching secrets", err);
      // Check if error message contains "bad decrypt"
      if (err.message && err.message.includes("bad decrypt")) {
        setNeedsRecovery(true);
      }
    } finally {
      setLoadingSecrets(false);
    }
  }, []);

  // ✅ Load environments and session key on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchEnvironments();
      fetchSecrets();
      fetchSessionKey(); // 🔐 Also fetch session key for frontend decryption
    }
  }, [isLoggedIn, fetchEnvironments, fetchSecrets, fetchSessionKey]);

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
  setSecrets([]);
  localStorage.removeItem("cloakx_logged_in");

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

  const addEnvironment = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/environments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        throw new Error("Failed to create environment");
      }

      // Refresh environments list
      await fetchEnvironments();
    } catch (err) {
      console.error("Error adding environment", err);
    }
  }, [fetchEnvironments]);

  const switchEnvironment = useCallback(async (id: string) => {
    try {
      const env = environments.find(e => e.id === id);
      if (!env) return;

      const res = await fetch("/api/environments/switch", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: env.name })
      });

      if (!res.ok) {
        throw new Error("Failed to switch environment");
      }

      // Refresh environments list to get updated active status
      await fetchEnvironments();
    } catch (err) {
      console.error("Error switching environment", err);
    }
  }, [environments, fetchEnvironments]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        secrets,
        environments,
        activeEnvironment,
        sessionKey,
        needsRecovery,
        loadingSecrets,
        fetchSecrets,
        fetchEnvironments,
        fetchSessionKey,

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

export { AppContext };