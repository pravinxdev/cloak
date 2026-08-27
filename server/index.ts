import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { getSessionKey } from '../src/utils/session';
import { APP_INFO } from '../src/config/version';

import secretsRouter from './routes/secrets';
import authRouter from './routes/auth';
import vaultRouter from './routes/vault';
import shareRouter from './routes/share';

const app = express();

const allowedOrigins = [
  'http://127.0.0.1:1201',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));

// Serve static files from public folder
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    getSessionKey();
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
  }
}

app.get('/api/info', (req: Request, res: Response) => {
  res.json(APP_INFO);
});

app.use('/api', authRouter);
app.use('/api/share', requireAuth, shareRouter);
app.use('/api/secrets', requireAuth, secretsRouter);
app.use('/api', requireAuth, vaultRouter);

// SPA fallback - serve index.html for non-API routes
app.get('/{*any}', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

app.listen(2000, '127.0.0.1', () => {
  console.log('🚀 API running on http://127.0.0.1:2000');
  
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ WARNING: Server is running on HTTP without SSL/TLS.');
    console.warn('   In production, always use HTTPS to protect passwords and session keys.');
  }
});
