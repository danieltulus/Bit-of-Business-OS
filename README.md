# Founder Launch Kit

Cloudflare Worker SaaS starter template.

Features:
- Global deployment
- Live metrics
- Signup database (KV)
- Admin dashboard
- CLI deploy

## Setup

1. npm install
2. wrangler login
3. wrangler kv namespace create SIGNUPS
4. wrangler kv namespace create STATS
5. Add IDs to wrangler.jsonc
6. npm run deploy
