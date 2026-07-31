# Deployment Guide

## Environments & secrets
Never commit `.env`. Provide these variables via your platform's secret manager:

**Server** (see `server/.env.example`): `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `CLIENT_URL`, SMTP + optional Stripe/PayPal/Cloudinary/Google Maps keys.

**Client** (see `client/.env.example`): `VITE_API_URL`.

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Option A - Docker Compose (single host)
```bash
export JWT_ACCESS_SECRET=$(openssl rand -hex 32)
export JWT_REFRESH_SECRET=$(openssl rand -hex 32)
export COOKIE_SECRET=$(openssl rand -hex 16)
docker-compose up --build -d
```
Services: MongoDB `:27017`, API `:5000`, client (nginx) `:5173`.
Seed demo data once: `docker exec vinci-server npm run seed`.

## Option B - Managed (recommended for production)
- **Database:** MongoDB Atlas (M10+). Whitelist app IPs; enable backups.
- **API:** Render / Railway / Fly.io / AWS ECS. Build from `server/Dockerfile`. Set `NODE_ENV=production` and all secrets. Health check: `/api/v1/health`.
- **Client:** Vercel / Netlify / Cloudflare Pages. Build `npm run build`, output `dist/`. Set `VITE_API_URL` to the API's public URL.
- Point `CLIENT_URL` (server) at the client origin so CORS + cookies work. In production cookies are `Secure` + `SameSite=None`, so both must be HTTPS.

## CI/CD
`.github/workflows/ci.yml` runs on push/PR to `main`/`develop`: server lint+tests (in-memory Mongo) and client lint+build. Add a deploy job gated on `main`.

## Production checklist
- [ ] Strong, unique JWT/cookie secrets set via secret manager
- [ ] `NODE_ENV=production`
- [ ] HTTPS on both API and client origins
- [ ] MongoDB auth enabled + IP allow-list + automated backups
- [ ] SMTP configured (verification / reset / order emails)
- [ ] Rate limits reviewed for expected traffic
- [ ] Log aggregation + uptime monitoring on `/api/v1/health`

## Scaling notes
- API is stateless -> scale horizontally behind a load balancer.
- Add Redis for cart/session caching and distributed rate limiting.
- Enable MongoDB read replicas for reporting aggregations.
- Serve images via Cloudinary/CDN; enable HTTP caching for `/products`.
