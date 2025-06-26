# 🚀 Navigate LA 28 - Deployment Guide

**Guide Version:** 1.0  
**Last Updated:** January 15, 2024  
**Supported Platforms:** Docker, Kubernetes, Cloud Providers

---

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Development Deployment](#-development-deployment)
- [Staging Deployment](#-staging-deployment)
- [Production Deployment](#-production-deployment)
- [Environment Configuration](#-environment-configuration)
- [Security Configuration](#-security-configuration)
- [Monitoring & Logging](#-monitoring--logging)
- [Backup & Recovery](#-backup--recovery)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 **Overview**

This guide provides comprehensive instructions for deploying the Navigate LA 28 platform across different environments. The application uses a containerized microservices architecture with Docker and Docker Compose for orchestration.

### **Deployment Environments**

| Environment | Purpose | Infrastructure | Access |
|-------------|---------|----------------|--------|
| **Development** | Local development | Docker Desktop | localhost |
| **Staging** | Testing & QA | Cloud instance | staging.navigate-la28.com |
| **Production** | Live application | Multi-node cluster | navigate-la28.com |

---

## 🔧 **Prerequisites**

### **System Requirements**

#### **Minimum Hardware Requirements**
| Component | Development | Staging | Production |
|-----------|-------------|---------|------------|
| **CPU** | 4 cores | 8 cores | 16+ cores |
| **RAM** | 8 GB | 16 GB | 32+ GB |
| **Storage** | 50 GB SSD | 200 GB SSD | 1 TB+ SSD |
| **Network** | 10 Mbps | 100 Mbps | 1 Gbps+ |

#### **Software Dependencies**
```bash
# Required software versions
Docker Engine: 20.10+
Docker Compose: 2.0+
Node.js: 18.x+
Python: 3.10+
Git: 2.30+
```

### **Installation Verification**
```bash
# Verify all prerequisites
docker --version          # Docker version 20.10.x
docker-compose --version  # Docker Compose version 2.x.x
node --version            # v18.x.x
python3 --version         # Python 3.10.x
git --version             # git version 2.x.x

# Check system resources
docker system info        # Docker system information
docker stats              # Current container stats
```

---

## 💻 **Development Deployment**

### **Quick Start Development Setup**

#### **1. Repository Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/Navigate-LA-28.git
cd Navigate-LA-28

# Verify directory structure
ls -la
```

#### **2. Environment Configuration**
```bash
# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit environment files with your local settings
nano server/.env
nano client/.env
```

#### **3. Docker Development Setup**
```bash
# Build and start all services
docker-compose up -d --build

# Verify all services are running
docker-compose ps

# View service logs
docker-compose logs -f
```

#### **4. Database Initialization**
```bash
# Initialize database schema
docker-compose exec server python models/init_db.py

# Populate with sample data
docker-compose exec server python scripts/populate_places.py
docker-compose exec server python scripts/populate_bus_stops.py
docker-compose exec server python scripts/populate_users.py

# Verify database setup
docker-compose exec postgres psql -U la28_user -d navigate_la28_db -c "SELECT COUNT(*) FROM places;"
```

#### **5. Development Access**
| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3030 | N/A |
| Backend API | http://localhost:8000 | N/A |
| API Docs | http://localhost:8000/docs | N/A |
| Database | localhost:5433 | la28_user / bigdata_la28 |
| Hadoop UI | http://localhost:9870 | N/A |
| Spark UI | http://localhost:8080 | N/A |

### **Development Workflow**

#### **Hot Reload Development**
```bash
# Frontend development with hot reload
cd client
npm install
npm start

# Backend development with auto-reload
cd server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### **Development Testing**
```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
pytest --cov=.

# Integration tests
docker-compose exec server pytest tests/integration/
```

---

## 🧪 **Staging Deployment**

### **Staging Environment Setup**

#### **1. Server Preparation**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **2. Application Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/Navigate-LA-28.git
cd Navigate-LA-28

# Checkout staging branch
git checkout staging

# Create staging environment configuration
cp server/.env.staging server/.env
cp client/.env.staging client/.env

# Deploy staging environment
docker-compose -f docker-compose.staging.yml up -d --build
```

#### **3. SSL Certificate Setup**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot certonly --nginx -d staging.navigate-la28.com

# Configure auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Staging Configuration**

#### **Environment Variables**
```bash
# server/.env
DATABASE_URL=postgresql+asyncpg://staging_user:secure_password@localhost:5432/navigate_la28_staging
SECRET_KEY=staging-secret-key-change-in-production
ENVIRONMENT=staging
CORS_ORIGINS=https://staging.navigate-la28.com
DEBUG=False
LOG_LEVEL=INFO

# client/.env
REACT_APP_API_URL=https://api-staging.navigate-la28.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_SENTRY_DSN=your-staging-sentry-dsn
```

---

## 🌐 **Production Deployment**

### **Production Infrastructure**

#### **1. Multi-Node Setup**
```bash
# Production cluster architecture
Load Balancer (NGINX)
├── Application Nodes (3x)
│   ├── Frontend Container
│   ├── Backend Container
│   └── Redis Container
├── Database Cluster (3x)
│   ├── Primary PostgreSQL
│   └── Read Replicas (2x)
└── Big Data Cluster (3x)
    ├── Hadoop NameNode
    ├── Hadoop DataNodes
    └── Spark Cluster
```

#### **2. Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  server:
    build:
      context: ./server
      dockerfile: Dockerfile.prod
    environment:
      - ENVIRONMENT=production
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
    
  postgres:
    image: postgis/postgis:13-3.1
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  nginx:
    build: ./nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_prod_data:
```

#### **3. Production Deployment Script**
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Pull latest code
git pull origin main

# Build and deploy with zero downtime
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d --no-deps --scale server=3

# Run database migrations
docker-compose -f docker-compose.prod.yml exec server python models/migrate.py

# Health check
./scripts/health-check.sh

# Update monitoring
./scripts/update-monitoring.sh

echo "✅ Production deployment completed successfully!"
```

### **Production Security**

#### **1. Firewall Configuration**
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw deny 5432/tcp    # Block direct database access
sudo ufw deny 6379/tcp    # Block direct Redis access
```

#### **2. SSL/TLS Configuration**
```nginx
# /etc/nginx/sites-enabled/navigate-la28.com
server {
    listen 443 ssl http2;
    server_name navigate-la28.com www.navigate-la28.com;
    
    ssl_certificate /etc/letsencrypt/live/navigate-la28.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/navigate-la28.com/privkey.pem;
    
    # SSL Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://client:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://server:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ⚙️ **Environment Configuration**

### **Environment File Templates**

#### **Production Backend Environment**
```bash
# server/.env.production
# Database Configuration
DATABASE_URL=postgresql+asyncpg://prod_user:${DB_PASSWORD}@db-cluster:5432/navigate_la28_prod
TEST_DATABASE_URL=postgresql+asyncpg://test_user:${TEST_DB_PASSWORD}@test-db:5432/navigate_la28_test

# Security Configuration
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENVIRONMENT=production
DEBUG=False

# API Configuration
CORS_ORIGINS=https://navigate-la28.com,https://www.navigate-la28.com
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60

# External Services
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
SENTRY_DSN=${SENTRY_DSN}

# Big Data Configuration
SPARK_MASTER_URL=spark://spark-master:7077
HADOOP_NAMENODE_URL=hdfs://hadoop:9000

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=json
```

#### **Production Frontend Environment**
```bash
# client/.env.production
# API Configuration
REACT_APP_API_URL=https://api.navigate-la28.com
REACT_APP_WS_URL=wss://api.navigate-la28.com/ws

# Environment
REACT_APP_ENVIRONMENT=production
NODE_ENV=production

# Analytics & Monitoring
REACT_APP_SENTRY_DSN=${FRONTEND_SENTRY_DSN}
REACT_APP_GOOGLE_ANALYTICS_ID=${GA_TRACKING_ID}

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_TRANSIT=true

# Maps Configuration
REACT_APP_MAPBOX_TOKEN=${MAPBOX_TOKEN}
```

### **Secret Management**

#### **Using Environment Variables**
```bash
# Create secrets file (never commit to version control)
# secrets.env
DB_PASSWORD=super-secure-database-password
TEST_DB_PASSWORD=test-database-password
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=jwt-signing-key-here
REDIS_PASSWORD=redis-password-here
SENTRY_DSN=https://your-sentry-dsn
MAPBOX_TOKEN=your-mapbox-token
```

#### **Docker Secrets (Production)**
```bash
# Create Docker secrets
echo "super-secure-password" | docker secret create db_password -
echo "jwt-secret-key" | docker secret create jwt_secret -

# Use in docker-compose.prod.yml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

---

## 🔐 **Security Configuration**

### **Application Security**

#### **1. Database Security**
```sql
-- Create production database user with limited permissions
CREATE USER prod_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE navigate_la28_prod TO prod_user;
GRANT USAGE ON SCHEMA public TO prod_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO prod_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO prod_user;

-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_policy ON users FOR ALL TO prod_user USING (user_id = current_user_id());
```

#### **2. Redis Security**
```bash
# redis.conf security settings
requirepass your-secure-redis-password
bind 127.0.0.1 ::1
protected-mode yes
port 0
unixsocket /var/run/redis/redis-server.sock
unixsocketperm 700
```

### **Network Security**

#### **1. Container Network Isolation**
```yaml
# docker-compose.prod.yml
networks:
  frontend:
    driver: bridge
    internal: false
  backend:
    driver: bridge
    internal: true
  database:
    driver: bridge
    internal: true

services:
  nginx:
    networks:
      - frontend
  client:
    networks:
      - frontend
      - backend
  server:
    networks:
      - backend
      - database
  postgres:
    networks:
      - database
```

---

## 📊 **Monitoring & Logging**

### **Application Monitoring**

#### **1. Health Check Endpoints**
```python
# server/routes/health.py
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": await check_database_health(),
            "redis": await check_redis_health(),
            "external_apis": await check_external_services()
        }
    }
```

#### **2. Prometheus Metrics**
```python
# server/monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_USERS = Gauge('active_users_total', 'Number of active users')
```

### **Logging Configuration**

#### **1. Structured Logging**
```python
# server/config/logging.py
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "json",
            "filename": "/var/log/navigate-la28/app.log",
            "maxBytes": 10485760,
            "backupCount": 10
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"]
    }
}
```

#### **2. Log Aggregation**
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
      
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 💾 **Backup & Recovery**

### **Database Backup Strategy**

#### **1. Automated Backups**
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="navigate_la28_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform database backup
docker-compose exec postgres pg_dump -U prod_user -d $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: backup_$DATE.sql.gz"
```

#### **2. Backup Verification**
```bash
#!/bin/bash
# scripts/verify-backup.sh

LATEST_BACKUP=$(ls -t /backups/postgres/backup_*.sql.gz | head -1)

# Test restore on test database
gunzip -c $LATEST_BACKUP | docker-compose exec -T postgres_test psql -U test_user -d navigate_la28_test

echo "Backup verification completed for: $LATEST_BACKUP"
```

### **Disaster Recovery Plan**

#### **Recovery Procedures**
1. **Service Failure**: Automatic container restart via Docker
2. **Database Corruption**: Restore from latest verified backup
3. **Complete System Failure**: Rebuild from infrastructure as code
4. **Data Center Failure**: Failover to secondary region (if configured)

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Container Issues**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service_name]

# Restart specific service
docker-compose restart [service_name]

# Rebuild and restart
docker-compose up -d --build [service_name]
```

#### **Database Connection Issues**
```bash
# Check database connectivity
docker-compose exec server python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('postgresql://user:pass@postgres:5432/db')
    print('Database connection successful')
    await conn.close()
asyncio.run(test())
"

# Check database logs
docker-compose logs postgres
```

#### **Performance Issues**
```bash
# Monitor resource usage
docker stats

# Check system resources
htop
df -h
free -h

# Database performance
docker-compose exec postgres psql -U prod_user -d navigate_la28_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"
```

### **Emergency Procedures**

#### **System Recovery**
```bash
# Emergency service restart
docker-compose down
docker-compose up -d

# Database emergency recovery
docker-compose exec postgres pg_ctl restart

# Clear all containers and restart
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📞 **Support & Maintenance**

### **Deployment Checklist**

#### **Pre-Deployment**
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Backup verification completed
- [ ] Monitoring alerts configured

#### **Post-Deployment**
- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] Error rates within acceptable limits
- [ ] User acceptance testing completed
- [ ] Monitoring dashboards updated

### **Maintenance Schedule**

| Task | Frequency | Responsibility |
|------|-----------|----------------|
| Security updates | Weekly | DevOps Team |
| Database backups | Daily | Automated |
| Performance review | Weekly | Engineering Team |
| Capacity planning | Monthly | Architecture Team |
| Disaster recovery test | Quarterly | Operations Team |

---

*For deployment support, contact the DevOps team or refer to the troubleshooting section above.* 