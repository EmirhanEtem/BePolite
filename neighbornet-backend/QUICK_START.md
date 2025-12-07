# NeighborNet Backend - Quick Start Guide

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v12 or higher (or use Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

This will install all 295 required packages including:
- Fastify framework
- Prisma ORM
- TypeScript compiler
- Testing framework (Vitest)
- And all other dependencies

**Expected output**: `added 295 packages`

### Step 2: Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/neighbornet"

# JWT
JWT_SECRET=your_random_secret_key_min_32_chars
JWT_REFRESH_SECRET=another_random_secret_key_min_32_chars

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=900000
```

### Step 3: Setup Database (Choose One Option)

#### Option A: Using Docker Compose (Recommended)

```bash
npm run docker:up
```

This starts:
- PostgreSQL 15 database
- Redis 7 cache
- Nginx reverse proxy
- Backend application (automatically)

Database will be ready in ~10 seconds.

#### Option B: Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE neighbornet;"

# Run migrations
npm run prisma:migrate
```

#### Option C: Generate Prisma Client Only

```bash
npm run prisma:generate
```

### Step 4: Run Development Server

```bash
npm run dev
```

Expected output:
```
[Fastify] Server running at http://localhost:3000
[Fastify] Database connected successfully
```

Visit `http://localhost:3000/health` - should return:
```json
{
  "status": "ok",
  "timestamp": "2024-11-29T15:00:00.000Z"
}
```

## Common Commands

### Development
```bash
npm run dev              # Start dev server with ts-node
npm run build            # Compile TypeScript to JavaScript
npm run start            # Run compiled JavaScript
```

### Database
```bash
npm run prisma:migrate  # Create new migration
npm run prisma:studio   # Open Prisma Studio GUI
npm run prisma:generate # Generate Prisma Client
```

### Testing & Quality
```bash
npm run test            # Run all tests
npm run test:ui         # Run tests with UI
npm run lint            # Check code style
npm run format          # Auto-format code
```

### Docker
```bash
npm run docker:build    # Build Docker image
npm run docker:up       # Start Docker Compose
npm run docker:down     # Stop Docker Compose
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "securePassword123",
    "email": "user@example.com",
    "deviceFingerprint": "device-unique-id-32-chars-minimum",
    "batteryLevel": 85,
    "connectionType": "4G"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123...",
      "phone": "1234567890",
      "email": "user@example.com",
      "trustScore": 100
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "timestamp": "2024-11-29T15:00:00.000Z"
}
```

### 2. Get User Profile (Requires Token)

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer {accessToken}"
```

### 3. Find Nearby Providers (Public)

```bash
curl -X GET "http://localhost:3000/providers/nearby?latitude=40.7128&longitude=-74.0060&radiusKm=5"
```

### 4. Report Speed Test

```bash
curl -X POST http://localhost:3000/speedtest/report \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "uploadMbps": 50.5,
    "downloadMbps": 100.25,
    "latencyMs": 25
  }'
```

### 5. WebSocket Connection

```bash
# In browser console or via wscat:
wscat -c ws://localhost:3000/ws

# After connecting, message:
{
  "event": "subscribe",
  "userId": "{userId}"
}
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed

Check `.env` DATABASE_URL:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### Prisma Client Not Found

```bash
npm run prisma:generate
npm run build
```

### TypeScript Errors During Build

```bash
# Clear cache and rebuild
rm -rf dist/ node_modules/.prisma
npm run build
```

### Docker Issues

```bash
# View logs
npm run docker:down
npm run docker:up

# Check status
docker-compose ps
```

## Project Structure

```
src/
├── config/           # Configuration (env, logger)
├── database/         # Prisma client
├── middlewares/      # Auth guard, error handler, rate limiter
├── modules/          # 6 API modules (auth, users, providers, sessions, speedtest, realtime)
├── types/            # TypeScript type definitions
├── utils/            # Utilities (crypto, tokens, responses)
├── app.ts            # Fastify application factory
└── server.ts         # Server startup

prisma/
└── schema.prisma     # Database schema with 6 models

tests/               # Test suites (auth, providers, crypto, integration)

Docker files:
├── Dockerfile       # Production multi-stage build
├── Dockerfile.dev   # Development with ts-node
├── docker-compose.yml       # Dev environment
└── docker-compose.prod.yml  # Production environment
```

## Key Features

✅ **Authentication**: JWT with access + refresh tokens  
✅ **Real-time**: WebSocket + Server-Sent Events  
✅ **Provider Discovery**: Haversine distance + weighted scoring  
✅ **Rate Limiting**: 100 requests per 15 minutes  
✅ **Security**: Helmet, CORS, Bcrypt, Input validation  
✅ **Database**: PostgreSQL with Prisma ORM, 6 models  
✅ **Deployment**: Docker, Docker Compose, Kubernetes, Helm  

## Documentation

- **README.md** - Project overview and setup
- **API_DOCS.md** - Complete API reference with examples
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_VALIDATION.md** - Comprehensive validation report
- **ERROR_FIXES_SUMMARY.md** - History of all fixes applied

## Next Steps

1. ✅ Run `npm install --legacy-peer-deps`
2. ✅ Configure `.env` file
3. ✅ Run `npm run docker:up` or setup local database
4. ✅ Run `npm run dev`
5. ✅ Test endpoints from examples above
6. ✅ Read API_DOCS.md for full API reference
7. ✅ Review DEPLOYMENT.md for production setup

## Support

- **GitHub Repository**: [Your repo URL]
- **Issues**: [Your issues URL]
- **Documentation**: See README.md, API_DOCS.md, DEPLOYMENT.md

---

**Status**: ✅ Production-Ready  
**Last Updated**: November 29, 2024  
**Version**: 1.0.0
