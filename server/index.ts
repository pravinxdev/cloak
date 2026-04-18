import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getSessionKey } from '../src/utils/session';
import { APP_INFO } from '../src/config/version';

import secretsRouter from './routes/secrets';
import authRouter from './routes/auth';
import vaultRouter from './routes/vault';
const app = express();

// 🔐 CORS - restrict to 127.0.0.1:1201 (web UI port)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:1201',
  credentials: true,
}));

// 🔐 Add request body size limit to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

// 🔐 Authentication middleware for protected routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    getSessionKey();
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
  }
}

// ✅ PUBLIC ROUTES (no auth required)
// Info endpoint - returns app version and metadata
app.get('/api/info', (req: Request, res: Response) => {
  res.json(APP_INFO);
});

// ✅ routes
// Auth routes (no auth required)
app.use('/api', authRouter);

// Protected routes (require auth)
app.use('/api/secrets', requireAuth, secretsRouter);
app.use('/api', requireAuth, vaultRouter);

app.listen(2000, () => {
  console.log('🚀 API running on http://127.0.0.1:2000');
  
  // 🔒 SECURITY WARNING: Show HTTPS notice for non-development environments
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  WARNING: Server is running on HTTP without SSL/TLS.');
    console.warn('   In production, always use HTTPS to protect passwords and session keys.');
  }
});