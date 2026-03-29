// import { Command } from 'commander';
// import express from 'express';
// import path from 'path';
// import fs from 'fs';
// import { loadVault, saveVault } from '../utils/vault';
// import { encrypt, decrypt } from '../utils/crypto';
// import { getSessionKey } from '../utils/session';

// export function webCommand() {
//   const cmd = new Command('web');

//   cmd.description('Start Cloakx Web UI');

//   cmd.action(() => {
//     const app = express();
//     const PORT = 3000;

//     app.use(express.json());

//     // Serve static UI
//     app.use(express.static(path.join(__dirname, '../../web')));

//     // 🔐 Get all secrets
//     app.get('/api/secrets', (req, res) => {
//       try {
//         const key = getSessionKey();
//         const vault = loadVault();

//         const data = Object.keys(vault).map((k) => ({
//           key: k,
//           value: decrypt(vault[k], key),
//         }));

//         res.json(data);
//       } catch {
//         res.status(401).json({ error: 'Not logged in' });
//       }
//     });

//     // ➕ Add / update
//     app.post('/api/secrets', (req, res) => {
//       try {
//         const keyBuf = getSessionKey();
//         const { key, value } = req.body;

//         const vault = loadVault();
//         vault[key] = encrypt(value, keyBuf);
//         saveVault(vault);

//         res.json({ success: true });
//       } catch {
//         res.status(401).json({ error: 'Not logged in' });
//       }
//     });

//     // ❌ Delete
//     app.delete('/api/secrets/:key', (req, res) => {
//       const vault = loadVault();
//       delete vault[req.params.key];
//       saveVault(vault);

//       res.json({ success: true });
//     });

//     app.listen(PORT, () => {
//       console.log(`🌐 Cloakx UI running at http://localhost:${PORT}`);
//     });
//   });

//   return cmd;
// }
// import { Command } from 'commander';
// import express from 'express';
// import path from 'path';
// import { execSync } from 'child_process';
// import { loadVault, saveVault } from '../utils/vault';
// import { encrypt, decrypt } from '../utils/crypto';
// import { getSessionKey } from '../utils/session';
// import open from 'open';
// export function webCommand() {
//   const cmd = new Command('web');

//   cmd.description('Start Cloakx Web UI');

//   cmd.action(() => {
//     const app = express();
//     const PORT = 3000;

//     console.log('⚙️ Building frontend...');

//     // 🔥 Build React app
//     execSync('npm run build', {
//       cwd: path.join(process.cwd(), 'web'),
//       stdio: 'inherit',
//     });

//     app.use(express.json());

//     // ✅ Serve built UI
//     const distPath = path.join(process.cwd(), 'web', 'dist');
//     app.use(express.static(distPath));

//     // 🔐 API routes
//     app.get('/api/secrets', (req, res) => {
//       try {
//         const key = getSessionKey();
//         const vault = loadVault();

//         const data = Object.keys(vault).map((k) => ({
//           key: k,
//           value: decrypt(vault[k], key),
//         }));

//         res.json(data);
//       } catch {
//         res.status(401).json({ error: 'Not logged in' });
//       }
//     });

//     app.post('/api/secrets', (req, res) => {
//       try {
//         const keyBuf = getSessionKey();
//         const { key, value } = req.body;

//         const vault = loadVault();
//         vault[key] = encrypt(value, keyBuf);
//         saveVault(vault);

//         res.json({ success: true });
//       } catch {
//         res.status(401).json({ error: 'Not logged in' });
//       }
//     });

//     app.delete('/api/secrets/:key', (req, res) => {
//       const vault = loadVault();
//       delete vault[req.params.key];
//       saveVault(vault);

//       res.json({ success: true });
//     });

//     // 🔥 Important for React routing
//     // app.get('/*', (req, res) => {
//     //   res.sendFile(path.join(distPath, 'index.html'));
//     // });
//     app.use((req, res) => {
//   res.sendFile(path.join(distPath, 'index.html'));
// });

//     app.listen(PORT, () => {
//       console.log(`🌐 Cloakx UI running at http://localhost:${PORT}`);
//       open(`http://localhost:${PORT}`);
//     });
//   });

//   return cmd;
// }
import { Command } from 'commander';
import express from 'express';
import path from 'path';
import { loadVault, saveVault } from '../utils/vault';
import { encrypt, decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';
import authRouter from '../../server/routes/auth'; 

export function webCommand() {
  const cmd = new Command('web');

  cmd.description('Start Cloakx Web UI');

  cmd.action(() => {
    const app = express();
    const PORT = 3000;

    app.use(express.json());
    
app.use('/api', authRouter);

    const distPath = path.join(process.cwd(), 'web', 'dist');

    // ✅ Serve frontend
    app.use(express.static(distPath));

    // 🔐 Get secrets
    app.get('/api/secrets', (req, res) => {
      try {
        const key = getSessionKey();
        const vault = loadVault();

        const data = Object.keys(vault).map((k) => ({
          key: k,
          value: decrypt(vault[k], key),
        }));

        res.json(data);
      } catch {
        res.status(401).json({ error: 'Not logged in' });
      }
    });

    // ➕ Add/update
    app.post('/api/secrets', (req, res) => {
      try {
        const keyBuf = getSessionKey();
        const { key, value } = req.body;

        const vault = loadVault();
        vault[key] = encrypt(value, keyBuf);
        saveVault(vault);

        res.json({ success: true });
      } catch {
        res.status(401).json({ error: 'Not logged in' });
      }
    });

    // ❌ Delete
    app.delete('/api/secrets/:key', (req, res) => {
      try {
        getSessionKey();
      } catch {
        return res.status(401).json({ error: 'Not logged in' });
      }

      const vault = loadVault();
      delete vault[req.params.key];
      saveVault(vault);

      res.json({ success: true });
    });

    // 🔁 SPA fallback (Express v5 safe)
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`🌐 Cloakx UI running at http://localhost:${PORT}`);
    });
  });

  return cmd;
}