# NeighborNet Backend

Production-grade backend system for NeighborNet - Distributed Internet Sharing Service API.

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Realtime**: WebSocket + Server-Sent Events (SSE)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Deployment**: Docker + Docker Compose + Nginx

## Features

- User registration and authentication
- Device management with fingerprinting
- Provider availability and discovery
- Provider selection algorithm (bandwidth + battery + trust score)
- Real-time provider updates via WebSocket/SSE
- Speed test integration
- Session tracking and usage logs
- Trust score system
- Rate limiting and security

## Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── database/
│   │   └── prisma.ts
│   ├── middlewares/
│   │   ├── authGuard.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.routes.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.routes.ts
│   │   ├── providers/
│   │   │   ├── providers.controller.ts
│   │   │   ├── providers.service.ts
│   │   │   ├── providers.routes.ts
│   │   │   └── providerSelection.ts
│   │   ├── sessions/
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── sessions.routes.ts
│   │   ├── speedtest/
│   │   │   ├── speedtest.controller.ts
│   │   │   ├── speedtest.service.ts
│   │   │   └── speedtest.routes.ts
│   │   └── realtime/
│   │       ├── ws.gateway.ts
│   │       └── sse.gateway.ts
│   ├── utils/
│   │   ├── crypto.ts
│   │   ├── tokens.ts
│   │   └── responses.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── tests/
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Local Development

1. Clone and install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Setup database:
```bash
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

5. Server runs at `http://localhost:3000`

### Using Docker

```bash
# Build and start all services
npm run docker:up

# Stop services
npm run docker:down

# View logs
docker-compose logs -f neighbornet-backend
```

## API Endpoints

### Authentication

```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user
POST   /auth/refresh      - Refresh access token
POST   /auth/logout       - Logout user
```

### Users

```
GET    /users/profile     - Get user profile
PUT    /users/profile     - Update user profile
GET    /users/devices     - Get user devices
PUT    /users/devices/:deviceId - Update device info
GET    /users/trust-score - Get trust score
```

### Providers

```
GET    /providers/nearby?lat=&lng=&radius=  - Get nearby providers
GET    /providers/best?lat=&lng=&radius=    - Get best provider
POST   /providers/setAvailability           - Set availability
POST   /providers/stopSharing               - Stop sharing
GET    /providers/status                    - Get provider status
GET    /providers/history                   - Get provider history
```

### Sessions

```
POST   /sessions/start    - Start sharing session
POST   /sessions/end      - End sharing session
GET    /sessions/history  - Get session history
GET    /sessions/active   - Get active sessions
GET    /sessions/stats    - Get usage statistics
```

### Speed Tests

```
POST   /speedtest/report       - Report speed test
GET    /speedtest/tests        - Get speed tests
GET    /speedtest/stats        - Get device stats
GET    /speedtest/global-stats - Get global stats
```

### Realtime

```
GET    /realtime/ws   - WebSocket connection
GET    /realtime/sse  - Server-Sent Events
```

## Database Schema

### User
- id (PK)
- phone (unique)
- email (optional, unique)
- passwordHash
- trustScore
- createdAt, updatedAt

### Device
- id (PK)
- userId (FK)
- deviceFingerprint (unique)
- lastSeen
- batteryLevel
- connectionType
- bandwidthEstimate
- latitude, longitude
- createdAt, updatedAt

### ProviderAvailability
- id (PK)
- deviceId (FK, unique)
- isAvailable
- hotspotEnabled
- estimatedSpeed
- maxShareMbps
- updatedAt

### ProviderSession
- id (PK)
- providerDeviceId (FK)
- requesterDeviceId (FK)
- providerUserId (FK)
- requesterUserId (FK)
- startTime
- endTime
- totalBytesShared
- createdAt, updatedAt

### SpeedTest
- id (PK)
- deviceId (FK)
- uploadMbps
- downloadMbps
- latencyMs
- timestamp

## Environment Variables

See `.env.example` for all available variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key (generate with: `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` - Refresh token signing key
- `CORS_ORIGIN` - Allowed CORS origins (default: *)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 10)
- `NEARBY_RADIUS_KM` - Nearby provider search radius (default: 5)

## Scripts

```bash
npm run dev                # Start development server
npm run build             # Build TypeScript
npm start                 # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
npm test                  # Run tests
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
npm run docker:build      # Build Docker image
npm run docker:up         # Start Docker Compose
npm run docker:down       # Stop Docker Compose
```

## Provider Selection Algorithm

The best provider is selected based on a weighted scoring system:

- **Speed (40%)** - Estimated download speed
- **Battery (30%)** - Device battery level
- **Trust Score (20%)** - User trust rating
- **Proximity (10%)** - Distance to requester

Score = (speed_score × 0.4) + (battery_score × 0.3) + (trust_score × 0.2) + (proximity_score × 0.1)

## Security

- HTTPS/TLS encryption (Nginx)
- JWT authentication with refresh tokens
- Rate limiting (100 req/s per IP)
- Bcrypt password hashing
- CORS protection
- Security headers (HSTS, X-Frame-Options, CSP, etc.)
- SQL injection prevention (Prisma)
- Input validation with Zod

## Deployment

### Production Environment

1. Set strong JWT secrets:
```bash
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

2. Update `.env` with production database URL

3. Build and deploy:
```bash
npm run build
npm run docker:build
docker-compose -f docker-compose.yml up -d
```

### Production Checklist

- [ ] Strong JWT secrets configured
- [ ] Database URL pointing to production PostgreSQL
- [ ] CORS_ORIGIN set to specific domain
- [ ] NODE_ENV=production
- [ ] SSL certificates generated for Nginx
- [ ] Database backups configured
- [ ] Monitoring/logging setup
- [ ] Rate limiting tuned
- [ ] Health checks enabled

## Monitoring

Health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Lint: `npm run lint`
6. Submit PR

## License

MIT
