import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../admin.css';

const statusOptions = ['Neu', 'Bestätigt', 'Erledigt', 'Storniert', 'Abgelehnt'];
const reviewStatuses = ['Pending', 'Freigegeben', 'Abgelehnt'];
const emptyService = { name: '', category: 'Haare', description: '', priceFrom: '', durationMinutes: 60, active: true };
const money = value => `${Number(value || 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
const defaultSettings = { salonName: '', city: '', phone: '', email: '', address: '', hoursMon: '', hoursTue: '', hoursWed: '', hoursThu: '', hoursFri: '', hoursSat: '', hoursSun: '' };

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [section, setSection] = useState('dashboard');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.me().then(d => setAdmin(d.admin)).catch(() => setAdmin(false));
  }, []);

  useEffect(() => {
    if (!admin) return;
    loadSection();
  }, [admin, section]);

  async function loadSection() {
    setError('');
    try {
      if (section === 'dashboard') setStats((await api.dashboard()).stats);
      if (section === 'appointments') setAppointments((await api.appointments()).appointments);
      if (section === 'customers') setCustomers((await api.customers()).customers);
      if (section === 'services') setServices((await api.servicesAdmin()).services);
      if (section === 'reviews') setReviews((await api.reviews()).reviews);
      if (section === 'settings') setSettings({ ...defaultSettings, ...(await api.adminSettings()).settings });
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(login);
      setAdmin(data.admin);
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeAppointmentStatus(id, status) {
    try {
      setError('');
      await api.updateAppointmentStatus(id, status);
      setAppointments(items => items.map(item => item.id === id ? { ...item, status } : item));
      setMessage('Terminstatus aktualisiert.');
    } catch (e) { setError(e.message); }
  }

  async function saveCustomer(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.updateCustomer(editingCustomer.id, editingCustomer);
      setCustomers(items => items.map(item => item.id === editingCustomer.id ? { ...item, ...editingCustomer } : item));
      setEditingCustomer(null);
      setMessage('Kundendaten gespeichert.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function saveService(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...editingService, priceFrom: Number(editingService.priceFrom), durationMinutes: Number(editingService.durationMinutes) };
      await api.updateService(editingService.id, payload);
      setServices(items => items.map(item => item.id === editingService.id ? { ...item, ...payload } : item));
      setEditingService(null);
      setMessage('Dienstleistung gespeichert.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function createService(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...newService, priceFrom: Number(newService.priceFrom), durationMinutes: Number(newService.durationMinutes) };
      await api.createService(payload);
      setNewService(false);
      setMessage('Dienstleistung erstellt.');
      await loadSection();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function changeReviewStatus(id, status) {
    try {
      setError('');
      await api.updateReviewStatus(id, status);
      setReviews(items => items.map(item => item.id === id ? { ...item, status } : item));
      setMessage('Bewertungsstatus aktualisiert.');
    } catch (e) { setError(e.message); }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.updateSettings(settings);
      setMessage('Einstellungen gespeichert.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  function navigate(next) {
    setSection(next);
    setError('');
    setMessage('');
    setEditingCustomer(null);
    setEditingService(null);
    setNewService(false);
  }

  if (admin === null) return <div className="admin-page"><div className="admin-card">Lade Admin-Bereich…</div></div>;

  if (admin === false) return (
    <div className="admin-page">
      <form className="admin-card admin-login" onSubmit={handleLogin}>
        <p className="eyebrow">Barberman Admin</p>
        <h1>Willkommen zurück.</h1>
        <p>Verwalte Termine, Kunden und Dienstleistungen.</p>
        <label>E-Mail<input type="email" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} required /></label>
        <label>Passwort<input type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} required /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit">Anmelden</button>
      </form>
    </div>
  );

  const title = { dashboard: 'Dashboard', appointments: 'Termine', customers: 'Kunden', services: 'Dienstleistungen', reviews: 'Bewertungen', settings: 'Einstellungen' }[section];
  const navLabels = { dashboard: 'Dashboard', appointments: 'Termine', customers: 'Kunden', services: 'Dienstleistungen', reviews: 'Bewertungen', settings: 'Einstellungen' };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <a className="brand" href="/"><span className="brand-mark">B</span><span>Barber<span>man</span></span></a>
        {Object.keys(navLabels).map(item => <button key={item} onClick={() => navigate(item)} className={section === item ? 'active' : ''}>{navLabels[item]}</button>)}
        <div className="admin-spacer" />
        <button onClick={async () => { await api.logout(); setAdmin(false); }}>Abmelden</button>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div><p className="eyebrow">Administration</p><h1>{title}</h1></div>
          <span>{admin.email}</span>
        </div>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        {section === 'dashboard' && (
          <div className="admin-stats">
            <div className="admin-stat"><span>Heute</span><strong>{stats?.appointmentsToday ?? '–'}</strong><small>Termine</small></div>
            <div className="admin-stat"><span>Offen</span><strong>{stats?.pendingAppointments ?? '–'}</strong><small>Neue Anfragen</small></div>
            <div className="admin-stat"><span>Kunden</span><strong>{stats?.customers ?? '–'}</strong><small>Gesamt</small></div>
            <div className="admin-stat"><span>Umsatz</span><strong>{stats ? money(stats.revenue) : '–'}</strong><small>Aktueller Monat</small></div>
          </div>
        )}

        {section === 'appointments' && (
          <div className="admin-table-wrap"><table><thead><tr><th>Datum</th><th>Zeit</th><th>Kunde</th><th>Service</th><th>Status</th></tr></thead><tbody>
            {appointments.map(a => <tr key={a.id}><td>{a.date}</td><td>{a.time}<small>bis {a.endTime}</small></td><td><strong>{a.customerName}</strong><small>{a.phone}</small><small>{a.email}</small></td><td>{a.serviceName}<small>{a.priceFrom} € · {a.durationMinutes} Min.</small></td><td><select value={a.status} onChange={e => changeAppointmentStatus(a.id, e.target.value)}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}
          </tbody></table>{!appointments.length && <p className="empty-state">Noch keine Termine vorhanden.</p>}</div>
        )}

        {section === 'customers' && (
          <div className="admin-table-wrap"><table><thead><tr><th>Name</th><th>Kontakt</th><th>Termine</th><th>Letzter Termin</th><th>Aktion</th></tr></thead><tbody>
            {customers.map(c => <tr key={c.id}><td><strong>{c.name}</strong><small>{c.notes || 'Keine Notizen'}</small></td><td>{c.email}<small>{c.phone}</small></td><td>{c.appointmentCount}</td><td>{c.lastAppointment || '–'}</td><td><button className="table-button" onClick={() => setEditingCustomer({ ...c })}>Bearbeiten</button></td></tr>)}
          </tbody></table>{!customers.length && <p className="empty-state">Noch keine Kunden vorhanden.</p>}</div>
        )}

        {section === 'services' && (
          <>
            <div className="section-toolbar"><p>Preise und Leistungen, die auf der Website angezeigt werden.</p><button className="primary-button small-button" onClick={() => setNewService({ ...emptyService })}>+ Neue Leistung</button></div>
            {newService && <ServiceForm value={newService} onChange={setNewService} onSubmit={createService} onCancel={() => setNewService(false)} saving={saving} />}
            <div className="admin-table-wrap"><table><thead><tr><th>Leistung</th><th>Kategorie</th><th>Preis</th><th>Dauer</th><th>Status</th><th>Aktion</th></tr></thead><tbody>
              {services.map(s => <tr key={s.id}><td><strong>{s.name}</strong><small>{s.description || 'Keine Beschreibung'}</small></td><td>{s.category}</td><td>ab {s.priceFrom} €</td><td>{s.durationMinutes} Min.</td><td><span className={`status-pill ${s.active ? 'status-active' : 'status-inactive'}`}>{s.active ? 'Aktiv' : 'Inaktiv'}</span></td><td><button className="table-button" onClick={() => setEditingService({ ...s })}>Bearbeiten</button></td></tr>)}
            </tbody></table>{!services.length && <p className="empty-state">Noch keine Dienstleistungen vorhanden.</p>}</div>
            {editingService && <ServiceForm value={editingService} onChange={setEditingService} onSubmit={saveService} onCancel={() => setEditingService(null)} saving={saving} />}
          </>
        )}

        {section === 'reviews' && (
          <div className="admin-table-wrap"><table><thead><tr><th>Kunde</th><th>Bewertung</th><th>Text</th><th>Status</th></tr></thead><tbody>
            {reviews.map(r => <tr key={r.id}><td><strong>{r.customerName}</strong><small>{new Date(r.createdAt).toLocaleDateString('de-DE')}</small></td><td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td><td className="review-text">{r.text}</td><td><select value={r.status} onChange={e => changeReviewStatus(r.id, e.target.value)}>{reviewStatuses.map(s => <option key={s}>{s}</option>)}</select></td></tr>)}
          </tbody></table>{!reviews.length && <p className="empty-state">Noch keine Bewertungen vorhanden.</p>}</div>
        )}

        {section === 'settings' && (
          <form className="service-editor settings-editor" onSubmit={saveSettings}>
            <div className="settings-section"><p className="eyebrow">Studio</p><h2>Allgemeine Angaben</h2><div className="service-editor-grid"><label>Name<input value={settings.salonName} onChange={e => setSettings({ ...settings, salonName: e.target.value })} required /></label><label>Stadt<input value={settings.city} onChange={e => setSettings({ ...settings, city: e.target.value })} required /></label><label>Telefon<input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} required /></label><label>E-Mail<input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} required /></label><label className="full-field">Adresse<input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} required /></label></div></div>
            <div className="settings-section"><p className="eyebrow">Öffnungszeiten</p><h2>Wann wir geöffnet haben</h2><div className="service-editor-grid"><label>Montag<input value={settings.hoursMon} onChange={e => setSettings({ ...settings, hoursMon: e.target.value })} placeholder="09:00–18:00" required /></label><label>Dienstag<input value={settings.hoursTue} onChange={e => setSettings({ ...settings, hoursTue: e.target.value })} placeholder="09:00–18:00" required /></label><label>Mittwoch<input value={settings.hoursWed} onChange={e => setSettings({ ...settings, hoursWed: e.target.value })} placeholder="09:00–18:00" required /></label><label>Donnerstag<input value={settings.hoursThu} onChange={e => setSettings({ ...settings, hoursThu: e.target.value })} placeholder="09:00–19:00" required /></label><label>Freitag<input value={settings.hoursFri} onChange={e => setSettings({ ...settings, hoursFri: e.target.value })} placeholder="09:00–19:00" required /></label><label>Samstag<input value={settings.hoursSat} onChange={e => setSettings({ ...settings, hoursSat: e.target.value })} placeholder="09:00–16:00" required /></label><label>Sonntag<input value={settings.hoursSun} onChange={e => setSettings({ ...settings, hoursSun: e.target.value })} placeholder="Geschlossen" required /></label></div></div>
            <p className="settings-help">Öffnungszeiten bitte als <strong>09:00–18:00</strong> oder <strong>Geschlossen</strong> eintragen. Die Verfügbarkeit im Buchungsformular wird automatisch daran angepasst.</p>
            <div className="modal-actions"><button className="primary-button" disabled={saving}>{saving ? 'Speichern…' : 'Einstellungen speichern'}</button></div>
          </form>
        )}
      </main>

      {editingCustomer && <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={saveCustomer}><div className="modal-head"><div><p className="eyebrow">Kundenverwaltung</p><h2>Kunde bearbeiten</h2></div><button type="button" className="modal-close" onClick={() => setEditingCustomer(null)}>×</button></div><label>Name<input value={editingCustomer.name} onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })} required /></label><label>E-Mail<input type="email" value={editingCustomer.email} onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })} required /></label><label>Telefon<input value={editingCustomer.phone} onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} required /></label><label>Notizen<textarea value={editingCustomer.notes || ''} onChange={e => setEditingCustomer({ ...editingCustomer, notes: e.target.value })} rows="4" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditingCustomer(null)}>Abbrechen</button><button className="primary-button" disabled={saving}>{saving ? 'Speichern…' : 'Speichern'}</button></div></form></div>}
    </div>
  );
}

function ServiceForm({ value, onChange, onSubmit, onCancel, saving }) {
  const set = (key, next) => onChange({ ...value, [key]: next });
  return <form className="service-editor" onSubmit={onSubmit}><div className="service-editor-grid"><label>Name<input value={value.name} onChange={e => set('name', e.target.value)} required /></label><label>Kategorie<input value={value.category} onChange={e => set('category', e.target.value)} required /></label><label>Preis ab (€)<input type="number" min="0" step="0.01" value={value.priceFrom} onChange={e => set('priceFrom', e.target.value)} required /></label><label>Dauer (Min.)<input type="number" min="10" max="480" step="5" value={value.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} required /></label><label className="full-field">Beschreibung<textarea value={value.description} onChange={e => set('description', e.target.value)} rows="3" /></label><label className="checkbox-field"><input type="checkbox" checked={Boolean(value.active)} onChange={e => set('active', e.target.checked)} /> Aktiv auf der Website</label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onCancel}>Abbrechen</button><button className="primary-button" disabled={saving}>{saving ? 'Speichern…' : 'Speichern'}</button></div></form>;
}
