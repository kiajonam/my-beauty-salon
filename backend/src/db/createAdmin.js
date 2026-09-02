import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './database.js';

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
if (!email || password.length < 12) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) are required.');
}

const existing = db.prepare('SELECT id FROM admins WHERE lower(email)=lower(?)').get(email);
if (existing) {
  console.log('Admin already exists.');
  process.exit(0);
}

const passwordHash = bcrypt.hashSync(password, 12);
db.prepare('INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)').run(email, passwordHash, 'admin');
console.log(`Admin created: ${email}`);
