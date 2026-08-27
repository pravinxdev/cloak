import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sessionPath } from '../config/paths';

export function createSession(key: Buffer, username = 'user') {
  const sessionDir = path.dirname(sessionPath);

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true, mode: 0o700 });
  }

  const session = {
    token: crypto.randomBytes(24).toString('hex'),
    username,
    key: key.toString('hex'),
    createdAt: new Date().toISOString(),
    createdAtTimestamp: Date.now()
  };

  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  try {
    fs.chmodSync(sessionPath, 0o600);
  } catch {
    // Chmod may not apply on Windows, ignore silently
  }
}

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
