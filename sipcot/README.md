# SIPCOT Industrial Data Management System

**Project title (academic):** An intelligent decision support system for SIPCOT industrial monitoring using real-time data analytics.

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm

---

## Project structure

```
sipcot/
├── server/                          # Node.js + Express API
│   ├── config/                      # DB connection + seed script
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/documents/           # Created at runtime (admin uploads)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── client/sipcot-client/            # React frontend (CRA)
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── utils/
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

---

## Backend setup

From the `sipcot/server` folder:

```bash
cd server
npm install
```

Create `.env` from the example (Windows PowerShell: `Copy-Item .env.example .env`). Set at least:

| Variable    | Purpose |
|------------|---------|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:3000`) |

Optional seed data:

```bash
node config/seed.js
```

Start the API:

```bash
npm run dev    # nodemon (if configured)
npm start      # node server.js
```

- API base: `http://localhost:5000/api`
- Health: `GET http://localhost:5000/api/health`

---

## Frontend setup

From the `sipcot/client/sipcot-client` folder:

```bash
cd client/sipcot-client
npm install
```

Create `.env` (see `.env.example`):

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm start
```

App URL: `http://localhost:3000`

**Run order for a demo:** start MongoDB (or use Atlas) → start **server** → start **client** (two terminals).

---

## Default logins (after `node config/seed.js`)

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Admin    | admin@sipcot.com    | Admin@123  |
| Industry | rajesh@techfab.com  | Pass@123   |
| Industry | priya@sunpharma.com | Pass@123   |

---

## API overview

### Authentication

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register           |
| POST   | /api/auth/login    | Login              |
| GET    | /api/auth/me       | Current user       |
| PUT    | /api/auth/profile  | Update profile     |

### Industries & data

| Method | Endpoint              | Role     |
|--------|-----------------------|----------|
| POST   | /api/industries       | Industry |
| GET    | /api/industries/my    | Industry |
| PUT    | /api/industries/my    | Industry |
| GET    | /api/industries       | Admin    |
| POST   | /api/industries/admin | Admin    |
| PUT    | /api/industries/:id   | Admin    |
| DELETE | /api/industries/:id   | Admin    |

| Method | Endpoint          | Role     |
|--------|-------------------|----------|
| POST   | /api/data         | Industry |
| GET    | /api/data/my      | Industry |
| PUT    | /api/data/:id     | Industry |
| DELETE | /api/data/:id     | Industry |

### Admin

| Method | Endpoint                         | Description |
|--------|----------------------------------|-------------|
| GET    | /api/admin/dashboard             | Stats, alerts, recommendations, top flagged records |
| GET    | /api/admin/records               | All submissions (filters) |
| PUT    | /api/admin/records/:id/review    | Approve / reject / remarks |
| GET    | /api/admin/users                 | Users list |
| PATCH  | /api/admin/users/:id/toggle-active | Activate / deactivate industry user |

**Announcements (admin)**

| Method | Endpoint                              |
|--------|---------------------------------------|
| POST   | /api/admin/announcements              |
| GET    | /api/admin/announcements              |
| PATCH  | /api/admin/announcements/:id/toggle |
| DELETE | /api/admin/announcements/:id         |

**Inspection & schedule (admin)**

| Method | Endpoint                         |
|--------|----------------------------------|
| POST   | /api/admin/schedule              |
| GET    | /api/admin/schedule              |
| PATCH  | /api/admin/schedule/:id/toggle |
| DELETE | /api/admin/schedule/:id          |

### Documents (admin upload; files under `server/uploads/documents`)

| Method | Endpoint                      | Notes |
|--------|-------------------------------|--------|
| POST   | /api/documents                | `multipart/form-data`, field `file` |
| GET    | /api/documents                | List (query: `active`, `category`, `page`, `limit`) |
| GET    | /api/documents/:id/download | Admin download |
| PATCH  | /api/documents/:id/toggle     | Archive / restore |
| DELETE | /api/documents/:id            | Delete file + record |

### Content (industry — scoped by park / type / “all”)

| Method | Endpoint                           |
|--------|------------------------------------|
| GET    | /api/content/announcements         |
| GET    | /api/content/schedule              |
| GET    | /api/content/documents             |
| GET    | /api/content/documents/:id/download |

### Reports

| Method | Endpoint                  | Role  |
|--------|---------------------------|-------|
| GET    | /api/reports/export/excel | Admin |

---

## Main features (for viva / report)

- JWT auth, bcrypt passwords, role-based access (admin / industry)
- Industry profile and quarterly / annual data submissions with admin review workflow
- Admin dashboard with charts; **near real-time refresh** (client polling) and **decision-support** panels (alerts, recommendations, risk-oriented “top flagged” list)
- Announcements, inspection / deadline schedule, and document library with audience targeting (all, SIPCOT park, industry type)
- Industry **About SIPCOT**, **Updates** center, and guide pages (submission cycle, targeting, workflow, downloads)
- Excel export of approved data; user activate / deactivate for industry accounts
- Responsive UI (sidebar layout)

---

## Pre-demo checklist

1. Atlas IP allowlist includes your machine (or use `0.0.0.0/0` only for demos — not for production).
2. `MONGO_URI` and `JWT_SECRET` set in `server/.env`; `REACT_APP_API_URL` points to your API.
3. Run seed once if you need default users and sample industries/records.
4. Start backend on port **5000** (or update client `.env` if you change `PORT`).
5. On the admin side, create at least one announcement, one schedule row, and upload one PDF so the industry dashboard and Updates page show real content.

---

## Database schemas (summary)

See inline comments in `server/models/` for full fields. Core entities: **User**, **Industry**, **DataRecord**, plus **Announcement**, **ScheduleItem**, **Document** for the content modules.

---

## Disclaimer

This repository is an academic demonstration. Wording about SIPCOT processes is illustrative; it is not an official government system.
