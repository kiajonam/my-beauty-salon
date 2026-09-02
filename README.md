# My Beauty Salon

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
- `/admin`
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
ADMIN_EMAIL=admin@mybeautysalon.de
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

For local development, `frontend/.env` can contain:

```env
VITE_API_URL=http://localhost:4000
```

Open the URL printed by Vite, normally `http://localhost:5173/`. If that port is already occupied, Vite automatically uses another port such as `5174`.

## Deployment

### Frontend on Netlify

The repository contains `netlify.toml`. Netlify builds from the `frontend` directory and publishes `frontend/dist`.

Set this environment variable in the Netlify site settings:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

After changing `VITE_API_URL`, trigger a new deploy because Vite injects it during the build.

### Backend on Render

A `render.yaml` Blueprint is included for the Express API. It uses the `backend` directory as the service root, exposes `/health` for health checks and mounts persistent storage for the SQLite database.

Configure these secrets/values in the Render service before going live:

```env
FRONTEND_URL=https://YOUR-NETLIFY-DOMAIN
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=...
ADMIN_NOTIFICATION_EMAIL=...
```

The generated `JWT_SECRET` should remain secret. Do not commit `.env` or credentials.

## Email notifications

SMTP is optional for local development. For production, configure:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=My Beauty Salon <hello@mybeautysalon.de>
ADMIN_NOTIFICATION_EMAIL=admin@mybeautysalon.de
```

## Production checklist

Before going live:

1. Replace the demo contact details and legal placeholders with the real business data.
2. Use a strong unique `JWT_SECRET` and admin password.
3. Set `NODE_ENV=production` and the real `FRONTEND_URL`.
4. Configure real SMTP credentials and sender address.
5. Set the Netlify `VITE_API_URL` to the deployed backend URL and redeploy the frontend.
6. Keep the SQLite `data/` directory on persistent storage when deploying the backend.
7. Test booking, double-booking protection, admin login, status changes, email delivery and mobile layouts on the production domain.
8. Verify the legal pages and cookie/privacy requirements with the real business information before launch.

## Important

The repository contains application code and example configuration only. Local secrets and the SQLite database are intentionally ignored by Git.
