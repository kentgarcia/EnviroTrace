# Supabase OTP Resend Email Delivery Fix

## Problem Summary

**Issue**: Users received success message `{"message":"Verification code has been resent to your email."}` but no email was actually delivered when resending OTP codes for existing unconfirmed users.

**Root Cause**: Supabase Auth's `/resend` endpoint has a documented limitation - it returns HTTP 200 success but does **NOT** actually send emails for existing unconfirmed users.

### Evidence from Supabase Auth Logs

Analyzed 24 hours of Auth service logs and found:

```plaintext
✅ /signup with user_confirmation_requested → mail.send event triggered
❌ /resend (HTTP 200 success) → NO mail.send event
❌ /signup with user_repeated_signup → NO mail.send event
```

**Pattern**: Only `user_confirmation_requested` actions trigger actual email delivery. When a user already exists (unconfirmed), Supabase logs it as `user_repeated_signup` and doesn't send emails, despite returning success.

## Solution

Delete unconfirmed Supabase Auth users and trigger fresh signups to reliably send verification emails.

### Implementation

#### 1. Backend Changes

**File**: `backend/app/core/supabase_client.py`

Added `delete_unconfirmed_user()` function:
- Queries Supabase Auth users via admin API
- Checks if user is confirmed (raises error if yes)
- Deletes unconfirmed users to allow fresh signup
- Returns True on success

Updated `resend_otp()` function:
- Added warning documentation about Supabase limitation
- Kept standard resend call for compatibility
- Logs warnings when called (won't work for existing unconfirmed users)

**File**: `backend/app/services/auth_service.py`

**Signup Flow (`register_user`)**:
- When "already registered" error occurs, delete the unconfirmed user
- Immediately retry signup with same credentials
- Fresh signup triggers `user_confirmation_requested` → email sent
- Returns success response

**Resend Flow (`resend_otp_code`)**:
- Deletes unconfirmed user
- Returns HTTP 410 Gone status
- Error message: "Verification session expired. Please sign up again to receive a new code."

#### 2. Frontend Changes

**File**: `client/src/presentation/pages/public/VerifyEmail.tsx`

Updated `handleResend()` function:
- Detects HTTP 410 Gone status from backend
- Shows user-friendly error message
- Automatically redirects to signup page after 2 seconds
- User can re-enter credentials to get fresh OTP

### User Experience Flow

#### Scenario 1: Signup with Expired OTP Email

1. User enters email with previous unconfirmed signup
2. Clicks "Sign Up"
3. **Backend**: Detects existing user → deletes → retries signup
4. **Result**: User seamlessly receives new OTP email
5. User enters code and verifies

#### Scenario 2: Resend from Verify Page

1. User on verify page clicks "Resend Code"
2. **Backend**: Deletes unconfirmed user → returns 410 Gone
3. **Frontend**: Shows "Verification expired" message → redirects to signup
4. User re-enters email/password
5. **Backend**: Fresh signup sends email
6. User receives new OTP

## Technical Details

### Supabase Auth User States

| State | email_confirmed_at | Auth Action | Email Sent? |
|-------|-------------------|-------------|-------------|
| New User | NULL | `user_confirmation_requested` | ✅ Yes |
| Existing Unconfirmed | NULL | `user_repeated_signup` | ❌ No |
| Confirmed | timestamp | N/A | N/A |

### API Changes

**Endpoint**: `POST /auth/resend-otp`

**Before**:
```json
Response: 200 OK
{"message": "Verification code has been resent to your email."}
```

**After**:
```json
Response: 410 Gone
{"detail": "Verification session expired. Please sign up again to receive a new code."}
```

### Cleanup Mechanism

The solution naturally handles cleanup:
- Unconfirmed users are deleted before fresh signup
- No orphaned Supabase Auth users
- Database remains consistent (users only created after OTP verification)

## Testing

### Test Case 1: Expired OTP Retry
1. Sign up with email
2. Wait for OTP to expire (or don't enter it)
3. Try signing up again with same email
4. **Expected**: Receive new OTP email immediately

### Test Case 2: Resend Button
1. Sign up and navigate to verify page
2. Click "Resend Code" button
3. **Expected**: See "Verification expired" message
4. **Expected**: Auto-redirect to signup page (2 seconds)
5. Re-enter details and sign up
6. **Expected**: Receive new OTP email

### Test Case 3: Confirmed User Protection
1. Complete signup and verify email
2. Try to sign up again with same email
3. **Expected**: Error "An account with this email already exists. Please sign in instead."

## Logs & Debugging

**Backend Logs** (check console output):
```
Deleted unconfirmed user test@example.com (ID: uuid-here)
Deleted unconfirmed user test@example.com, allowing signup retry
```

**Supabase Auth Logs** (Dashboard → Logs → Auth):
- Look for `user_confirmation_requested` actions (email sent)
- Look for `mail.send` events with `mail_type: "confirmation"`
- Verify no `user_repeated_signup` actions (those don't send emails)

## Future Considerations

1. **Rate Limiting**: Consider adding user-specific rate limits for signup retries
2. **Analytics**: Track how often users encounter expired OTP scenarios
3. **UX Enhancement**: Pre-fill email on redirect to signup page
4. **Alternative**: Monitor Supabase SDK updates for potential resend fix

## References

- Supabase Python SDK: `supabase-py==2.12.0`
- Auth Admin API: `supabase.auth.admin.list_users()`, `delete_user()`
- HTTP 410 Gone: Indicates resource existed but is no longer available
