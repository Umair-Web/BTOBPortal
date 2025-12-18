# PostgreSQL Database Setup Script for B2B Portal
# This script helps you set up the database for your project

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup for B2B Portal" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get database connection details
Write-Host "Step 1: Database Connection Details" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please provide the following information:" -ForegroundColor White
Write-Host ""

$dbUser = Read-Host "PostgreSQL Username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "PostgreSQL Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbHost = Read-Host "Database Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) {
    $dbHost = "localhost"
}

$dbPort = Read-Host "Database Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) {
    $dbPort = "5432"
}

$dbName = "btobportal"

Write-Host ""
Write-Host "Step 2: Creating database '$dbName'..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host ""

# Create database using psql
$env:PGPASSWORD = $dbPasswordPlain
$createDbCommand = "CREATE DATABASE $dbName;"
$checkDbCommand = "SELECT 1 FROM pg_database WHERE datname = '$dbName';"

try {
    # Check if database exists
    $dbExists = & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -tAc $checkDbCommand 2>&1
    
    if ($dbExists -match "1") {
        Write-Host "Database '$dbName' already exists." -ForegroundColor Green
        $createNew = Read-Host "Do you want to recreate it? (y/N)"
        if ($createNew -eq "y" -or $createNew -eq "Y") {
            Write-Host "Dropping existing database..." -ForegroundColor Yellow
            & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c "DROP DATABASE $dbName;" 2>&1 | Out-Null
            Write-Host "Creating new database..." -ForegroundColor Yellow
            & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c $createDbCommand 2>&1 | Out-Null
            Write-Host "Database '$dbName' created successfully!" -ForegroundColor Green
        }
    } else {
        Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow
        $result = & psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c $createDbCommand 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database '$dbName' created successfully!" -ForegroundColor Green
        } else {
            Write-Host "Error creating database: $result" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Error: Could not connect to PostgreSQL." -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and credentials are correct." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can also create the database manually:" -ForegroundColor Yellow
    Write-Host "1. Open 'SQL Shell (psql)' from Start Menu" -ForegroundColor White
    Write-Host "2. Press Enter 4 times to accept defaults" -ForegroundColor White
    Write-Host "3. Enter your password" -ForegroundColor White
    Write-Host "4. Run: CREATE DATABASE btobportal;" -ForegroundColor White
    Write-Host "5. Run: \q to exit" -ForegroundColor White
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "Step 3: Generating connection string..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host ""

# Build connection string
$connectionString = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}?schema=public"

Write-Host "Your DATABASE_URL:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White
Write-Host ""

# Update .env file
Write-Host "Step 4: Updating .env file..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host ""

if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match 'DATABASE_URL=') {
        $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$connectionString`""
        Set-Content .env $envContent
        Write-Host ".env file updated successfully!" -ForegroundColor Green
    } else {
        Add-Content .env "`nDATABASE_URL=`"$connectionString`""
        Write-Host "DATABASE_URL added to .env file!" -ForegroundColor Green
    }
} else {
    $envTemplate = @"
# Database
DATABASE_URL="$connectionString"

# NextAuth
AUTH_SECRET="change-this-to-a-random-secret-key-in-production"
AUTH_URL="http://localhost:3000"
"@
    Set-Content .env $envTemplate
    Write-Host ".env file created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! Next Steps:" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Generate Prisma Client:" -ForegroundColor White
Write-Host "   npm run db:generate" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Push database schema:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Create an admin user:" -ForegroundColor White
Write-Host "   npm run create-user admin@example.com password123 ADMIN" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""

