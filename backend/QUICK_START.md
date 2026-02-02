# Quick Start - Supabase Auth Configuration

## ⚠️ Required Environment Variables

Before starting the backend, you MUST set these environment variables in your `.env` file:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**

   Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Select your project → **Settings** → **API**

   You'll find these values:

   ### Project URL
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   ```

   ### API Keys (Under "Project API keys")
   ```
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ### JWT Public Key (Under "JWT Signing Keys" section - scroll down)
   ```
   SUPABASE_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
   ```

   **⚠️ Important:** Copy the ENTIRE public key including the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` headers. Use quotes and `\n` for line breaks.

3. **Complete `.env` file should have:**

   ```bash
   # Database
   DATABASE_URL=postgresql+asyncpg://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   
   # FastAPI Security
   SECRET_KEY=your-random-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=600
   ALGORITHM=HS256
   
   # Supabase Configuration (ALL REQUIRED)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
   
   # Super Admin Configuration
   SUPER_ADMIN_EMAILS=admin@envirotrace.com
   ```

4. **Start the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Common Errors

### ❌ `Field required [type=missing] SUPABASE_JWT_PUBLIC_KEY`

**Solution:** Add `SUPABASE_JWT_PUBLIC_KEY` to your `.env` file. Get it from:
- Supabase Dashboard → Settings → API → JWT Signing Keys → Public Key (scroll down)
- Copy the entire key including `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` headers

### ❌ `Field required [type=missing] SUPABASE_SERVICE_ROLE_KEY`

**Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file. Get it from:
- Supabase Dashboard → Settings → API → "service_role" key (under Project API keys)

### ❌ `Could not validate credentials`

**Solution:** Your `SUPABASE_JWT_PUBLIC_KEY` is invalid or incorrectly formatted. Make sure:
- You copied the entire public key including headers
- The key is wrapped in quotes in your `.env` file
- Line breaks are represented as `\n` (not actual newlines)

## Next Steps

After configuring environment variables:

1. **Enable Supabase Auth:**
   - Supabase Dashboard → Authentication → Providers → Enable "Email"

2. **Run migration:**
   ```bash
   alembic upgrade head
   ```

3. **Register first user:**
   - Visit `http://localhost:5173/sign-up`
   - Enter email and password
   - Check email for OTP code
   - Enter OTP to verify

4. **Approve users (if not super admin):**
   - Login as admin (listed in `SUPER_ADMIN_EMAILS`)
   - Navigate to User Management
   - Approve pending users

## Full Documentation

For complete setup instructions, see [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)
