import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getSessionKey } from '../src/utils/session';

import secretsRouter from './routes/secrets';
import authRouter from './routes/auth';
import vaultRouter from './routes/vault';
const app = express();

// 🔐 CORS - restrict to localhost:3001
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json());

// 🔐 Authentication middleware for protected routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    getSessionKey();
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
  }
}

// ✅ routes
// Auth routes (no auth required)
app.use('/api', authRouter);

// Protected routes (require auth)
app.use('/api/secrets', requireAuth, secretsRouter);
app.use('/api', requireAuth, vaultRouter);

app.listen(8080, () => {
  console.log('🚀 API running on http://localhost:8080');
});