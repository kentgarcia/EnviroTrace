# Test Account Credentials

This document contains test account credentials for the EnviroTrace application.

## Default Password

All test accounts use the same password for easy testing:

```
Password: Test123!
```

⚠️ **IMPORTANT**: These are test accounts only. Never use these credentials in production!

## Test Accounts

### 1. Super Admin Account
- **Email**: `admin@envirotrace.com`
- **Password**: `Test123!`
- **Role**: Admin (Super Admin)
- **Name**: Admin User
- **Department**: IT
- **Access**: Full system access, all modules

### 2. Air Quality Officer
- **Email**: `airquality@envirotrace.com`
- **Password**: `Test123!`
- **Role**: Air Quality
- **Name**: Air Quality Officer
- **Department**: Environmental Management
- **Access**: Air quality monitoring, violations, records

### 3. Tree Management Officer
- **Email**: `treemanagement@envirotrace.com`
- **Password**: `Test123!`
- **Role**: Tree Management
- **Name**: Tree Management Officer
- **Department**: Parks and Recreation
- **Access**: Urban greening, tree management, sapling records

### 4. Government Emission Inspector
- **Email**: `emission@envirotrace.com`
- **Password**: `Test123!`
- **Role**: Government Emission
- **Name**: Emission Inspector
- **Department**: Vehicle Compliance
- **Access**: Vehicle emission testing, test schedules

### 5. Multi-Role Officer
- **Email**: `multiRole@envirotrace.com`
- **Password**: `Test123!`
- **Roles**: Air Quality, Tree Management
- **Name**: Multi Role
- **Department**: Environmental Services
- **Access**: Combined access to air quality and tree management modules

## Creating Test Accounts

### Windows
```bash
cd backend
scripts\create_test_accounts.bat
```

### Linux/Mac
```bash
cd backend
chmod +x scripts/create_test_accounts.sh
./scripts/create_test_accounts.sh
```

### Direct Python
```bash
cd backend
python scripts/create_test_accounts.py
```

## API Testing Examples

### Login Request
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@envirotrace.com",
    "password": "Test123!"
  }'
```

### Using Access Token
```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Role-Based Access

| Role | Air Quality | Tree Management | Emission Testing | Admin Panel |
|------|-------------|-----------------|------------------|-------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Air Quality | ✅ | ❌ | ❌ | ❌ |
| Tree Management | ❌ | ✅ | ❌ | ❌ |
| Government Emission | ❌ | ❌ | ✅ | ❌ |

## Security Notes

1. **Development Only**: These credentials are for development and testing only
2. **Change in Production**: Never use these credentials in production environments
3. **Password Policy**: Production should enforce strong password policies
4. **Account Cleanup**: Remove or disable test accounts before going live
5. **Environment Variables**: Use environment variables for production credentials

## Troubleshooting

### Script Fails to Run
- Ensure you're in the `backend` directory
- Check that Python dependencies are installed: `pip install -r requirements.txt`
- Verify database connection in `.env` file

### User Already Exists
- The script will skip creating users that already exist
- To recreate accounts, delete them from the database first:
  ```sql
  DELETE FROM app_auth.users WHERE email LIKE '%@envirotrace.com';
  ```

### Cannot Login
- Verify the backend server is running: `uvicorn app.main:app --reload`
- Check that the database migration completed successfully
- Confirm the user exists in `app_auth.users` table
- Verify password hashing is working correctly

## Next Steps

1. Run the test account creation script
2. Start the backend server
3. Test login with each account
4. Verify role-based access control
5. Test module-specific functionality

---

**Last Updated**: December 9, 2025  
**Version**: 1.0.0
