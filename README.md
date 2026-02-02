# Portfolio Messaging System

Production-ready messaging system with Netlify Functions and Supabase PostgreSQL.

## Features

- ✅ Public contact form on portfolio
- ✅ Private admin dashboard
- ✅ JWT authentication
- ✅ Rate limiting (5 messages/hour per IP)
- ✅ Supabase PostgreSQL database
- ✅ 100% free hosting (Netlify + Supabase)

## Tech Stack

- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase PostgreSQL
- **Frontend**: Vanilla HTML/CSS/JS
- **Hosting**: Netlify (all-in-one)
- **Auth**: JWT

## Project Structure

```
PORT/
├── netlify/
│   └── functions/
│       ├── utils/
│       │   ├── supabase.js      # Supabase client
│       │   ├── auth.js          # JWT verification
│       │   └── rateLimit.js     # Rate limiter
│       ├── messages.js          # POST - public
│       ├── admin-login.js       # POST - admin login
│       ├── get-messages.js      # GET - admin only
│       └── reply.js             # POST - admin only
│
├── admin/                       # Admin dashboard (separate deploy)
│   ├── index.html              # Login page
│   ├── dashboard.html          # Inbox
│   ├── style.css
│   ├── auth.js
│   ├── dashboard.js
│   └── netlify.toml
│
├── index.html                   # Portfolio with contact form
├── style.css
├── script.js
├── contact.js                   # Contact form logic
├── schema.sql                   # Database schema
├── netlify.toml                 # Netlify config
├── package.json
└── DEPLOYMENT.md                # Deployment guide
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Locally

```bash
npx netlify dev
```

Visit `http://localhost:8888`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

**Quick Summary:**
1. Create Supabase project
2. Run `schema.sql`
3. Push to GitHub
4. Deploy to Netlify
5. Add environment variables

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (bypasses RLS) |
| `JWT_SECRET` | Random secret for JWT signing |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password |

## API Endpoints

### Public

- `POST /.netlify/functions/messages` - Submit message (rate-limited)

### Admin (JWT required)

- `POST /.netlify/functions/admin-login` - Admin login
- `GET /.netlify/functions/get-messages` - Get all messages
- `POST /.netlify/functions/reply` - Reply to message

## Database Schema

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security

- ✅ Rate limiting: 5 messages/hour per IP
- ✅ JWT expiration: 24 hours
- ✅ Row Level Security (RLS) enabled
- ✅ Service role key (backend only)
- ✅ Password hashing: bcryptjs
- ✅ Input validation

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Netlify Functions | 125k invocations/month |
| Netlify Bandwidth | 100GB/month |
| Supabase Database | 500MB |

## License

MIT
