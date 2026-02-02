# JWT Signing Keys Migration Guide

## ✅ Updated: Backend now uses Supabase JWT Signing Keys (RS256)

Supabase has migrated to **asymmetric JWT signing** using RS256 algorithm with public/private key pairs. This is more secure than the previous symmetric HS256 approach with a shared secret.

## What Changed

### Before (Legacy - HS256)
```python
# config.py
SUPABASE_JWT_SECRET: str  # Shared secret

# supabase_client.py
jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
```

### After (Current - RS256)
```python
# config.py
SUPABASE_JWT_PUBLIC_KEY: str  # Public key only

# supabase_client.py
jwt.decode(token, SUPABASE_JWT_PUBLIC_KEY, algorithms=["RS256"])
```

## How to Update Your Environment

### 1. Get Your JWT Public Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Scroll down to **JWT Signing Keys** section
5. Copy the **Public Key** (entire content including headers)

The key should look like this:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef...
(multiple lines of base64)
...abcdef1234567890
-----END PUBLIC KEY-----
```

### 2. Update Your `.env` File

**Remove the old variable:**
```bash
# ❌ Remove this (if present)
SUPABASE_JWT_SECRET=your-old-secret
```

**Add the new variable:**
```bash
# ✅ Add this
SUPABASE_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
```

**Important formatting notes:**
- ✅ Wrap the entire key in **double quotes**
- ✅ Use `\n` (backslash-n) for line breaks, NOT actual newlines
- ✅ Include both `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` headers
- ✅ Keep it as one line in your `.env` file

### 3. Complete `.env` Example

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# FastAPI Security
SECRET_KEY=your-random-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=600
ALGORITHM=HS256

# Supabase Configuration (ALL REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"

# Super Admin Configuration
SUPER_ADMIN_EMAILS=admin@envirotrace.com
```

### 4. Restart Backend

```bash
cd backend
uvicorn app.main:app --reload
```

## Verification

Check that the backend starts without errors:

```
✅ INFO:     Application startup complete
✅ INFO:     Uvicorn running on http://127.0.0.1:8000
```

Test authentication:
```bash
# Register a test user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'

# Should return: "Registration successful. Check your email for verification code."
```

## Troubleshooting

### ❌ `Field required [type=missing] SUPABASE_JWT_PUBLIC_KEY`

**Problem:** The new environment variable is not set.

**Solution:** Add `SUPABASE_JWT_PUBLIC_KEY` to your `.env` file (see step 2 above).

### ❌ `Could not validate credentials: Invalid key format`

**Problem:** The public key is incorrectly formatted.

**Solution:** Make sure you:
1. Copied the ENTIRE key from Supabase Dashboard (including headers)
2. Wrapped it in quotes in your `.env` file
3. Used `\n` for line breaks (not actual newlines)
4. Didn't accidentally add extra spaces or characters

### ❌ `Could not validate credentials: Signature verification failed`

**Problem:** You copied the wrong key or from the wrong Supabase project.

**Solution:** 
1. Verify you're looking at the correct Supabase project
2. Copy the **Public Key** (not Private Key, not JWT Secret)
3. Restart your backend after updating `.env`

### ❌ Tokens are rejected after the change

**Problem:** Old tokens were signed with the old key and won't work with the new public key.

**Solution:** Users need to logout and login again to get new tokens signed with the current keys.

## Why This Migration?

### Security Benefits

1. **Private key never leaves Supabase** - Only the public key is shared with your backend
2. **More secure algorithm** - RS256 is asymmetric and considered more secure than HS256
3. **Key rotation** - Easier to rotate keys without sharing secrets
4. **Industry standard** - RS256 is the recommended algorithm for JWT in production

### Technical Details

- **Algorithm**: RS256 (RSA Signature with SHA-256)
- **Key Type**: 2048-bit RSA public key
- **Use Case**: JWT signature verification only (backend cannot sign tokens, only verify them)
- **Supabase retains**: Private key for signing tokens
- **Your backend gets**: Public key for verifying tokens

## Files Updated

- ✅ `backend/app/core/config.py` - Changed `SUPABASE_JWT_SECRET` to `SUPABASE_JWT_PUBLIC_KEY`
- ✅ `backend/app/core/supabase_client.py` - Updated `verify_supabase_jwt()` to use RS256
- ✅ `backend/.env.example` - Updated environment variable documentation
- ✅ `backend/SUPABASE_AUTH_SETUP.md` - Updated setup instructions
- ✅ `backend/QUICK_START.md` - Updated quick start guide

## Next Steps

After updating your `.env` file and restarting the backend:

1. ✅ Old sessions may need re-authentication (users logout/login)
2. ✅ Test the complete auth flow:
   - Registration
   - Email verification (OTP)
   - Login
   - Protected endpoints

## Need Help?

- Check your Supabase project logs: Dashboard → Logs
- Check backend logs for JWT verification errors
- Verify your Supabase project is using JWT Signing Keys (not legacy JWT Secret)
- See [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) for complete documentation
