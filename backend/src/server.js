import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import publicRouter from './routes/public.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import './db/database.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '50kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'barberman-api' }));
app.use('/api/public', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => res.status(404).json({ message: 'Route nicht gefunden.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET should contain at least 32 characters.');
}

app.listen(port, () => console.log(`Barberman API listening on http://localhost:${port}`));
