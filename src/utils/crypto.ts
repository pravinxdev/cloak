// import crypto from 'crypto';

// const algorithm = 'aes-256-cbc';
// const salt = 'cloak_salt';

// // export function encrypt(text: string, password: string): string {
// //   const key = crypto.scryptSync(password, salt, 32);
// //   const iv = crypto.randomBytes(16);
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
// //   return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
// // }

// export function encrypt(text: string, key: Buffer): string {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

//   const encrypted = Buffer.concat([
//     cipher.update(text, 'utf8'),
//     cipher.final()
//   ]);

//   return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
// }


// // export function decrypt(data: string, password: string): string {
// //   const [ivHex, encryptedHex] = data.split(':');
// //   const key = crypto.scryptSync(password, salt, 32);
// //   const iv = Buffer.from(ivHex, 'hex');
// //   const encrypted = Buffer.from(encryptedHex, 'hex');
// //   const decipher = crypto.createDecipheriv(algorithm, key, iv);
// //   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
// //   return decrypted.toString('utf8');
// // }

// export function decrypt(data: string, key: Buffer): string {
//   const [ivHex, encryptedHex] = data.split(':');

//   const iv = Buffer.from(ivHex, 'hex');
//   const encrypted = Buffer.from(encryptedHex, 'hex');

//   const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

//   return Buffer.concat([
//     decipher.update(encrypted),
//     decipher.final()
//   ]).toString('utf8');
// }


// export function deriveKey(password: string): Buffer {
//   return crypto.scryptSync(password, 'cloakx_salt', 32);
// }



import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sessionPath } from '../config/paths';

// 🔐 FIXED: Use hardcoded salt for better security
// This is safer than storing in plaintext file
const HARDCODED_SALT = 'cloakx_vault_0x2024_v1';

// 🔑 Derive key from password
export function deriveKey(password: string): Buffer {
  return crypto.scryptSync(password, HARDCODED_SALT, 32);
}

// 🔒 Encrypt using derived key
export function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

// 🔓 Decrypt using derived key
export function decrypt(data: string, key: Buffer): string {
  const [ivHex, encryptedHex] = data.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}