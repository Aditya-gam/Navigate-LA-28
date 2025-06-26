# 🔧 Navigate LA 28 - Troubleshooting Guide

**Guide Version:** 1.0  
**Last Updated:** January 15, 2024  
**Support Contact:** support@navigate-la28.com

---

## 📋 **Table of Contents**

- [Quick Diagnostics](#-quick-diagnostics)
- [Common Issues](#-common-issues)
- [Development Issues](#-development-issues)
- [Production Issues](#-production-issues)
- [Performance Issues](#-performance-issues)
- [Database Issues](#-database-issues)
- [Container Issues](#-container-issues)
- [Getting Help](#-getting-help)

---

## 🩺 **Quick Diagnostics**

### **System Health Check**
Run these commands to quickly assess system status:

```bash
# Check service status
docker-compose ps

# Check system resources
docker stats --no-stream

# Check logs for errors
docker-compose logs --tail=50

# Test API connectivity
curl http://localhost:8000/health

# Check database connectivity
docker-compose exec postgres pg_isready -U la28_user
```

### **Health Check Script**
```bash
#!/bin/bash
# scripts/health-check.sh

echo "🏥 Navigate LA 28 Health Check"
echo "================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    exit 1
fi
echo "✅ Docker installed"

# Check services
if docker-compose ps | grep -q "Exit"; then
    echo "❌ Some services are down"
    docker-compose ps
else
    echo "✅ All services running"
fi

# Check API health
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ API responding"
else
    echo "❌ API not responding"
fi

# Check database
if docker-compose exec -T postgres pg_isready -U la28_user &> /dev/null; then
    echo "✅ Database connected"
else
    echo "❌ Database connection failed"
fi

echo "Health check complete!"
```

---

## 🚨 **Common Issues**

### **Issue 1: Services Won't Start**

#### **Symptoms:**
- `docker-compose up` fails
- Containers exit immediately
- Port binding errors

#### **Solutions:**

**Check Port Conflicts:**
```bash
# Check if ports are already in use
netstat -tulpn | grep :3030  # Frontend
netstat -tulpn | grep :8000  # Backend
netstat -tulpn | grep :5433  # Database

# Kill processes using ports
sudo lsof -ti:3030 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

**Fix Permission Issues:**
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
sudo systemctl restart docker
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER .
```

**Clear Docker State:**
```bash
# Stop all containers
docker-compose down

# Remove volumes (⚠️ This deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### **Issue 2: Database Connection Failed**

#### **Symptoms:**
- "Connection refused" errors
- "Database does not exist" errors
- Authentication failures

#### **Solutions:**

**Check Database Status:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U la28_user -d navigate_la28_db
```

**Reset Database:**
```bash
# Stop services
docker-compose stop server

# Reset database
docker-compose exec postgres psql -U la28_user -c "DROP DATABASE IF EXISTS navigate_la28_db;"
docker-compose exec postgres psql -U la28_user -c "CREATE DATABASE navigate_la28_db;"

# Initialize schema
docker-compose exec server python models/init_db.py

# Restart services
docker-compose start server
```

**Check Environment Variables:**
```bash
# Verify database configuration
docker-compose exec server env | grep DATABASE
```

### **Issue 3: Frontend Not Loading**

#### **Symptoms:**
- Blank page in browser
- "Unable to connect" errors
- JavaScript errors in console

#### **Solutions:**

**Check Frontend Service:**
```bash
# Check if React dev server is running
docker-compose logs client

# Check if build completed successfully
docker-compose exec client npm run build
```

**Clear Browser Cache:**
```bash
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5
# Safari: Cmd+Shift+R

# Or clear cache manually:
# Chrome: Settings > Privacy > Clear browsing data
```

**Check API Connection:**
```bash
# Test API from browser console
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Restart Frontend:**
```bash
docker-compose restart client
```

### **Issue 4: Search Not Working**

#### **Symptoms:**
- No search results returned
- Search errors in console
- Timeout errors

#### **Solutions:**

**Check Elasticsearch/Search Service:**
```bash
# Check if places are indexed
docker-compose exec server python -c "
from server.services.place_service import PlaceService
import asyncio
async def test():
    service = PlaceService()
    count = await service.count_places()
    print(f'Total places: {count}')
asyncio.run(test())
"
```

**Reindex Search Data:**
```bash
# Repopulate places
docker-compose exec server python scripts/populate_places.py

# Verify data exists
docker-compose exec postgres psql -U la28_user -d navigate_la28_db -c "SELECT COUNT(*) FROM places;"
```

**Check API Endpoints:**
```bash
# Test search endpoint directly
curl "http://localhost:8000/places/search?q=restaurant&limit=5"
```

---

## 💻 **Development Issues**

### **Hot Reload Not Working**

#### **Frontend Hot Reload:**
```bash
# Check if React dev server is in development mode
docker-compose exec client env | grep NODE_ENV

# Restart with proper environment
docker-compose stop client
docker-compose up client
```

#### **Backend Hot Reload:**
```bash
# Check if uvicorn is running with --reload
docker-compose exec server ps aux | grep uvicorn

# Restart backend with reload
docker-compose restart server
```

### **Code Changes Not Reflected**

#### **Check Volume Mounts:**
```bash
# Verify volumes are mounted correctly
docker-compose exec client ls -la /app/src
docker-compose exec server ls -la /app/server

# If files are missing, check docker-compose.yml volumes section
```

#### **Clear Node Modules:**
```bash
# Clear frontend dependencies
docker-compose exec client rm -rf node_modules package-lock.json
docker-compose exec client npm install
```

### **Import/Module Errors**

#### **Python Import Issues:**
```bash
# Check PYTHONPATH
docker-compose exec server python -c "import sys; print('\n'.join(sys.path))"

# Install missing packages
docker-compose exec server pip install -r requirements.txt

# Check package versions
docker-compose exec server pip list
```

#### **JavaScript Import Issues:**
```bash
# Check if modules are installed
docker-compose exec client npm list

# Clear node_modules and reinstall
docker-compose exec client rm -rf node_modules
docker-compose exec client npm install
```

---

## 🏭 **Production Issues**

### **SSL Certificate Issues**

#### **Certificate Expired:**
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/navigate-la28.pem -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew --nginx
sudo systemctl reload nginx
```

#### **Certificate Chain Issues:**
```bash
# Test SSL configuration
curl -I https://navigate-la28.com

# Check certificate chain
openssl s_client -connect navigate-la28.com:443 -servername navigate-la28.com
```

### **Memory/Resource Issues**

#### **Out of Memory:**
```bash
# Check memory usage
free -h
docker stats --no-stream

# Identify memory-hungry containers
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Restart high-memory containers
docker-compose restart server
```

#### **Disk Space Issues:**
```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a
docker volume prune

# Clean logs
sudo truncate -s 0 /var/log/syslog
```

### **High Load Issues**

#### **CPU Bottlenecks:**
```bash
# Check CPU usage
top
htop

# Check per-process CPU usage
docker exec server top

# Scale services if using Docker Swarm
docker service scale navigate-la28_server=3
```

#### **Database Performance:**
```bash
# Check active connections
docker-compose exec postgres psql -U la28_user -d navigate_la28_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker-compose exec postgres psql -U la28_user -d navigate_la28_db -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## 📊 **Performance Issues**

### **Slow API Responses**

#### **Identify Bottlenecks:**
```bash
# Enable request logging
docker-compose exec server python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
"

# Monitor database queries
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

#### **Database Query Optimization:**
```sql
-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'places' 
ORDER BY n_distinct DESC;

-- Add spatial index if missing
CREATE INDEX IF NOT EXISTS idx_places_location 
ON places USING GIST (ST_Point(longitude, latitude));

-- Analyze table statistics
ANALYZE places;
```

### **Slow Frontend Loading**

#### **Bundle Size Analysis:**
```bash
# Analyze bundle size
docker-compose exec client npm run build
docker-compose exec client npm run analyze

# Check for large dependencies
docker-compose exec client npm ls --depth=0 | grep MB
```

#### **Performance Optimization:**
```javascript
// Enable React production mode
// Check if NODE_ENV is set to 'production'
console.log('Environment:', process.env.NODE_ENV);

// Lazy load components
const MapComponent = React.lazy(() => import('./MapComponent'));

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

---

## 🗄️ **Database Issues**

### **Connection Pool Exhaustion**

#### **Symptoms:**
- "Connection pool exhausted" errors
- Slow database queries
- Connection timeout errors

#### **Solutions:**
```python
# Increase connection pool size
# In database.py
DATABASE_URL = "postgresql+asyncpg://user:pass@host:port/db"
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,        # Increase from default 5
    max_overflow=30,     # Increase from default 10
    pool_pre_ping=True,  # Validate connections
    pool_recycle=3600    # Recycle connections every hour
)
```

### **Database Migration Issues**

#### **Migration Conflicts:**
```bash
# Check migration status
docker-compose exec server python -c "
from alembic import command
from alembic.config import Config
config = Config('alembic.ini')
command.current(config)
"

# Reset migrations (⚠️ Development only)
docker-compose exec server python -c "
from alembic import command
from alembic.config import Config
config = Config('alembic.ini')
command.downgrade(config, 'base')
command.upgrade(config, 'head')
"
```

### **PostGIS Extension Issues**

#### **Extension Not Available:**
```sql
-- Check if PostGIS is installed
SELECT * FROM pg_available_extensions WHERE name = 'postgis';

-- Install PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_Version();
```

---

## 🐳 **Container Issues**

### **Container Build Failures**

#### **Docker Build Context Issues:**
```bash
# Check .dockerignore file
cat .dockerignore

# Build with no cache
docker-compose build --no-cache

# Build specific service
docker-compose build server
```

#### **Layer Caching Issues:**
```dockerfile
# Optimize Dockerfile layer caching
# Copy requirements first, then install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code last
COPY . .
```

### **Container Networking Issues**

#### **Service Discovery Problems:**
```bash
# Check container networks
docker network ls
docker network inspect navigate-la-28_default

# Test inter-container connectivity
docker-compose exec server ping postgres
docker-compose exec server nslookup postgres
```

#### **Port Binding Issues:**
```bash
# Check port mappings
docker-compose ps

# Test port accessibility
telnet localhost 8000
nc -zv localhost 8000
```

---

## 📞 **Getting Help**

### **Before Contacting Support**

#### **Gather Information:**
```bash
# System information
uname -a
docker --version
docker-compose --version

# Service status
docker-compose ps

# Recent logs
docker-compose logs --tail=100 > logs.txt

# Configuration
docker-compose config
```

#### **Error Reproduction:**
1. **Document steps** to reproduce the issue
2. **Include error messages** (exact text)
3. **Note environment** (development/production)
4. **Include relevant logs**

### **Support Channels**

#### **Community Support:**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and help
- **Discord**: Real-time community support
- **Stack Overflow**: Tag questions with `navigate-la28`

#### **Professional Support:**
- **Email**: support@navigate-la28.com
- **Priority Support**: premium-support@navigate-la28.com
- **Emergency**: emergency@navigate-la28.com (production issues)

### **Support Information Template**
```markdown
## Issue Description
Brief description of the problem

## Environment
- OS: [Windows/macOS/Linux]
- Docker Version: [output of `docker --version`]
- Browser: [if frontend issue]

## Steps to Reproduce
1. Step one
2. Step two
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Messages
```
Paste error messages here
```

## Additional Context
Any other relevant information
```

### **Escalation Path**
1. **Community forums** (GitHub, Discord)
2. **Email support** (24-48 hour response)
3. **Priority support** (4-hour response, paid)
4. **Emergency support** (1-hour response, critical issues)

---

## 🔧 **Troubleshooting Tools**

### **Useful Commands**
```bash
# System monitoring
htop                              # Process monitor
iotop                            # I/O monitor
nethogs                          # Network monitor
ncdu                             # Disk usage analyzer

# Docker debugging
docker-compose logs -f service   # Follow logs
docker exec -it container bash  # Container shell
docker inspect container        # Container details
docker system df                # Docker disk usage

# Network debugging
ss -tulpn                       # Network connections
curl -v URL                     # HTTP debugging
dig domain.com                  # DNS lookup
traceroute domain.com           # Network path

# Database debugging
pg_top                          # PostgreSQL monitor
pg_stat_activity               # Active connections
EXPLAIN ANALYZE query          # Query performance
```

### **Monitoring Scripts**
```bash
#!/bin/bash
# scripts/monitor-system.sh

while true; do
    echo "=== $(date) ==="
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
    echo "Memory: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    echo "Disk: $(df -h / | awk 'NR==2{printf "%s", $5}')"
    echo "Load: $(uptime | awk -F'load average:' '{ print $2 }')"
    echo "Active containers: $(docker ps -q | wc -l)"
    echo ""
    sleep 60
done
```

---

*This troubleshooting guide is continuously updated based on common issues and user feedback. For additional help, contact our support team.* 