# Supabase Auth Setup Guide

This guide covers the migration from custom JWT authentication to Supabase Auth with email/password and OTP verification.

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Python 3.8+** with pip
3. **PostgreSQL database** (your existing EnviroTrace database)

---

## Step 1: Configure Supabase Dashboard

### 1.1 Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Email** provider
3. **Disable** "Confirm email" toggle (we're using OTP manually)
4. Save changes

### 1.2 Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Update template to show 6-digit OTP code prominently:

```html
<h2>Verify your email</h2>
<p>Enter this code to verify your email:</p>
<h1 style="font-size: 32px; font-weight: bold;">{{ .Token }}</h1>
<p>This code expires in 10 minutes.</p>
```

### 1.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public** key: `eyJ...` (safe for client-side)
   - **service_role** key: `eyJ...` (⚠️ SECRET - server-side only)
   - **JWT Secret**: Found under "JWT Settings" section

### 1.4 Set Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (dev) or your production URL
3. Add **Redirect URLs**: 
   - `http://localhost:5173/**`
   - Your production domain(s)

---

## Step 2: Update Backend Environment Variables

### 2.1 Add to `.env` file

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-dashboard

# Existing Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/envirotrace
SECRET_KEY=your-secret-key-here

# Super Admin Auto-Promotion
SUPER_ADMIN_EMAILS=admin@envirotrace.com

# Token Expiration (no longer used by Supabase, but kept for compatibility)
ACCESS_TOKEN_EXPIRE_MINUTES=600
ALGORITHM=HS256
```

### 2.2 Security Notes

- ⚠️ **NEVER commit** `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_JWT_SECRET` to version control
- ✅ Add `.env` to `.gitignore`
- ✅ Use different Supabase projects for dev/staging/production

---

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Key changes in requirements.txt:**
- ✅ Added: `supabase==2.12.0` (Supabase Python client)
- ✅ Added: `pyjwt==2.8.0` (JWT verification)
- ❌ Removed: `python-jose` (replaced by pyjwt)

---

## Step 4: Run Database Migration

### 4.1 Backup Current Database (IMPORTANT!)

```bash
# Using pg_dump
pg_dump -h localhost -U your_user -d envirotrace > backup_before_migration_$(date +%Y%m%d).sql

# Or using Supabase CLI if connected to Supabase Postgres
supabase db dump -f backup.sql
```

### 4.2 Apply Migration

```bash
cd backend
alembic upgrade head
```

**What this migration does:**
- ✅ Adds `supabase_user_id` column to `app_auth.users`
- ✅ Adds `email_confirmed_at` column to track email verification
- ✅ Removes `encrypted_password` column (Supabase handles passwords)
- ✅ Renames `session_token` → `supabase_session_id` in `app_auth.user_sessions`
- ⚠️ **DELETES all existing test accounts** (fresh start approach)

**Test accounts to be deleted:**
- `admin@envirotrace.com`
- `airquality@envirotrace.com`
- `treemanagement@envirotrace.com`
- `emission@envirotrace.com`
- `multirole@envirotrace.com`

### 4.3 Verify Migration

```sql
-- Check schema changes
\d app_auth.users;

-- Should show:
-- - supabase_user_id (uuid, nullable, unique)
-- - email_confirmed_at (timestamp with time zone)
-- - NO encrypted_password column

-- Verify test accounts deleted
SELECT email, deleted_at FROM app_auth.users;
-- Should return 0 rows or only archived users
```

### 4.4 Rollback (if needed)

```bash
alembic downgrade -1
```

⚠️ **Warning**: Rollback will NOT restore deleted test accounts. Restore from backup if needed.

---

## Step 5: Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Check startup logs for errors:**
- ✅ No Supabase connection errors
- ✅ JWT secret loaded correctly
- ✅ No missing environment variables

---

## Step 6: Test New Authentication Flow

### 6.1 Register New User (with OTP)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@envirotrace.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response:**
```json
{
  "message": "Registration successful. Check your email for verification code.",
  "email": "test@envirotrace.com"
}
```

**Check Email**: You should receive a 6-digit OTP code (e.g., `123456`)

### 6.2 Verify OTP

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@envirotrace.com",
    "token": "123456"
  }'
```

**Expected Response (Pending Approval):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "id": "...",
    "email": "test@envirotrace.com",
    ...
  },
  "message": "Email verified. Your account is pending admin approval."
}
```

⚠️ **Note**: User account is created but `is_approved=false`. User cannot login until admin approves.

### 6.3 Admin Approves User

**First, login as admin:**
```bash
# Register admin account (will be auto-approved if in SUPER_ADMIN_EMAILS)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@envirotrace.com",
    "password": "AdminPass123!",
    "first_name": "Admin",
    "last_name": "User"
  }'

