// import fs from 'fs';
// import path from 'path';
// import { sessionPath } from '../config/paths';

// export function createSession(password: string,username='user') {
//   const sessionDir = path.dirname(sessionPath);

//   // Create directory if it doesn't exist
//   if (!fs.existsSync(sessionDir)) {
//     fs.mkdirSync(sessionDir, { recursive: true });
//   }

//   const session = {
//     // 🔐 Encode password as base64 (same as your older version)
//     token: Buffer.from(password).toString('base64'),
//     username,
//     createdAt: new Date().toISOString(), // human-readable timestamp
//     createdAtTimestamp: Date.now()       // numeric timestamp for expiry checks
//   };

//   fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
// }

// export function getSessionPassword(): string {
//   // if (!fs.existsSync(sessionPath)) throw new Error('No active session. Please login.');

//   const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
//   const now = Date.now();

//   // if (!session.createdAtTimestamp || now - session.createdAtTimestamp > 30 * 60 * 1000) {
//   //   fs.unlinkSync(sessionPath);
//   //   throw new Error('Session expired. Please login again.');
//   // }

//   // Decode base64 back to original password
//   return Buffer.from(session.token, 'base64').toString('utf-8');
// }


// export function getSession() {
//   if (!fs.existsSync(sessionPath)) return null;

//   try {
//     const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

//     const now = Date.now();
//     const isExpired = !session.createdAtTimestamp || now - session.createdAtTimestamp > 30 * 60 * 1000;

//     // if (isExpired) {
//     //   fs.unlinkSync(sessionPath);
//     //   return null;
//     // }

//     return {
//       username: session.username || 'user', // default, or fetch from vault if available
//       token: session.token,
//       createdAt: session.createdAt,
//       expiresAt: new Date(session.createdAtTimestamp + 30 * 60 * 1000).toISOString()
//     };
//   } catch (err) {
//     return null;
//   }
// }



// export function clearSession() {
//   if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
// }
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sessionPath } from '../config/paths';

export function createSession(key: Buffer, username = 'user') {
  const sessionDir = path.dirname(sessionPath);

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const session = {
    token: crypto.randomBytes(24).toString('hex'),
    username,
    key: key.toString('hex'), // ✅ store derived key
    createdAt: new Date().toISOString(),
    createdAtTimestamp: Date.now()
  };

  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  fs.chmodSync(sessionPath, 0o600);
}

// 🔑 Get session key
export function getSessionKey(): Buffer {
  if (!fs.existsSync(sessionPath)) {
    throw new Error('Please login first');
  }

  try {
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

    if (!session.key) {
      throw new Error('Invalid session: session key is missing');
    }

    const now = Date.now();

    if (!session.createdAtTimestamp || now - session.createdAtTimestamp > 30 * 60 * 1000) {
      fs.unlinkSync(sessionPath);
      throw new Error('Session expired. Please login again.');
    }

    return Buffer.from(session.key, 'hex');
  } catch (err: any) {
    if (err.message.includes('Session')) throw err;
    throw new Error('Failed to load session: ' + err.message);
  }
}

// ℹ️ Session info
export function getSession() {
  if (!fs.existsSync(sessionPath)) return null;

  try {
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

    const now = Date.now();
    const isExpired = !session.createdAtTimestamp || now - session.createdAtTimestamp > 30 * 60 * 1000;

    if (isExpired) {
      fs.unlinkSync(sessionPath);
      return null;
    }

    return {
      username: session.username,
      token: session.token,
      createdAt: session.createdAt,
      expiresAt: new Date(session.createdAtTimestamp + 30 * 60 * 1000).toISOString()
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
}