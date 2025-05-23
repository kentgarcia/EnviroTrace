# Development Scripts

This directory contains utility scripts for development and setup purposes.

## Admin User Creation

The script `create_admin_user.py` creates an admin user with all roles and a profile for development and testing purposes.

### Credentials

- **Email**: admin@ecodash.gov.ph
- **Password**: Admin@123

> **WARNING**: These are for development only. In production, use secure credentials and change them immediately.

### How to Run

#### On Windows:

```bash
.\scripts\setup_admin.bat
```

#### On Linux/macOS:

```bash
./scripts/setup_admin.sh
```

### What the Script Does

1. Creates any missing database schemas
2. Creates the UUID extension if missing
3. Creates an admin user with all roles
4. Creates a profile for the admin user
5. Prints the login credentials when done

### Customizing

You can customize the admin user information by editing the `create_admin_user.py` script:

- Change `admin_email` to use a different email
- Change `admin_password` to use a different password
- Modify the profile information as needed
