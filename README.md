# Barberman

Modern German Hair & Beauty salon website for Köln with online appointment booking and a protected admin panel.

## Current stack

- React + Vite
- Express.js
- SQLite (`better-sqlite3`)
- JWT authentication with HttpOnly cookies
- Nodemailer / SMTP notifications
- Helmet, CORS and rate limiting
- Responsive UI with animated sections

## Features

### Public website
- Responsive landing page
- Service catalogue with database-driven prices and durations
- Service prices shown as `Richtpreise`
- Online booking flow: service → date → available time → customer data → confirmation
- Duration-aware availability and overlap protection
- Approved customer reviews
- Impressum and Datenschutz pages

### Admin panel
- `/admin/login`
- Dashboard with today's appointments, open requests, customers and monthly revenue
- Appointment status management
- Customer management
- Service create/edit/activate/deactivate
- Review moderation
- Protected admin API

## Local setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example` and set at least:

```env
JWT_SECRET=your-random-secret-with-at-least-32-characters
ADMIN_EMAIL=admin@barberman.de
ADMIN_PASSWORD=your-secure-password
```

Create the first admin account:

```bash
npm run create-admin
```

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/`. If that port is already occupied, Vite automatically uses another port such as `5174`.

## Email notifications

SMTP is optional for local development. For production, configure these variables in `backend/.env`:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Barberman <hello@barberman.de>
ADMIN_NOTIFICATION_EMAIL=admin@barberman.de
```

Never commit `.env` or real credentials.

## Production checklist

Before going live:

1. Replace the demo contact details and legal placeholders with the real business data.
2. Use a strong unique `JWT_SECRET` and admin password.
3. Set `NODE_ENV=production` and the real `FRONTEND_URL`.
4. Configure real SMTP credentials and sender address.
5. Serve the frontend and API over HTTPS.
6. Keep the SQLite `data/` directory persistent when deploying.
7. Run the frontend build with `npm run build`.
8. Test booking, cancellation/status changes, email delivery and mobile layouts on the production domain.

## Important

The repository contains application code and example configuration only. Local secrets and the SQLite database are intentionally ignored by Git.
