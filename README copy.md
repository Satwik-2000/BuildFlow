# BuildFlow - Construction Contract Management

Production-ready Construction Contract Management Web Application.

## Tech Stack

**Frontend:** React (Vite), Ant Design, Framer Motion, Apollo Client, React Hook Form, Recharts  
**Backend:** Node.js, Express, Apollo GraphQL, PostgreSQL, Prisma, JWT, Supabase Storage

## Quick Start

```bash
# Install dependencies
npm install

# Backend: copy .env.example to .env, set DATABASE_URL and JWT_SECRET
cd backend && cp .env.example .env && npx prisma migrate dev --name init

npx prisma migrate dev

# Seed sample data (optional)
npm run db:seed

# Run development
npm run dev
```

Frontend: http://localhost:5173  
GraphQL: http://localhost:4000/graphql

**Demo login:** admin@buildflow.com / 123456 (after `npm run db:seed`)

## Environment Variables

### DATABASE_URL vs SUPABASE_URL – Do I need both?

**Yes, if you use file uploads.** They serve different purposes:

| Variable       | Purpose                                  | Used by                    |
|----------------|------------------------------------------|----------------------------|
| **DATABASE_URL** | Direct PostgreSQL connection             | Prisma (queries, migrations) |
| **SUPABASE_URL** | Supabase API (Storage, Auth, Realtime)   | @supabase/supabase-js      |

- **DATABASE_URL** – Connects to the Postgres database. Supabase hosts Postgres; this is the connection string from Supabase → Settings → Database.
- **SUPABASE_URL** – API base URL for Supabase (e.g. `https://YOUR_PROJECT.supabase.co`). Required for uploads to Supabase Storage.

### Backend (backend/.env)
- `DATABASE_URL` – PostgreSQL connection string (required)
- `JWT_SECRET` – Secret for JWT tokens
- `SUPABASE_URL` – Supabase project URL (for file uploads)
- `SUPABASE_SERVICE_KEY` – Supabase service role key (for file uploads)
- `SUPABASE_BUCKET` – Storage bucket name (default: documents)

### Frontend (.env)
- VITE_API_URL - GraphQL endpoint (default: http://localhost:4000/graphql)
- VITE_SUPABASE_URL - Supabase URL for client
- VITE_SUPABASE_ANON_KEY - Supabase anon key for uploads
