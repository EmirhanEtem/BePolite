# NeighborNet Backend - Deployment Guide

## Pre-deployment Checklist

### Security
- [ ] Generate new JWT secrets: `bash generate-secrets.sh`
- [ ] Strong PostgreSQL password (min 16 chars, mixed case, numbers, symbols)
- [ ] SSL certificates configured for Nginx
- [ ] CORS origin set to production domain
- [ ] Database backups configured
- [ ] Rate limiting tuned for production
- [ ] Security headers enabled in Nginx

### Infrastructure
- [ ] PostgreSQL 12+ installed and running
- [ ] Redis 6+ (optional, for sessions)
- [ ] Docker & Docker Compose installed
- [ ] Nginx configured
- [ ] Domain DNS configured
- [ ] SSL certificates (Let's Encrypt recommended)

### Database
- [ ] Database created
- [ ] Database user created with limited permissions
- [ ] Backups scheduled
- [ ] Connection pooling configured (if using)

## Local Development Setup

### 1. Clone and Install
```bash
git clone <repo>
cd neighbornet-backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with local settings
```

### 3. Database Setup
```bash
# Make sure PostgreSQL is running
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 5. Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f neighbornet-backend

# Stop services
docker-compose down
```

## Production Deployment

### Option 1: Docker Compose

#### 1. Prepare Environment
```bash
cp .env.prod.example .env.prod
# Edit .env.prod with production values
bash generate-secrets.sh
```

#### 2. Build and Deploy
```bash
# Build production image
npm run docker:build

# Deploy using production compose file
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health endpoint
curl https://yourdomain.com/health
```

### Option 2: Manual Deployment (Linux/Ubuntu)

#### 1. Install Dependencies
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx
```

#### 2. Create Application User
```bash
sudo useradd -m -s /bin/bash neighbornet
sudo -u neighbornet mkdir -p /app/neighbornet-backend
```

#### 3. Clone and Configure
```bash
cd /app/neighbornet-backend
sudo -u neighbornet git clone <repo> .
sudo -u neighbornet npm ci --only=production
cp .env.prod.example .env.prod
# Edit .env.prod
```

#### 4. Build TypeScript
```bash
sudo -u neighbornet npm run build
sudo -u neighbornet npm run prisma:migrate
```

#### 5. Create Systemd Service
Create `/etc/systemd/system/neighbornet.service`:
```ini
[Unit]
Description=NeighborNet Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=neighbornet
WorkingDirectory=/app/neighbornet-backend
Environment="NODE_ENV=production"
Environment="PATH=/app/neighbornet-backend/node_modules/.bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable neighbornet
sudo systemctl start neighbornet
sudo systemctl status neighbornet
```

#### 6. Configure Nginx
Copy `nginx.conf` to `/etc/nginx/sites-available/neighbornet`
```bash
sudo ln -s /etc/nginx/sites-available/neighbornet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
heroku create neighbornet-backend
heroku addons:create heroku-postgresql:standard-0
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
# Set other environment variables
git push heroku main
```

#### AWS ECS
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t neighbornet-backend .
docker tag neighbornet-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/neighbornet-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/neighbornet-backend:latest

# Create ECS task definition and service
```

#### DigitalOcean App Platform
```bash
# Create app.yaml
doctl apps create --spec app.yaml

# Or push from GitHub with auto-deployment
```

## Post-Deployment

### 1. Verify Services
```bash
# Health check
curl https://yourdomain.com/health

# Test auth endpoint
curl -X POST https://yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"test","deviceFingerprint":"abc123"}'
```

### 2. Set Up Monitoring
- Enable logging (ELK, Datadog, etc.)
- Set up error tracking (Sentry, Rollbar)
- Configure uptime monitoring
- Set up alerts for errors and downtime

### 3. Database Backup
```bash
# Manual backup
pg_dump neighbornet > backup.sql

# Automated backups (cron)
0 2 * * * pg_dump neighbornet | gzip > /backups/neighbornet_$(date +\%Y\%m\%d).sql.gz
```

### 4. Security Hardening
- [ ] Enable HTTPS only (HTTP → HTTPS redirect)
- [ ] Set security headers in Nginx
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Configure WAF rules
- [ ] Enable database encryption

### 5. Performance Optimization
```bash
# Monitor slow queries
pg_stat_statements

# Configure connection pooling (pgBouncer)
# Implement caching (Redis)
# Use CDN for static assets
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly: `npm update`
- [ ] Check security vulnerabilities: `npm audit`
- [ ] Monitor disk space and memory
- [ ] Review logs for errors
- [ ] Test backups regularly

### Database Maintenance
```bash
# Vacuum and analyze
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Update Process
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run prisma:migrate

# Build
npm run build

# Restart service
sudo systemctl restart neighbornet
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
sudo journalctl -u neighbornet -n 50

# Check database connection
psql postgresql://user:pass@host/neighbornet

# Check port availability
sudo netstat -tlnp | grep 3000
```

### High Memory Usage
```bash
# Monitor process
top -p $(pgrep -f "node dist/server.js")

# Check for memory leaks in logs
```

### Slow Queries
```bash
# Check slow query log
tail -f /var/log/postgresql/postgresql.log | grep "duration:"

# Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

### Database Connection Errors
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check open connections
SELECT count(*) FROM pg_stat_activity;
```

## Rollback Procedure
```bash
# If deployment fails
git revert HEAD
npm run build
npm run prisma:migrate
sudo systemctl restart neighbornet
```

## Support
For issues, check:
1. Application logs: `docker-compose logs neighbornet-backend`
2. Database logs: `sudo tail -f /var/log/postgresql/postgresql.log`
3. Nginx logs: `sudo tail -f /var/log/nginx/access.log`
4. Error tracking service (Sentry, etc.)
