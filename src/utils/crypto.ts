import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const salt = 'cloak_salt';

export function encrypt(text: string, password: string): string {
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(data: string, password: string): string {
  const [ivHex, encryptedHex] = data.split(':');
  const key = crypto.scryptSync(password, salt, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}