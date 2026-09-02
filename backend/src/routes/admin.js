import { Router } from 'express';
import db from '../db/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { STATUSES } from './public.js';

const router = Router();
router.use(requireAdmin);
const activeStatuses = ['Neu', 'Bestätigt'];
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

router.get('/me', (req, res) => {
  const admin = db.prepare('SELECT id, email, role, created_at AS createdAt FROM admins WHERE id = ?').get(req.admin.sub);
  res.json({ admin });
});

router.get('/dashboard', (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    appointmentsToday: db.prepare("SELECT COUNT(*) AS count FROM appointments WHERE date = ? AND status NOT IN ('Storniert','Abgelehnt')").get(today).count,
    pendingAppointments: db.prepare("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Neu'").get().count,
    customers: db.prepare('SELECT COUNT(*) AS count FROM customers').get().count,
    revenue: db.prepare("SELECT COALESCE(SUM(s.price_from),0) AS total FROM appointments a JOIN services s ON s.id=a.service_id WHERE a.status IN ('Neu','Bestätigt','Erledigt') AND a.date >= date('now','start of month')").get().total,
  };
  res.json({ stats });
});

router.get('/appointments', (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const date = req.query.date ? String(req.query.date) : null;
  let sql = `SELECT a.id, a.date, a.time, a.end_time AS endTime, a.status, a.note, a.created_at AS createdAt,
    c.id AS customerId, c.name AS customerName, c.email, c.phone,
    s.id AS serviceId, s.name AS serviceName, s.price_from AS priceFrom, s.duration_minutes AS durationMinutes
    FROM appointments a JOIN customers c ON c.id=a.customer_id JOIN services s ON s.id=a.service_id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND a.status = ?'; params.push(status); }
  if (date) { sql += ' AND a.date = ?'; params.push(date); }
  sql += ' ORDER BY a.date ASC, a.time ASC';
  res.json({ appointments: db.prepare(sql).all(...params) });
});

router.patch('/appointments/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || '');
  if (!Number.isInteger(id) || id <= 0 || !STATUSES.includes(status)) return res.status(400).json({ message: 'Ungültiger Termin oder Status.' });
  const appointment = db.prepare('SELECT id,date,time,end_time AS endTime,status FROM appointments WHERE id=?').get(id);
  if (!appointment) return res.status(404).json({ message: 'Termin nicht gefunden.' });
  if (activeStatuses.includes(status) && !activeStatuses.includes(appointment.status)) {
    const overlap = db.prepare("SELECT id FROM appointments WHERE id<>? AND date=? AND status IN ('Neu','Bestätigt') AND time<? AND end_time>? LIMIT 1").get(id, appointment.date, appointment.endTime, appointment.time);
    if (overlap) return res.status(409).json({ message: 'Dieser Termin überschneidet sich mit einem bestehenden Termin.' });
  }
  db.prepare('UPDATE appointments SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, id);
  res.json({ message: 'Status aktualisiert.' });
});

router.get('/customers', (_req, res) => {
  const customers = db.prepare(`SELECT c.id, c.name, c.email, c.phone, c.notes, c.created_at AS createdAt,
    COUNT(a.id) AS appointmentCount, MAX(a.date) AS lastAppointment
    FROM customers c LEFT JOIN appointments a ON a.customer_id=c.id GROUP BY c.id ORDER BY c.name`).all();
  res.json({ customers });
});

router.patch('/customers/:id', (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 180);
  const phone = String(req.body?.phone || '').trim().slice(0, 40);
  const notes = String(req.body?.notes || '').trim().slice(0, 1000);
  if (name.length < 2 || !validEmail(email) || phone.length < 6) return res.status(400).json({ message: 'Ungültige Kundendaten.' });
  const result = db.prepare('UPDATE customers SET name=?, email=?, phone=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name, email, phone, notes, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ message: 'Kunde nicht gefunden.' });
  res.json({ message: 'Kunde aktualisiert.' });
});

router.get('/services', (_req, res) => {
  res.json({ services: db.prepare('SELECT id, name, category, description, price_from AS priceFrom, duration_minutes AS durationMinutes, active FROM services ORDER BY category, name').all() });
});

router.post('/services', (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const category = String(req.body?.category || 'Haare').trim().slice(0, 60);
  const description = String(req.body?.description || '').trim().slice(0, 500);
  const price = Number(req.body?.priceFrom);
  const duration = Number(req.body?.durationMinutes);
  if (name.length < 2 || !category || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 10 || duration > 480) return res.status(400).json({ message: 'Ungültige Dienstleistung.' });
  const result = db.prepare('INSERT INTO services (name, category, description, price_from, duration_minutes) VALUES (?, ?, ?, ?, ?)').run(name, category, description, price, duration);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/services/:id', (req, res) => {
  const fields = [];
  const values = [];
  if (req.body?.name != null) { const value=String(req.body.name).trim().slice(0,120); if(value.length<2)return res.status(400).json({message:'Ungültiger Name.'}); fields.push('name=?'); values.push(value); }
  if (req.body?.category != null) { const value=String(req.body.category).trim().slice(0,60); if(!value)return res.status(400).json({message:'Ungültige Kategorie.'}); fields.push('category=?'); values.push(value); }
  if (req.body?.description != null) { fields.push('description=?'); values.push(String(req.body.description).trim().slice(0,500)); }
  if (req.body?.priceFrom != null) { const value=Number(req.body.priceFrom); if(!Number.isFinite(value)||value<0)return res.status(400).json({message:'Ungültiger Preis.'}); fields.push('price_from=?'); values.push(value); }
  if (req.body?.durationMinutes != null) { const value=Number(req.body.durationMinutes); if(!Number.isInteger(value)||value<10||value>480)return res.status(400).json({message:'Ungültige Dauer.'}); fields.push('duration_minutes=?'); values.push(value); }
  if (req.body?.active != null) { fields.push('active=?'); values.push(req.body.active ? 1 : 0); }
  if (!fields.length) return res.status(400).json({ message: 'Keine Änderungen.' });
  fields.push('updated_at=CURRENT_TIMESTAMP');
  values.push(Number(req.params.id));
  const result = db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id=?`).run(...values);
  if (!result.changes) return res.status(404).json({ message: 'Dienstleistung nicht gefunden.' });
  res.json({ message: 'Dienstleistung aktualisiert.' });
});

router.get('/reviews', (_req, res) => {
  res.json({ reviews: db.prepare('SELECT id, customer_name AS customerName, rating, text, status, created_at AS createdAt FROM reviews ORDER BY created_at DESC').all() });
});

router.patch('/reviews/:id/status', (req, res) => {
  const allowed = ['Pending', 'Freigegeben', 'Abgelehnt'];
  const status = String(req.body?.status || '');
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Ungültiger Bewertungsstatus.' });
  const result = db.prepare('UPDATE reviews SET status=? WHERE id=?').run(status, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ message: 'Bewertung nicht gefunden.' });
  res.json({ message: 'Bewertung aktualisiert.' });
});

export default router;
