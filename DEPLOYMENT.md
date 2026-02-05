# Deployment to Vercel

This project is configured for deployment on Vercel as a monorepo.

## Prerequisites

- [Vercel Account](https://vercel.com)
- GitHub Repository connected to Vercel

## Setup Steps

1.  **Push to GitHub**: Ensure your latest changes are pushed to your repository.
2.  **Import Project in Vercel**:
    - Go to Vercel Dashboard -> Add New -> Project.
    - Select your GitHub repository.
3.  **Configure Project**:
    - **Framework Preset**: Vercel should auto-detect `Vite` for the frontend. If not, select `Vite`.
    - **Root Directory**: Keep it as `./` (Project Root).
    - **Build Command**: `npm run build` (This runs `npm run build --workspaces`).
4.  **Environment Variables**:
    - Add the following environment variables in the Vercel Project Settings:
        - `DATABASE_URL`: Your production PostgreSQL connection string (Supabase, Neon, etc.).
        - `JWT_SECRET`: A secure random string for authentication.
        - `PORT`: (Optional, Vercel handles this, but good to have).

## How it Works

- **Frontend**: The `frontend` workspace is built using Vite and served as static assets.
- **Backend**: The `api/index.ts` file serves as a Serverless Function entry point.
- **Routing**: `vercel.json` handles the routing:
    - `/graphql` -> Serverless Function
    - `/api/*` -> Serverless Function
    - All other routes -> Frontend

## Troubleshooting

- **Database Connection**: Ensure your database allows connections from Vercel/Anywhere (0.0.0.0/0) or configure a connection pooler.
- **CORS**: If you face CORS issues, check `backend/src/index.ts` CORS configuration. It is currently set to allow `origin: true`.
