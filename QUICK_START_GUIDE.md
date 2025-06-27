# 🚀 Navigate LA 28 - Quick Start Guide

## How to Run This Application

### Local Development (Easiest Way)

1. **Prerequisites**
   - Docker Desktop installed and running
   - 8GB+ RAM available

2. **Start the Application**
   ```bash
   git clone <your-repo-url>
   cd Navigate-LA-28
   docker-compose up -d --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3030
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Check Status**
   ```bash
   docker-compose ps
   curl http://localhost:8000/health
   ```

### Production Deployment

1. **Server Setup**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Clone and configure
   git clone <your-repo-url>
   cd Navigate-LA-28
   cp server/.env.production server/.env
   cp client/.env.production client/.env
   ```

2. **Update Production Settings**
   Edit `server/.env` and `client/.env` with your domain and secrets:
   ```bash
   DATABASE_URL=postgresql+asyncpg://la28_user:YOUR_PASSWORD@postgres:5432/navigate_la28_db
   SECRET_KEY=your-super-secure-secret-key
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## What This Application Does

Navigate LA 28 is a comprehensive geospatial platform for the 2028 LA Olympics featuring:

- **Interactive Maps**: Real-time navigation with Leaflet
- **Transit Integration**: Bus routes and real-time tracking  
- **Venue Information**: Olympic venues and event details
- **Analytics Dashboard**: Visitor flow and crowd analytics
- **Big Data Processing**: Hadoop + Spark for large datasets

## Architecture

- **Frontend**: React 18 + Redux (Port 3030)
- **Backend**: FastAPI + Python (Port 8000)
- **Database**: PostgreSQL + PostGIS (Port 5433)
- **Big Data**: Hadoop (Port 9870) + Spark (Port 8080)
- **Analytics**: Real-time data processing

## Troubleshooting

**Services won't start?**
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

**Backend connection issues?**
Check logs: `docker-compose logs server`

**Frontend not loading?**
Check if port 3030 is available: `lsof -i :3030`

## For Website Visitors

This is a live demonstration of the Navigate LA 28 platform. You can:
1. Explore the interactive map interface
2. Search for Olympic venues and attractions
3. View real-time transit information  
4. Check out the analytics dashboard
5. Browse the API documentation at `/docs`

The application showcases modern web development with React, FastAPI, and big data technologies preparing for the 2028 Los Angeles Olympics. 