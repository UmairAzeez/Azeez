# Deployment Guide - Netlify Functions + Supabase

Complete guide to deploy your messaging system using Netlify Functions and Supabase PostgreSQL.

## Prerequisites

- GitHub account
- Netlify account (free)
- Supabase account (free)

---

## Step 1: Create Supabase Project

### 1.1 Sign Up
- Go to [supabase.com](https://supabase.com)
- Sign up for free

### 1.2 Create Project
- Click "New Project"
- Choose organization (or create one)
- Set project name: `portfolio-messaging` (or your choice)
- Set database password (save this!)
- Choose region (closest to you)
- Click "Create new project"
- Wait 2-3 minutes for setup

### 1.3 Run SQL Schema
- In Supabase dashboard, go to "SQL Editor"
- Click "New query"
- Copy and paste the contents of `schema.sql`
- Click "Run"
- Verify: Go to "Table Editor" → should see `messages` table

### 1.4 Get Credentials
- Go to "Project Settings" → "API"
- Copy these values (you'll need them later):
  - **Project URL** (e.g., `https://xxxxx.supabase.co`)
  - **service_role key** (under "Project API keys" → reveal and copy)

> [!WARNING]
> Use the **service_role** key, NOT the anon key. The service role bypasses RLS.

---

## Step 2: Generate Admin Password Hash

You need to hash your admin password before deploying.

### Option A: Using Node.js

```bash
# Install bcryptjs globally
npm install -g bcryptjs

# Run in Node.js REPL
node
```

Then in the REPL:
```javascript
const bcrypt = require('bcryptjs');
const password = 'your_strong_password_here'; // Choose a strong password
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
// Copy the output (starts with $2a$10$...)
```

### Option B: Online Tool
- Go to [bcrypt-generator.com](https://bcrypt-generator.com/)
- Enter your password
- Set rounds to 10
- Click "Generate"
- Copy the hash

**Save both your password and hash!**

---

## Step 3: Prepare GitHub Repository

### 3.1 Initialize Git (if not already)
```bash
cd PORT
git init
git add .
git commit -m "Initial commit with Netlify Functions"
```

### 3.2 Create GitHub Repository
- Go to [github.com/new](https://github.com/new)
- Create a new repository (e.g., `portfolio-messaging`)
- Don't initialize with README (you already have files)

### 3.3 Push to GitHub
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Netlify (Public Site)

### 4.1 Connect Repository
- Go to [netlify.com](https://netlify.com)
- Click "Add new site" → "Import an existing project"
- Choose "GitHub"
- Select your repository

### 4.2 Configure Build Settings
- **Build command**: Leave empty
- **Publish directory**: `/`
- **Functions directory**: `netlify/functions` (should auto-detect from netlify.toml)

### 4.3 Add Environment Variables
Click "Show advanced" → "New variable" and add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your service_role key |
| `JWT_SECRET` | Random string (generate with: `openssl rand -hex 32`) |
| `ADMIN_USERNAME` | Your admin username (e.g., `admin`) |
| `ADMIN_PASSWORD_HASH` | The bcrypt hash from Step 2 |

### 4.4 Deploy
- Click "Deploy site"
- Wait for deployment (2-3 minutes)
- Copy your site URL (e.g., `https://your-site.netlify.app`)

### 4.5 Test Public Form
- Visit your site
- Scroll to contact section
- Submit a test message
- Should see "Message sent successfully!"

---

## Step 5: Deploy Admin Dashboard (Separate Site)

### 5.1 Create Separate Repository
```bash
cd admin
git init
git add .
git commit -m "Admin dashboard"
```

- Create new GitHub repo (e.g., `portfolio-admin`)
- Push:
```bash
git remote add origin YOUR_ADMIN_REPO_URL
git branch -M main
git push -u origin main
```

### 5.2 Deploy to Netlify
- Go to Netlify
- Click "Add new site" → "Import an existing project"
- Choose your admin repository
- **Build command**: Leave empty
- **Publish directory**: `/`

### 5.3 Add Same Environment Variables
Add the exact same environment variables as Step 4.3:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` (must be identical!)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`

### 5.4 Deploy
- Click "Deploy site"
- Copy your admin URL (e.g., `https://your-admin.netlify.app`)

### 5.5 Test Admin Dashboard
- Visit admin site
- Login with your username and password
- Should see your test message
- Try replying
- Should see "Reply saved successfully!"

---

## Step 6: Verify Everything Works

### 6.1 Test Public Form
- [ ] Submit message from portfolio
- [ ] Check Supabase (Table Editor → messages)
- [ ] Verify message appears

### 6.2 Test Admin Login
- [ ] Login to admin dashboard
- [ ] Should redirect to inbox

### 6.3 Test Admin Functions
- [ ] View messages (newest first)
- [ ] Reply to a message
- [ ] Verify reply saved in Supabase
- [ ] Update existing reply

### 6.4 Test Rate Limiting
- [ ] Submit 6 messages quickly
- [ ] 6th message should be rate-limited

### 6.5 Test Security
- [ ] Try accessing admin dashboard without login
- [ ] Should redirect to login page
- [ ] Try accessing functions without JWT
- [ ] Should return 401 Unauthorized

---

## Troubleshooting

### "Failed to save message"
- Check Supabase credentials in Netlify env vars
- Verify `SUPABASE_SERVICE_KEY` is the service_role key
- Check Supabase logs (Logs & Analytics)

### "Invalid credentials" on admin login
- Verify `ADMIN_USERNAME` matches what you're typing
- Verify `ADMIN_PASSWORD_HASH` is correct
- Check Netlify function logs

### "Invalid token" in admin dashboard
- Verify `JWT_SECRET` is identical on both sites
- Try logging out and logging in again
- Check browser console for errors

### Functions not working
- Check Netlify function logs (Functions tab)
- Verify `netlify.toml` is in root directory
- Check that functions are in `netlify/functions/` folder
- Redeploy site

### CORS errors
- Functions should have CORS headers (already included)
- Check browser console for specific error
- Verify you're using HTTPS (not HTTP)

---

## Local Development

### Install Dependencies
```bash
npm install
```

### Set Up Local Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Run Netlify Dev Server
```bash
npx netlify dev
```

This will:
- Start local server on `http://localhost:8888`
- Run functions locally
- Use environment variables from `.env`

### Test Locally
- Visit `http://localhost:8888`
- Test contact form
- Visit `http://localhost:8888/admin`
- Test admin dashboard

---

## Important Notes

### Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| **Netlify** | 125k function invocations/month | More than enough |
| **Netlify** | 100GB bandwidth/month | Plenty for portfolio |
| **Supabase** | 500MB database | ~50,000 messages |
| **Supabase** | 2GB file storage | Not used |

### Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use strong admin password
- ✅ Rotate JWT secret periodically
- ✅ Keep Supabase service key secret
- ✅ Monitor function logs for suspicious activity

### Maintenance

- **Database**: Supabase has automatic backups
- **Functions**: Netlify auto-deploys on git push
- **Monitoring**: Check Netlify analytics and Supabase logs

---

## Next Steps

### Custom Domain
1. Go to Netlify → Domain settings
2. Add custom domain
3. Follow DNS configuration steps

### Email Notifications
- Use Supabase Database Webhooks
- Trigger on new message insert
- Send to free email service (SendGrid, etc.)

### Additional Features
- Message deletion
- Pagination
- Search/filter
- Export messages
- Multiple admin users

---

## Support

If you encounter issues:
1. Check Netlify function logs
2. Check Supabase logs
3. Check browser console
4. Verify all environment variables
5. Try redeploying

**Common Issues:**
- Wrong service key (use service_role, not anon)
- JWT secret mismatch between sites
- Missing environment variables
- CORS issues (should be handled by functions)
