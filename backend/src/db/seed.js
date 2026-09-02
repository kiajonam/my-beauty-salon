import db from './database.js';

const services = [
  ['Damenhaarschnitt & Styling', 'Damen', 'Schnitt, Beratung und Styling.', 65, 60],
  ['Herrenhaarschnitt', 'Herren', 'Klassischer oder moderner Schnitt.', 35, 30],
  ['Kinderhaarschnitt', 'Kinder', 'Haarschnitt für Kinder.', 30, 30],
  ['Balayage', 'Coloration', 'Individuelle Balayage inklusive Glossing-Beratung.', 185, 150],
  ['Strähnen', 'Coloration', 'Highlights und Strähnen.', 110, 120],
  ['Coloration', 'Coloration', 'Ganzkopf- oder Ansatzcoloration.', 65, 90],
  ['Glossing', 'Coloration', 'Glanz und Farbauffrischung.', 45, 45],
  ['Augenbrauen & Wimpern', 'Beauty', 'Brow- und Lash-Behandlungen.', 15, 20],
  ['Brautstyling', 'Beauty', 'Persönliches Styling für deinen Hochzeitstag.', 140, 120],
];

const insert = db.prepare('INSERT INTO services (name, category, description, price_from, duration_minutes) VALUES (?, ?, ?, ?, ?)');
const count = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
if (count === 0) {
  const tx = db.transaction(() => services.forEach(service => insert.run(...service)));
  tx();
  console.log(`Seeded ${services.length} services.`);
} else {
  console.log('Services already seeded.');
}
