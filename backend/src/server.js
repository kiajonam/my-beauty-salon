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
const configuredOrigins = String(process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes(origin)) return callback(null, true);
    if (!isProduction && /^https?:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'my-beauty-salon-api' }));
app.use('/api/public', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => res.status(404).json({ message: 'Route nicht gefunden.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: isProduction ? 'Interner Serverfehler.' : (error.message || 'Interner Serverfehler.') });
});

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters.');
}
if (!process.env.FRONTEND_URL) {
  console.warn('Warning: FRONTEND_URL is not configured; using localhost default.');
}
if (isProduction && (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM)) {
  console.warn('Warning: SMTP is not fully configured. Appointment emails will be skipped.');
}

app.listen(port, () => console.log(`My Beauty Salon API listening on port ${port}`));
