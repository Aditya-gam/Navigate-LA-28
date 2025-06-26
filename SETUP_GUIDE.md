# Navigate-LA-28 Local Development Setup Guide

## 🏗️ Prerequisites

Ensure the following software is installed on your macOS system:

### Required Software
- **Docker Desktop** (latest version)
- **Node.js** 18.x or higher + npm
- **Python** 3.10+ with pip
- **Git** (latest version)

### Verify Installations
```bash
# Check versions
docker --version          # Docker version 20.x+
node --version            # v18.x+
npm --version             # 9.x+
python3 --version         # Python 3.10+
git --version             # git version 2.x+
```

---

## 🚀 Quick Start

### 1. Clone and Enter Project
```bash
git clone <your-repo-url>
cd Navigate-LA-28
```

### 2. Environment Setup
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit the .env file with your settings
# DATABASE_URL=postgresql+asyncpg://la28_user:bigdata_la28@localhost:5433/navigate_la28_db
# SECRET_KEY=your-super-secret-key-here
```

### 3. Build and Start Services
```bash
# Start all services (this will take 5-10 minutes on first run)
docker-compose up -d --build

# Check service status
docker-compose ps
```

### 4. Initialize Database
```bash
# Run database initialization
docker-compose exec server python models/init_db.py

# Populate with sample data (optional)
docker-compose exec server python scripts/populate_places.py
docker-compose exec server python scripts/populate_bus_stops.py
```

### 5. Access Application
- **Frontend**: http://localhost:3030
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Hadoop Web UI**: http://localhost:9870
- **Spark Web UI**: http://localhost:8080

---

## 🔧 Development Workflow

### Frontend Development
```bash
# Enter client directory
cd client

# Install dependencies (if not using Docker)
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Backend Development
```bash
# Enter server directory
cd server

# Create virtual environment (if not using Docker)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
pytest

# Run with coverage
pytest --cov=.
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U la28_user -d navigate_la28_db

# View logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U la28_user navigate_la28_db > backup.sql
```

---

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :3030  # Frontend
lsof -i :8000  # Backend
lsof -i :5433  # PostgreSQL

# Kill processes if needed
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -f

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U la28_user

# Reset database permissions
docker-compose exec postgres psql -U la28_user -c "ALTER USER la28_user CREATEDB;"
```

### Performance Optimization
```bash
# Increase Docker memory allocation (recommended: 8GB+)
# Docker Desktop → Settings → Resources → Memory

# Monitor resource usage
docker stats
```

---

## 📚 Architecture Details

### Frontend (React + Redux)
- **Port**: 3030
- **Hot Reload**: Enabled in development
- **State Management**: Redux Toolkit
- **UI Components**: Custom component library
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Chart.js with react-chartjs-2

### Backend (FastAPI + PostgreSQL)
- **Port**: 8000
- **Auto-reload**: Enabled in development
- **Database**: PostgreSQL with PostGIS
- **Authentication**: JWT tokens
- **API Docs**: Swagger UI at `/docs`

### Big Data Stack
- **Hadoop**: HDFS for distributed storage
- **Spark**: Data processing and analytics
- **PostgreSQL**: Primary data store with geospatial support

---

## 🚀 Deployment Preparation

### Environment Variables
Create production `.env` files:
```bash
# Production environment variables
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/navigate_la28
SECRET_KEY=super-secure-production-key
ENVIRONMENT=production
```

### Build Production Images
```bash
# Build optimized production images
docker-compose -f docker-compose.prod.yml build

# Test production build locally
docker-compose -f docker-compose.prod.yml up
```

### Security Checklist
- [ ] Update all default passwords
- [ ] Configure HTTPS certificates
- [ ] Set up CORS policies
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker Compose logs: `docker-compose logs`
3. Ensure all prerequisites are installed correctly
4. Verify environment variables are set properly

---

## 🎯 Next Steps

1. **Test the Application**: Verify all features work locally
2. **Update Dependencies**: Run security audits and updates
3. **Add Monitoring**: Implement logging and error tracking
4. **Performance Testing**: Load test the application
5. **Deployment**: Choose and configure production environment 