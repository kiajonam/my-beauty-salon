export default function Legal({ type }) {
  const isPrivacy = type === 'privacy';
  return <div className="legal-page">
    <header className="legal-header"><a className="brand" href="/"><span className="brand-mark">B</span><span>Barber<span>man</span></span></a><a href="/">← Zurück zur Website</a></header>
    <main className="legal-content">
      <p className="eyebrow">Barberman Köln</p>
      <h1>{isPrivacy ? 'Datenschutzerklärung' : 'Impressum'}</h1>
      {isPrivacy ? <>
        <h2>1. Verantwortlicher</h2><p>Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist Barberman, Köln, Deutschland. Kontaktdaten und die genaue Geschäftsanschrift sind vor dem produktiven Einsatz zu ergänzen.</p>
        <h2>2. Terminbuchung</h2><p>Bei einer Terminanfrage verarbeiten wir die von dir angegebenen Daten wie Name, E-Mail-Adresse, Telefonnummer, Terminwunsch und Nachricht zur Bearbeitung der Anfrage.</p>
        <h2>3. Speicherdauer</h2><p>Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
        <h2>4. Deine Rechte</h2><p>Du hast nach Maßgabe der gesetzlichen Vorschriften insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Widerspruch.</p>
        <h2>5. Kontakt</h2><p>Für Datenschutzanfragen kannst du die im Impressum angegebenen Kontaktdaten verwenden.</p>
      </> : <>
        <h2>Angaben gemäß § 5 DDG</h2><p>Barberman<br/>Köln, Deutschland</p>
        <h2>Kontakt</h2><p>Telefon: 0221 123 45 67<br/>E-Mail: hello@barberman.de</p>
        <h2>Hinweis</h2><p>Diese Website befindet sich im Demo-/Entwicklungsstatus. Vor einer Veröffentlichung müssen Anschrift, verantwortliche Person und weitere gesetzlich erforderliche Angaben mit den tatsächlichen Unternehmensdaten ersetzt werden.</p>
      </>}
    </main>
  </div>;
}
