import { useEffect, useState } from 'react';
import { api } from '../services/api';

const statusOptions = ['Neu','Bestätigt','Erledigt','Storniert','Abgelehnt'];

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [section, setSection] = useState('dashboard');

  useEffect(() => { api.me().then(d => setAdmin(d.admin)).catch(() => setAdmin(false)); }, []);
  useEffect(() => { if (!admin) return; load(); }, [admin, section]);

  async function load() {
    try {
      if (section === 'dashboard') setStats((await api.dashboard()).stats);
      if (section === 'appointments') setAppointments((await api.appointments()).appointments);
    } catch (e) { setError(e.message); }
  }

  async function handleLogin(e) {
    e.preventDefault(); setError('');
    try { const data = await api.login(login); setAdmin(data.admin); } catch (e) { setError(e.message); }
  }

  if (admin === null) return <div className="admin-page"><div className="admin-card">Lade Admin-Bereich…</div></div>;
  if (admin === false) return <div className="admin-page"><form className="admin-card admin-login" onSubmit={handleLogin}><p className="eyebrow">Barberman Admin</p><h1>Willkommen zurück.</h1><p>Verwalte Termine, Kunden und Dienstleistungen.</p><label>E-Mail<input type="email" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} required/></label><label>Passwort<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} required/></label>{error&&<div className="form-error">{error}</div>}<button className="primary-button" type="submit">Anmelden</button></form></div>;

  return <div className="admin-page"><aside className="admin-sidebar"><a className="brand" href="/"><span className="brand-mark">B</span><span>Barber<span>man</span></span></a><button onClick={()=>setSection('dashboard')} className={section==='dashboard'?'active':''}>Dashboard</button><button onClick={()=>setSection('appointments')} className={section==='appointments'?'active':''}>Termine</button><button onClick={()=>setSection('customers')} className={section==='customers'?'active':''}>Kunden</button><button onClick={()=>setSection('services')} className={section==='services'?'active':''}>Dienstleistungen</button><button onClick={()=>setSection('reviews')} className={section==='reviews'?'active':''}>Bewertungen</button><div className="admin-spacer"/><button onClick={async()=>{await api.logout();setAdmin(false);}}>Abmelden</button></aside>
  <main className="admin-main"><div className="admin-top"><div><p className="eyebrow">Administration</p><h1>{section === 'dashboard' ? 'Dashboard' : section === 'appointments' ? 'Termine' : section === 'customers' ? 'Kunden' : section === 'services' ? 'Dienstleistungen' : 'Bewertungen'}</h1></div><span>{admin.email}</span></div>
  {error&&<div className="form-error">{error}</div>}
  {section==='dashboard' && <div className="admin-stats">{[['Heute',stats?.appointmentsToday],['Offen',stats?.pendingAppointments],['Kunden',stats?.customers]].map(([label,value])=><div className="admin-stat" key={label}><span>{label}</span><strong>{value ?? '–'}</strong></div>)}</div>}
  {section==='appointments' && <div className="admin-table-wrap"><table><thead><tr><th>Datum</th><th>Zeit</th><th>Kunde</th><th>Service</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>{a.date}</td><td>{a.time}</td><td><strong>{a.customerName}</strong><small>{a.phone}</small></td><td>{a.serviceName}</td><td><select value={a.status} onChange={async e=>{await api.updateAppointmentStatus(a.id,e.target.value);load();}}>{statusOptions.map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>{!appointments.length&&<p className="empty-state">Noch keine Termine vorhanden.</p>}</div>}
  {section!=='dashboard'&&section!=='appointments'&&<div className="admin-placeholder"><h2>{section === 'customers' ? 'Kundenverwaltung' : section === 'services' ? 'Dienstleistungsverwaltung' : 'Bewertungsverwaltung'}</h2><p>Die API ist vorbereitet. Die Verwaltungsansichten werden im nächsten Ausbau vollständig eingebunden.</p></div>}
  </main></div>;
}
