import { Router } from 'express';
import db from '../db/database.js';

const router = Router();
const OPENING_HOURS = {
  1: ['09:00', '18:00'],
  2: ['09:00', '18:00'],
  3: ['09:00', '18:00'],
  4: ['09:00', '19:00'],
  5: ['09:00', '19:00'],
  6: ['09:00', '16:00'],
  0: null,
};
const STATUSES = ['Neu', 'Bestätigt', 'Erledigt', 'Storniert', 'Abgelehnt'];

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value);
const validTime = value => /^\d{2}:\d{2}$/.test(value);

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function slotsForDate(date, durationMinutes = 30) {
  const day = new Date(`${date}T12:00:00`).getDay();
  const hours = OPENING_HOURS[day];
  if (!hours) return [];
  const start = hours[0].split(':').map(Number);
  const end = hours[1].split(':').map(Number);
  const startMin = start[0] * 60 + start[1];
  const endMin = end[0] * 60 + end[1];
  const result = [];
  for (let t = startMin; t + durationMinutes <= endMin; t += 30) {
    result.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }
  return result;
}

function isFutureDate(date) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return date >= todayKey;
}

function getService(serviceId) {
  return db.prepare('SELECT id, name, duration_minutes FROM services WHERE id = ? AND active = 1').get(serviceId);
}

function getAvailableSlots(date, durationMinutes) {
  const appointments = db.prepare("SELECT time, end_time AS endTime FROM appointments WHERE date = ? AND status IN ('Neu','Bestätigt')").all(date);
  return slotsForDate(date, durationMinutes).filter(slot => {
    const slotEnd = addMinutes(slot, durationMinutes);
    return !appointments.some(appointment => slot < appointment.endTime && slotEnd > appointment.time);
  });
}

router.get('/services', (_req, res) => {
  const services = db.prepare('SELECT id, name, category, description, price_from AS priceFrom, duration_minutes AS durationMinutes FROM services WHERE active = 1 ORDER BY category, name').all();
  res.json({ services });
});

router.get('/availability', (req, res) => {
  const date = clean(req.query.date, 10);
  const serviceId = Number(req.query.serviceId);
  if (!validDate(date) || !isFutureDate(date)) return res.status(400).json({ message: 'Bitte wähle ein gültiges zukünftiges Datum.' });
  const service = Number.isInteger(serviceId) && serviceId > 0 ? getService(serviceId) : null;
  if (serviceId && !service) return res.status(400).json({ message: 'Dienstleistung wurde nicht gefunden.' });
  const duration = service?.duration_minutes ?? 30;
  const day = new Date(`${date}T12:00:00`).getDay();
  res.json({ date, openingHours: OPENING_HOURS[day], slots: getAvailableSlots(date, duration) });
});

router.post('/appointments', (req, res) => {
  const body = req.body || {};
  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 40);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const note = clean(body.note, 1000);
  const serviceId = Number(body.serviceId);

  if (name.length < 2 || phone.length < 6 || !validEmail(email) || !validDate(date) || !validTime(time) || !Number.isInteger(serviceId)) {
    return res.status(400).json({ message: 'Bitte alle Pflichtfelder korrekt ausfüllen.' });
  }
  if (!isFutureDate(date)) return res.status(400).json({ message: 'Bitte wähle ein zukünftiges Datum.' });

  const service = getService(serviceId);
  if (!service) return res.status(400).json({ message: 'Dienstleistung wurde nicht gefunden.' });

  const availableSlots = getAvailableSlots(date, service.duration_minutes);
  if (!availableSlots.includes(time)) return res.status(400).json({ message: 'Diese Uhrzeit ist nicht verfügbar.' });

  const endTime = addMinutes(time, service.duration_minutes);
  try {
    const create = db.transaction(() => {
      const overlapping = db.prepare("SELECT id FROM appointments WHERE date = ? AND status IN ('Neu','Bestätigt') AND time < ? AND end_time > ? LIMIT 1").get(date, endTime, time);
      if (overlapping) {
        const error = new Error('SLOT_TAKEN');
        error.code = 'SLOT_TAKEN';
        throw error;
      }

      let customer = db.prepare('SELECT id FROM customers WHERE lower(email) = lower(?) OR phone = ? ORDER BY id LIMIT 1').get(email, phone);
      if (customer) {
        db.prepare('UPDATE customers SET name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, email, phone, customer.id);
      } else {
        const result = db.prepare('INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)').run(name, email, phone);
        customer = { id: result.lastInsertRowid };
      }
      const result = db.prepare('INSERT INTO appointments (customer_id, service_id, date, time, end_time, note) VALUES (?, ?, ?, ?, ?, ?)').run(customer.id, serviceId, date, time, endTime, note);
      return { id: result.lastInsertRowid };
    });
    const appointment = create();
    res.status(201).json({ message: 'Termin erfolgreich angefragt.', appointment });
  } catch (error) {
    if (error.code === 'SLOT_TAKEN' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Dieser Zeitraum wurde gerade vergeben. Bitte wähle eine andere Uhrzeit.' });
    console.error(error);
    res.status(500).json({ message: 'Termin konnte nicht gespeichert werden.' });
  }
});

router.get('/reviews', (_req, res) => {
  const reviews = db.prepare("SELECT id, customer_name AS customerName, rating, text, created_at AS createdAt FROM reviews WHERE status = 'Freigegeben' ORDER BY created_at DESC LIMIT 20").all();
  res.json({ reviews });
});

export { STATUSES };
export default router;
