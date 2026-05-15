# Weddify Node Backend

## Setup

1. Copy `.env.example` to `.env`
2. Update MongoDB connection and JWT secret
3. Install dependencies and run

```bash
cd node-backend
npm install
npm run dev
```

Server default URL: `http://localhost:8000`

## Required Environment Variables

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `FLASK_API_URL`