# Verify admin OTP (admin is auto-approved)
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@envirotrace.com", "token": "OTP_CODE"}'

# Get admin token from response, then approve the test user
curl -X POST http://localhost:8000/api/v1/admin/users/{user_id}/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "test@envirotrace.com",
  "is_approved": true,
  "email_confirmed_at": "2026-02-02T...",
  ...
}
```

### 6.4 Login (After Admin Approval)

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@envirotrace.com&password=SecurePass123!" \
  -H "X-Device-Type: desktop" \
  -H "X-Device-Name: Test Device"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600
}
```

### 6.5 Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "test@envirotrace.com",
  "is_super_admin": false,
  "is_approved": true,
  "supabase_user_id": "...",
  "email_confirmed_at": "2026-02-02T...",
  "assigned_roles": [],
  "permissions": [],
  "profile": {
    "first_name": "Test",
    "last_name": "User",
    ...
  }
}
```

### 6.6 Refresh Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGc..."
  }'
```

### 6.7 Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

### 6.8 Test Admin Approval Workflow

**List pending users (admin only):**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users?status=active" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Approve a user:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/users/{user_id}/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Revoke approval:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/users/{user_id}/revoke-approval \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Step 7: Recreate Test Accounts

After migration, you'll need to recreate test accounts through the new registration flow:

### 7.1 Admin Account
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@envirotrace.com",
    "password": "Test123!",
    "first_name": "Admin",
    "last_name": "User",
    "job_title": "System Administrator",
    "department": "IT"
  }'

# Check email for OTP, then verify
curl -X POST http://localhost:8000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@envirotrace.com", "token": "OTP_CODE"}'
```

**Note**: `admin@envirotrace.com` will automatically become super admin if listed in `SUPER_ADMIN_EMAILS`.

### 7.2 Role-based Accounts

After registration, assign roles through admin panel or API:

```bash
# Example: Assign air_quality role
curl -X PUT http://localhost:8000/api/v1/admin/users/{user_id} \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["air_quality"]
  }'
```

---

## Troubleshooting

### Error: "Could not validate credentials"

**Cause**: JWT secret mismatch between Supabase and backend

**Fix**: 
1. Verify `SUPABASE_JWT_SECRET` matches Supabase Dashboard → Settings → API → JWT Secret
2. Restart backend server after .env changes

### Error: "User not found. Please complete registration."

**Cause**: User exists in Supabase Auth but not in internal database

**Fix**: Delete user from Supabase Dashboard and re-register:
1. Supabase Dashboard → Authentication → Users
2. Find user and delete
3. Re-register through `/auth/register` endpoint

### Error: "Email not verified. Please verify your email before logging in."

**Cause**: User registered but didn't complete OTP verification

**Fix**: Resend OTP code:
```bash
curl -X POST http://localhost:8000/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Error: "Invalid or expired OTP code"

**Causes**:
- OTP expired (10-minute validity)
- Wrong code entered
- User already verified (trying to verify again)

**Fix**: Request new OTP via `/auth/resend-otp`

### Error: "Account pending approval. Please wait for an administrator to approve your account."

**Cause**: User verified email but admin hasn't approved the account yet

