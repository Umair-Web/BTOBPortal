# Manual PostgreSQL Setup Guide

## Step 1: Find Your PostgreSQL Credentials

During PostgreSQL installation, you set a password. The default username is `postgres`.

**If you forgot your password:**
- Check your installation notes
- Or reset it using PostgreSQL's password reset process

**Default values:**
- Username: `postgres`
- Host: `localhost`
- Port: `5432`
- Password: The one you set during installation

## Step 2: Create the Database

You have two options:

### Option A: Using SQL Shell (psql) - Recommended

1. Open "SQL Shell (psql)" from Windows Start Menu
2. Press Enter 4 times to accept defaults:
   - Server [localhost]: Press Enter
   - Database [postgres]: Press Enter
   - Port [5432]: Press Enter
   - Username [postgres]: Press Enter
3. Enter your PostgreSQL password when prompted
4. Run this command:
   ```sql
   CREATE DATABASE btobportal;
   ```
5. Verify it was created:
   ```sql
   \l
   ```
   (You should see `btobportal` in the list)
6. Exit:
   ```sql
   \q
   ```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin from Start Menu
2. Connect to your PostgreSQL server (enter password if prompted)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `btobportal`
5. Click "Save"

## Step 3: Update .env File

Open your `.env` file and update it with your actual credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/btobportal?schema=public"

# NextAuth
AUTH_SECRET="change-this-to-a-random-secret-key-in-production"
AUTH_URL="http://localhost:3000"
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password.**

To generate a secure AUTH_SECRET, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Initialize Database Schema

Run these commands in your project directory:

```bash
# Generate Prisma Client
npm run db:generate

# Create all tables in the database
npm run db:push
```

If everything works, you'll see a success message!

## Step 5: Create Admin User

Create your first admin user:

```bash
npm run create-user admin@example.com yourpassword ADMIN
```

Replace `admin@example.com` and `yourpassword` with your desired admin credentials.

## Step 6: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser and login with your admin credentials!

---

## Troubleshooting

### Error: "password authentication failed"
- Make sure you're using the correct password
- Password is case-sensitive

### Error: "could not connect to server"
- Make sure PostgreSQL service is running
- Check Windows Services (services.msc) for "postgresql" service
- Start it if it's not running

### Error: "database does not exist"
- Make sure you created the database in Step 2
- Check the database name spelling (should be `btobportal`)

### Error: "relation does not exist"
- Run `npm run db:push` to create the tables

### Can't find psql command
- Add PostgreSQL bin directory to PATH
- Default location: `C:\Program Files\PostgreSQL\15\bin` (version may vary)
- Or use pgAdmin instead

