import nodemailer from 'nodemailer';

const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM);

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export async function sendAppointmentNotifications({ appointment, customer, service }) {
  if (!transporter) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const customerName = escapeHtml(customer.name);
  const serviceName = escapeHtml(service.name);
  const date = escapeHtml(appointment.date);
  const time = escapeHtml(appointment.time);
  const note = escapeHtml(appointment.note || '');

  const customerHtml = `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Deine Terminanfrage bei My Beauty Salon</h2><p>Hallo ${customerName},</p><p>deine Anfrage wurde erfolgreich gespeichert.</p><p><strong>Service:</strong> ${serviceName}<br><strong>Datum:</strong> ${date}<br><strong>Uhrzeit:</strong> ${time}</p>${note ? `<p><strong>Nachricht:</strong> ${note}</p>` : ''}<p>Wir melden uns zur finalen Bestätigung bei dir.</p></div>`;
  const adminHtml = `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Neue Terminanfrage</h2><p><strong>Kunde:</strong> ${customerName}<br><strong>E-Mail:</strong> ${escapeHtml(customer.email)}<br><strong>Telefon:</strong> ${escapeHtml(customer.phone)}</p><p><strong>Service:</strong> ${serviceName}<br><strong>Datum:</strong> ${date}<br><strong>Uhrzeit:</strong> ${time}</p>${note ? `<p><strong>Nachricht:</strong> ${note}</p>` : ''}</div>`;

  await Promise.all([
    transporter.sendMail({ from: process.env.MAIL_FROM, to: customer.email, subject: 'Ihre Terminanfrage bei My Beauty Salon', html: customerHtml }),
    transporter.sendMail({ from: process.env.MAIL_FROM, to: adminEmail, subject: `Neue Terminanfrage: ${service.name}`, html: adminHtml }),
  ]);

  return { sent: true };
}