**Fix**: Admin must approve the user:
1. Admin logs in to system
2. Admin navigates to user management
3. Admin clicks "Approve" on pending user
4. User can now login

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/users/{user_id}/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Migration Fails

**Rollback and check logs:**
```bash
alembic downgrade -1
alembic upgrade head --sql  # Preview SQL without running
```

**Common issues:**
- Database connection error (check `DATABASE_URL`)
- Constraint violations (existing data conflicts)
- Missing UUID extension (run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept secret (never in client code)
- [ ] `SUPABASE_JWT_SECRET` matches Supabase Dashboard
- [ ] `.env` file is in `.gitignore`
- [ ] Different Supabase projects for dev/prod
- [ ] Email templates updated (no magic links, OTP only)
- [ ] CORS origins configured correctly
- [ ] Super admin emails list is correct
- [ ] Old test account passwords are documented/stored securely

---

## Architecture Changes Summary

### Before (Custom JWT Auth)
```
Client → FastAPI → bcrypt verify password → Generate JWT → Store in user_sessions
```

### After (Supabase Auth)
```
Client → FastAPI → Supabase Auth API → Verify with Supabase → Store session tracking
```

### What Supabase Handles
- ✅ Password hashing (bcrypt)
- ✅ Password strength validation
- ✅ Email sending (OTP codes)
- ✅ JWT generation and signing
- ✅ Token expiration and refresh
- ✅ Rate limiting (configurable)
- ✅ Email verification logic

### What Backend Still Handles
- ✅ RBAC (roles and permissions system)
- ✅ **Admin approval workflow** (users must be approved after email verification)
- ✅ Session device tracking (IP, user agent, device type)
- ✅ User profiles (name, job title, department)
- ✅ Super admin auto-promotion
- ✅ Soft delete logic
- ✅ API authorization (role/permission checks)

### Authentication Flow (3-Step Process)

1. **Registration** → User registers with email/password
2. **Email Verification** → User receives OTP, verifies email (account created, `is_approved=false`)
3. **Admin Approval** → Admin approves user in dashboard (sets `is_approved=true`)
4. **Login** → User can now login and access system

**Super Admins** (emails in `SUPER_ADMIN_EMAILS`):
- Auto-approved after email verification (skip step 3)
- Can approve other users
- Bypass all role/permission checks

---

## Next Steps

1. **Frontend Integration**: Update client to handle OTP verification flow
2. **Mobile App**: Update mobile auth to use new endpoints
3. **Email Customization**: Brand Supabase email templates with company logo
4. **Rate Limiting**: Configure Supabase rate limits for auth endpoints
5. **Monitoring**: Set up alerts for failed login attempts in Supabase Dashboard
6. **Password Reset**: Implement forgot password flow using Supabase password reset
7. **2FA (Optional)**: Add TOTP-based 2FA using Supabase Auth

---

## API Endpoint Changes

### New Endpoints
- `POST /api/v1/auth/verify-otp` - Verify OTP after registration (creates account with `is_approved=false`)
- `POST /api/v1/auth/resend-otp` - Resend OTP code
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/admin/users/{user_id}/approve` - Approve user account (admin only)
- `POST /api/v1/admin/users/{user_id}/revoke-approval` - Revoke user approval (admin only)

### Modified Endpoints
- `POST /api/v1/auth/register` - Now sends OTP email, doesn't return token immediately
- `POST /api/v1/auth/login` - Returns refresh_token; blocks unapproved users
- `POST /api/v1/auth/logout` - Now invalidates Supabase session
- `GET /api/v1/auth/me` - Now includes `is_approved` and `email_confirmed_at` fields

### Unchanged Endpoints
- `GET /api/v1/admin/users` - Lists all users (now shows approval status)
- All protected endpoints continue to work with Bearer token authentication

---

## Support

For issues or questions:
1. Check Supabase Dashboard → Logs for auth-related errors
2. Check FastAPI logs: `tail -f backend/logs/app.log`
3. Review this guide's Troubleshooting section
4. Consult Supabase Auth docs: https://supabase.com/docs/guides/auth
