# How to Update .env File

## After creating the database, update your .env file:

1. **Open the `.env` file** in your project folder (`D:\EviarWork\BTOBPortal\.env`)

2. **Update the DATABASE_URL** with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/btobportal?schema=public"
```

**Replace `YOUR_PASSWORD` with the password you set when installing PostgreSQL.**

### Default values:
- Username: `postgres` (this is the default)
- Host: `localhost`
- Port: `5432`
- Database: `btobportal`
- Password: **The one you set during PostgreSQL installation**

3. **Also add these if they're missing:**

```env
# NextAuth
AUTH_SECRET="your-random-secret-here"
AUTH_URL="http://localhost:3000"
```

### To generate AUTH_SECRET, run this command:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then copy the output and paste it as your AUTH_SECRET value.

## Example .env file (after updating):

```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/btobportal?schema=public"

AUTH_SECRET="aB3xY9zK2mN8pQ5rT7vW1uY4zA6bC9dE0fG3hI6jK8lM2nO5pQ7rS0tU3vW5x="
AUTH_URL="http://localhost:3000"
```

⚠️ **Important**: Never commit your .env file to git! It's already in .gitignore.

