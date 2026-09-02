import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Instagram, Menu, Scissors, Sparkles, Star, X } from 'lucide-react';
import { api } from './services/api';
import Admin from './pages/Admin';
import Legal from './pages/Legal';

const fallbackServices = [
  { id: 1, name: 'Damenhaarschnitt & Styling', priceFrom: 65, durationMinutes: 60 },
  { id: 2, name: 'Herrenhaarschnitt', priceFrom: 35, durationMinutes: 30 },
  { id: 3, name: 'Kinderhaarschnitt', priceFrom: 30, durationMinutes: 30 },
  { id: 4, name: 'Balayage', priceFrom: 185, durationMinutes: 150 },
  { id: 5, name: 'Strähnen', priceFrom: 110, durationMinutes: 120 },
  { id: 6, name: 'Coloration', priceFrom: 65, durationMinutes: 90 },
  { id: 7, name: 'Glossing', priceFrom: 45, durationMinutes: 45 },
  { id: 8, name: 'Augenbrauen & Wimpern', priceFrom: 15, durationMinutes: 20 },
];
const money = value => `ab ${Number(value).toFixed(0)} €`;

export default function App() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return <Admin />;
  if (path === '/impressum') return <Legal type="impressum" />;
  if (path === '/datenschutz') return <Legal type="privacy" />;
  return <PublicSite />;
}

function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [services, setServices] = useState(fallbackServices);
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.services().then(data => setServices(data.services)).catch(() => {}); api.reviews().then(data => setReviews(data.reviews)).catch(() => {}); }, []);
  useEffect(() => { document.body.style.overflow = bookingOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [bookingOpen]);
  const navItems = [['Home','#home'],['Services','#services'],['Über uns','#about'],['Galerie','#gallery'],['Kontakt','#contact']];
  return <div className="site-shell">
    <header className="navbar"><a className="brand" href="#home" onClick={() => setMenuOpen(false)}><span className="brand-mark"><Scissors size={18}/></span><span>Barber<span>man</span></span></a><nav className={menuOpen ? 'nav-links open' : 'nav-links'}>{navItems.map(([label,href])=><a key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}<button className="nav-booking" onClick={()=>{setBookingOpen(true);setMenuOpen(false);}}>Termin buchen</button></nav><button className="menu-button" aria-label="Menü öffnen" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X/>:<Menu/>}</button></header>
    <main>
      <section id="home" className="hero section-pad"><div className="hero-copy reveal"><div className="eyebrow"><Sparkles size={15}/> Hair. Beauty. You.</div><h1>Dein Look.<br/><em>Dein Moment.</em></h1><p>Modernes Hair & Beauty in Köln. Präzise Schnitte, lebendige Farben und Services, die sich nach dir anfühlen.</p><div className="hero-actions"><button className="primary-button" onClick={()=>setBookingOpen(true)}>Termin buchen <CalendarDays size={18}/></button><a className="text-button" href="#services">Services entdecken <span>↗</span></a></div><div className="hero-meta"><span><Star size={15} fill="currentColor"/> 4,9/5 Kundenbewertung</span><span><Clock3 size={15}/> Mo–Fr 09:00–18:00</span></div></div><div className="hero-visual reveal delay-1"><div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="portrait-card"><div className="portrait-image" role="img" aria-label="Abstrakte Beauty-Farbwelt"/><div className="floating-card"><span className="floating-icon"><Sparkles size={16}/></span><div><strong>Signature Color</strong><small>individuell abgestimmt</small></div></div></div></div></section>
      <section id="services" className="services-section section-pad"><div className="section-heading reveal"><div><p className="eyebrow">Unsere Services</p><h2>Schönheit, die zu <em>dir</em> passt.</h2></div><p>Richtpreise. Der finale Preis hängt von Haarlänge, Aufwand und gewünschtem Ergebnis ab.</p></div><div className="service-grid">{services.map((service,index)=><article className="service-card reveal" style={{'--delay':`${index*60}ms`}} key={service.id??service.name}><div><span className="service-number">{String(index+1).padStart(2,'0')}</span><h3>{service.name}</h3></div><div className="service-bottom"><strong>{money(service.priceFrom)}</strong><span>{service.durationMinutes} Min.</span></div></article>)}</div></section>
      <section id="about" className="about-section section-pad"><div className="about-image reveal"><div className="image-stamp">Since 2026</div></div><div className="about-copy reveal delay-1"><p className="eyebrow">Über Barberman</p><h2>Weniger Stress.<br/><em>Mehr Glow.</em></h2><p>Bei Barberman geht es nicht um komplizierte Trends. Es geht um einen Look, der zu deinem Alltag passt und dich trotzdem besonders fühlen lässt.</p><div className="stats"><div><strong>500+</strong><span>Looks kreiert</span></div><div><strong>4,9</strong><span>Kundenbewertung</span></div><div><strong>8+</strong><span>Beauty Services</span></div></div></div></section>
      <section id="gallery" className="gallery-section section-pad"><div className="section-heading compact reveal"><div><p className="eyebrow">Inspiration</p><h2>Unser <em>Studio.</em></h2></div></div><div className="gallery-grid"><div className="gallery-tile tile-a reveal"/><div className="gallery-tile tile-b reveal delay-1"/><div className="gallery-tile tile-c reveal delay-2"/><div className="gallery-tile tile-d reveal delay-3"/></div></section>
      {reviews.length > 0 && <section className="reviews-section section-pad"><div className="section-heading compact"><div><p className="eyebrow">Kundenstimmen</p><h2>Was unsere <em>Kunden</em> sagen.</h2></div></div><div className="review-grid">{reviews.slice(0,3).map(review=><article className="review-card" key={review.id}><div className="review-stars">{'★'.repeat(review.rating)}<span>{'★'.repeat(5-review.rating)}</span></div><p>„{review.text}“</p><strong>{review.customerName}</strong></article>)}</div></section>}
      <section className="cta-section section-pad"><div className="cta-inner reveal"><Sparkles size={25}/><p className="eyebrow">Ready when you are</p><h2>Dein nächster<br/><em>Lieblingslook.</em></h2><button className="primary-button" onClick={()=>setBookingOpen(true)}>Jetzt Termin sichern <CalendarDays size={18}/></button></div></section>
    </main>
    <footer id="contact" className="footer section-pad"><div><a className="brand" href="#home"><span className="brand-mark"><Scissors size={18}/></span><span>Barber<span>man</span></span></a><p>Hair & Beauty in Köln.</p></div><div><strong>Kontakt</strong><a href="tel:+492211234567">0221 123 45 67</a><a href="mailto:hello@barberman.de">hello@barberman.de</a></div><div><strong>Adresse</strong><span>Köln, Deutschland</span></div><div><strong>Social</strong><a href="#contact"><Instagram size={17}/> Instagram</a><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></div></footer>
    {bookingOpen && <BookingModal services={services} onClose={()=>setBookingOpen(false)}/>}</div>;
}

