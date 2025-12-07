#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}NeighborNet Database Setup Script${NC}"
echo "======================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your database credentials${NC}"
    exit 0
fi

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}DATABASE_URL not set in .env${NC}"
    exit 1
fi

# Extract database info from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL_REGEX='postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$'
if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo -e "${RED}Invalid DATABASE_URL format${NC}"
    exit 1
fi

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}Cannot connect to PostgreSQL${NC}"
    echo "Ensure PostgreSQL is running on $DB_HOST:$DB_PORT"
    exit 1
fi

echo -e "${GREEN}✓ Connected to PostgreSQL${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}Creating database if not exists...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || true

echo -e "${GREEN}✓ Database created or already exists${NC}"

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
npx prisma migrate deploy

echo -e "${GREEN}✓ Migrations applied${NC}"

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}✓ Prisma client generated${NC}"

# Seed database (optional)
if [ -f scripts/seed.ts ]; then
    read -p "Run database seeding? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Running seed script...${NC}"
        npx ts-node scripts/seed.ts
        echo -e "${GREEN}✓ Database seeded${NC}"
    fi
fi

echo ""
echo -e "${GREEN}======================================"
echo "Database setup completed successfully!"
echo "=====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. API will be available at http://localhost:3000"
echo "3. Documentation: http://localhost:3000/api-docs"
