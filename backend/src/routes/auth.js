import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const COOKIE = 'barberman_admin_session';

function cookieOptions() {
  return `HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(Number(process.env.SESSION_MAX_AGE_MS || 28800000) / 1000)}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

function clearCookieOptions() {
  return `HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(500).json({ message: 'JWT_SECRET ist nicht sicher konfiguriert.' });

  const admin = db.prepare('SELECT id, email, password_hash, role FROM admins WHERE lower(email) = lower(?)').get(String(email).trim());
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    return res.status(401).json({ message: 'E-Mail oder Passwort ist falsch.' });
  }

  const token = jwt.sign({ role: admin.role }, process.env.JWT_SECRET, {
    subject: String(admin.id),
    expiresIn: Math.floor(Number(process.env.SESSION_MAX_AGE_MS || 28800000) / 1000),
    issuer: process.env.JWT_ISSUER || 'barberman',
    audience: process.env.JWT_AUDIENCE || 'barberman-admin',
  });

  res.setHeader('Set-Cookie', `${COOKIE}=${token}; ${cookieOptions()}`);
  res.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });
});

router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; ${clearCookieOptions()}`);
  res.json({ message: 'Abgemeldet.' });
});

export default router;