function BookingModal({services,onClose}) {
  const [step,setStep]=useState(1),[serviceId,setServiceId]=useState(''),[date,setDate]=useState(''),[time,setTime]=useState(''),[slots,setSlots]=useState([]),[form,setForm]=useState({name:'',email:'',phone:'',note:''}),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
  useEffect(()=>{if(!date||!serviceId)return;setTime('');setMessage('');api.availability(date,serviceId).then(data=>setSlots(data.slots)).catch(error=>{setSlots([]);setMessage(error.message);});},[date,serviceId]);
  const update=e=>setForm(prev=>({...prev,[e.target.name]:e.target.value}));
  const canContinue=step===1?Boolean(serviceId):step===2?Boolean(date&&time):Boolean(form.name.trim()&&form.email.trim()&&form.phone.trim());
  async function submit(){setLoading(true);setMessage('');try{await api.book({serviceId:Number(serviceId),date,time,...form});setStep(4);}catch(error){setMessage(error.message);}finally{setLoading(false);}}
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="booking-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Schließen" onClick={onClose}><X/></button>{step<4?<><div className="eyebrow">Online-Termin</div><h2>{step===1?'Was möchtest du buchen?':step===2?'Wann passt es dir?':'Noch kurz deine Daten.'}</h2>{step===1&&<div className="booking-options">{services.map(item=><button key={item.id} className={Number(serviceId)===item.id?'booking-option active':'booking-option'} onClick={()=>setServiceId(item.id)}><span>{item.name}</span><strong>{money(item.priceFrom)}</strong></button>)}</div>}{step===2&&<div className="booking-fields"><label>Datum<input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={e=>setDate(e.target.value)}/></label><div><span className="field-label">Uhrzeit</span>{slots.length?<div className="time-grid">{slots.map(t=><button key={t} className={time===t?'time-slot active':'time-slot'} onClick={()=>setTime(t)}>{t}</button>)}</div>:<p className="empty-state">Für diesen Tag sind aktuell keine Zeiten verfügbar.</p>}</div></div>}{step===3&&<div className="booking-fields"><label>Name<input name="name" value={form.name} onChange={update} placeholder="Vor- und Nachname"/></label><label>E-Mail<input name="email" type="email" value={form.email} onChange={update} placeholder="name@beispiel.de"/></label><label>Telefon<input name="phone" value={form.phone} onChange={update} placeholder="0176 12345678"/></label><label>Nachricht<input name="note" value={form.note} onChange={update} placeholder="Optional"/></label></div>}{message&&<p className="form-error">{message}</p>}<div className="modal-footer"><span>Schritt {step} von 3</span><button className="primary-button" disabled={!canContinue||loading} onClick={()=>step<3?setStep(step+1):submit()}>{loading?'Wird gesendet…':step<3?'Weiter':'Termin anfragen'} {step<3&&'→'}</button></div></>:<div className="booking-success"><Sparkles size={40}/><div className="eyebrow">Vielen Dank</div><h2>Termin angefragt.</h2><p>Deine Anfrage wurde gespeichert. Wir melden uns zur Bestätigung bei dir.</p><button className="primary-button" onClick={onClose}>Schließen</button></div>}</div></div>;
}
