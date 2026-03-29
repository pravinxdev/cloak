import express from 'express';
import cors from 'cors';

import secretsRouter from './routes/secrets';
import authRouter from './routes/auth';
import vaultRouter from './routes/valut';
const app = express();

app.use(cors());
app.use(express.json());

// ✅ routes
app.use('/api/secrets', secretsRouter);
app.use('/api', authRouter);
app.use('/api', vaultRouter);

app.listen(3001, () => {
  console.log('🚀 API running on http://localhost:3001');
});