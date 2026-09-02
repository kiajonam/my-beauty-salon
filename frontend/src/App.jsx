import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Instagram, Menu, Scissors, Sparkles, Star, X } from 'lucide-react';

const services = [
  { name: 'Damenhaarschnitt & Styling', price: 'ab 65 €', duration: '60 Min.' },
  { name: 'Herrenhaarschnitt', price: 'ab 35 €', duration: '30 Min.' },
  { name: 'Kinderhaarschnitt', price: 'ab 30 €', duration: '30 Min.' },
  { name: 'Balayage', price: 'ab 185 €', duration: '150 Min.' },
  { name: 'Strähnen', price: 'ab 110 €', duration: '120 Min.' },
  { name: 'Coloration', price: 'ab 65 €', duration: '90 Min.' },
  { name: 'Glossing', price: 'ab 45 €', duration: '45 Min.' },
  { name: 'Augenbrauen & Wimpern', price: 'ab 15 €', duration: '20 Min.' },
];

const navItems = [
  ['Home', '#home'],
  ['Services', '#services'],
  ['Über uns', '#about'],
  ['Galerie', '#gallery'],
  ['Kontakt', '#contact'],
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [bookingOpen]);

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Scissors size={18} /></span>
          <span>Barber<span>man</span></span>
        </a>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <button className="nav-booking" onClick={() => { setBookingOpen(true); setMenuOpen(false); }}>
            Termin buchen
          </button>
        </nav>

        <button className="menu-button" aria-label="Menü öffnen" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section id="home" className="hero section-pad">
          <div className="hero-copy reveal">
            <div className="eyebrow"><Sparkles size={15} /> Hair. Beauty. You.</div>
            <h1>Dein Look.<br /><em>Dein Moment.</em></h1>
            <p>Modernes Hair & Beauty in Köln. Präzise Schnitte, lebendige Farben und Services, die sich nach dir anfühlen.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setBookingOpen(true)}>Termin buchen <CalendarDays size={18} /></button>
              <a className="text-button" href="#services">Services entdecken <span>↗</span></a>
            </div>
            <div className="hero-meta">
              <span><Star size={15} fill="currentColor" /> 4,9/5 Kundenbewertung</span>
              <span><Clock3 size={15} /> Mo–Fr 09:00–18:00</span>
            </div>
          </div>

          <div className="hero-visual reveal delay-1">
            <div className="hero-orb orb-one" />
            <div className="hero-orb orb-two" />
            <div className="portrait-card">
              <div className="portrait-image" role="img" aria-label="Abstrakte Beauty-Farbwelt" />
              <div className="floating-card">
                <span className="floating-icon"><Sparkles size={16} /></span>
                <div><strong>Signature Color</strong><small>individuell abgestimmt</small></div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services-section section-pad">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">Unsere Services</p>
              <h2>Schönheit, die zu <em>dir</em> passt.</h2>
            </div>
            <p>Richtpreise. Der finale Preis hängt von Haarlänge, Aufwand und gewünschtem Ergebnis ab.</p>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card reveal" style={{ '--delay': `${index * 60}ms` }} key={service.name}>
                <div>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{service.name}</h3>
                </div>
                <div className="service-bottom">
                  <strong>{service.price}</strong>
                  <span>{service.duration}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about-section section-pad">
          <div className="about-image reveal"><div className="image-stamp">Since 2026</div></div>
          <div className="about-copy reveal delay-1">
            <p className="eyebrow">Über Barberman</p>
            <h2>Weniger Stress.<br /><em>Mehr Glow.</em></h2>
            <p>Bei Barberman geht es nicht um komplizierte Trends. Es geht um einen Look, der zu deinem Alltag passt und dich trotzdem besonders fühlen lässt.</p>
            <div className="stats">
              <div><strong>500+</strong><span>Looks kreiert</span></div>
              <div><strong>4,9</strong><span>Google Bewertung</span></div>
              <div><strong>8+</strong><span>Beauty Services</span></div>
            </div>
          </div>
        </section>

        <section id="gallery" className="gallery-section section-pad">
          <div className="section-heading compact reveal"><div><p className="eyebrow">Inspiration</p><h2>Unser <em>Studio.</em></h2></div></div>
          <div className="gallery-grid">
            <div className="gallery-tile tile-a reveal" />
            <div className="gallery-tile tile-b reveal delay-1" />
            <div className="gallery-tile tile-c reveal delay-2" />
            <div className="gallery-tile tile-d reveal delay-3" />
          </div>
        </section>

        <section className="cta-section section-pad">
          <div className="cta-inner reveal">
            <Sparkles size={25} />
            <p className="eyebrow">Ready when you are</p>
            <h2>Dein nächster<br /><em>Lieblingslook.</em></h2>
            <button className="primary-button" onClick={() => setBookingOpen(true)}>Jetzt Termin sichern <CalendarDays size={18} /></button>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer section-pad">
        <div><a className="brand" href="#home"><span className="brand-mark"><Scissors size={18} /></span><span>Barber<span>man</span></span></a><p>Hair & Beauty in Köln.</p></div>
        <div><strong>Kontakt</strong><a href="tel:+492211234567">0221 123 45 67</a><a href="mailto:hello@barberman.de">hello@barberman.de</a></div>
        <div><strong>Adresse</strong><span>Köln, Deutschland</span><a href="#home">Anfahrt ↗</a></div>
        <div><strong>Social</strong><a href="#home"><Instagram size={17} /> Instagram</a></div>
      </footer>

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
    </div>
  );
}

function BookingModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const canContinue = step === 1 ? Boolean(service) : step === 2 ? Boolean(date && time) : true;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="booking-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="modal-close" aria-label="Schließen" onClick={onClose}><X /></button>
        <div className="eyebrow">Online-Termin</div>
        <h2>{step === 1 ? 'Was möchtest du buchen?' : step === 2 ? 'Wann passt es dir?' : 'Noch kurz deine Daten.'}</h2>

        {step === 1 && <div className="booking-options">
          {services.slice(0, 6).map(item => <button className={service === item.name ? 'booking-option active' : 'booking-option'} onClick={() => setService(item.name)} key={item.name}><span>{item.name}</span><strong>{item.price}</strong></button>)}
        </div>}

        {step === 2 && <div className="booking-fields">
          <label>Datum<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <div><span className="field-label">Uhrzeit</span><div className="time-grid">{['09:00','10:30','12:00','14:00','15:30','17:00'].map(t => <button className={time === t ? 'time-slot active' : 'time-slot'} onClick={() => setTime(t)} key={t}>{t}</button>)}</div></div>
        </div>}

        {step === 3 && <div className="booking-fields">
          <label>Name<input placeholder="Vor- und Nachname" /></label>
          <label>E-Mail<input type="email" placeholder="name@beispiel.de" /></label>
          <label>Telefon<input type="tel" placeholder="0176 12345678" /></label>
        </div>}

        <div className="modal-footer"><span>Schritt {step} von 3</span><button className="primary-button" disabled={!canContinue} onClick={() => step < 3 ? setStep(step + 1) : onClose()}>{step < 3 ? 'Weiter' : 'Anfrage senden'} {step < 3 && '→'}</button></div>
      </div>
    </div>
  );
}
