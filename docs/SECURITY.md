# 🔒 Navigate LA 28 - Security Guide

**Security Version:** 1.0  
**Last Updated:** January 15, 2024  
**Security Contact:** security@navigate-la28.com

---

## 📋 **Table of Contents**

- [Security Overview](#-security-overview)
- [Reporting Vulnerabilities](#-reporting-vulnerabilities)
- [Authentication & Authorization](#-authentication--authorization)
- [Data Protection](#-data-protection)
- [API Security](#-api-security)
- [Infrastructure Security](#-infrastructure-security)
- [Security Best Practices](#-security-best-practices)
- [Compliance](#-compliance)

---

## 🛡️ **Security Overview**

Navigate LA 28 takes security seriously. We employ a multi-layered security approach to protect user data, ensure system integrity, and maintain service availability during the 2028 Olympics.

### **Security Principles**
- **🔐 Security by Design**: Security integrated from the ground up
- **🎯 Zero Trust Architecture**: Every request is authenticated and authorized
- **🔄 Defense in Depth**: Multiple security layers and controls
- **📊 Continuous Monitoring**: Real-time threat detection and response
- **🔍 Regular Audits**: Periodic security assessments and penetration testing

### **Security Framework**
```
Security Layers:
├── Application Security
│   ├── Input validation
│   ├── Output encoding
│   ├── Authentication
│   └── Authorization
├── Infrastructure Security
│   ├── Network segmentation
│   ├── Firewall rules
│   ├── DDoS protection
│   └── Intrusion detection
├── Data Security
│   ├── Encryption at rest
│   ├── Encryption in transit
│   ├── Data classification
│   └── Access controls
└── Operational Security
    ├── Incident response
    ├── Vulnerability management
    ├── Security monitoring
    └── Compliance auditing
```

---

## 🚨 **Reporting Vulnerabilities**

### **Responsible Disclosure**
We welcome security researchers and the community to help identify vulnerabilities. Please follow our responsible disclosure process:

#### **Reporting Process**
1. **Email**: security@navigate-la28.com
2. **Include**:
   - Detailed description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Proof of concept (if applicable)
   - Your contact information

#### **Response Timeline**
| Timeframe | Action |
|-----------|--------|
| **24 hours** | Initial acknowledgment |
| **72 hours** | Preliminary assessment |
| **7 days** | Detailed investigation completion |
| **30 days** | Resolution and disclosure coordination |

### **Vulnerability Rewards**
We offer recognition and rewards for valid security findings:

| Severity | Reward | Criteria |
|----------|--------|----------|
| **Critical** | $1,000 - $5,000 | Remote code execution, SQL injection |
| **High** | $500 - $1,000 | Authentication bypass, data exposure |
| **Medium** | $100 - $500 | XSS, CSRF, privilege escalation |
| **Low** | $50 - $100 | Information disclosure, security misconfig |

### **Out of Scope**
- Social engineering attacks
- Physical security issues
- Third-party services (unless directly integrated)
- Denial of service attacks
- Issues requiring user interaction (phishing)

---

## 🔑 **Authentication & Authorization**

### **Authentication Methods**

#### **Primary Authentication**
```javascript
// JWT Token Structure
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "user_123",
    "email": "user@example.com",
    "roles": ["tourist"],
    "permissions": ["read:places", "write:reviews"],
    "exp": 1704023400,
    "iat": 1703937000,
    "iss": "navigate-la28.com"
  }
}
```

#### **Multi-Factor Authentication (Planned)**
- **SMS verification** for account creation
- **Email verification** for sensitive operations
- **TOTP support** for admin accounts
- **Hardware keys** for critical system access

### **Authorization Model**

#### **Role-Based Access Control (RBAC)**
```python
# User Roles and Permissions
ROLES = {
    "tourist": {
        "permissions": [
            "read:places",
            "read:reviews",
            "write:reviews",
            "read:transit",
            "read:analytics"
        ]
    },
    "verified_user": {
        "inherits": "tourist",
        "permissions": [
            "write:places",
            "moderate:reviews"
        ]
    },
    "business_owner": {
        "inherits": "verified_user",
        "permissions": [
            "manage:own_places",
            "respond:reviews"
        ]
    },
    "moderator": {
        "inherits": "verified_user",
        "permissions": [
            "moderate:places",
            "moderate:reviews",
            "moderate:users"
        ]
    },
    "admin": {
        "permissions": ["*"]  # All permissions
    }
}
```

#### **Permission Enforcement**
```python
# Decorator for permission checking
from functools import wraps
from fastapi import HTTPException, Depends

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not has_permission(current_user, permission):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@router.post("/places/")
@require_permission("write:places")
async def create_place(
    place_data: PlaceCreate,
    current_user: User = Depends(get_current_user)
):
    return await place_service.create(place_data, current_user.id)
```

---

## 🛡️ **Data Protection**

### **Encryption Standards**

#### **Data at Rest**
- **Database**: AES-256 encryption for sensitive fields
- **File Storage**: Server-side encryption with customer-managed keys
- **Backups**: Encrypted using AES-256 with separate key management
- **Logs**: Sensitive data masked or encrypted

#### **Data in Transit**
- **HTTPS/TLS 1.3**: All client-server communication
- **Certificate Pinning**: Mobile apps pin certificates
- **HSTS**: HTTP Strict Transport Security enforced
- **Perfect Forward Secrecy**: Each session uses unique keys

### **Data Classification**

#### **Data Categories**
| Classification | Examples | Protection Level |
|----------------|----------|------------------|
| **Public** | Place information, reviews | Standard web security |
| **Internal** | Analytics, metrics | Access controls, audit logging |
| **Confidential** | User profiles, preferences | Encryption, access controls |
| **Restricted** | Payment info, admin data | Strong encryption, strict access |

#### **Personal Data Handling**
```python
# PII Encryption Example
from cryptography.fernet import Fernet
import os

class PIIHandler:
    def __init__(self):
        self.key = os.environ.get('PII_ENCRYPTION_KEY').encode()
        self.cipher = Fernet(self.key)
    
    def encrypt_pii(self, data: str) -> str:
        """Encrypt personally identifiable information."""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt_pii(self, encrypted_data: str) -> str:
        """Decrypt personally identifiable information."""
        return self.cipher.decrypt(encrypted_data.encode()).decode()
    
    def mask_email(self, email: str) -> str:
        """Mask email for logging purposes."""
        local, domain = email.split('@')
        return f"{local[0]}***@{domain}"
```

### **Data Retention**

#### **Retention Policies**
| Data Type | Retention Period | Deletion Method |
|-----------|------------------|----------------|
| **User accounts** | 7 years after last login | Secure deletion |
| **Reviews** | Permanent (anonymized) | PII removal |
| **Analytics** | 3 years | Automated purge |
| **Logs** | 1 year | Encrypted deletion |
| **Backups** | 90 days | Secure destruction |

---

## 🔐 **API Security**

### **Input Validation**

#### **Request Validation**
```python
from pydantic import BaseModel, validator, EmailStr
from typing import Optional
import re

class UserRegistration(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', v):
            raise ValueError('Username must be 3-20 alphanumeric characters')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain digit')
        return v
```

#### **SQL Injection Prevention**
```python
# Safe parameterized queries
from sqlalchemy import text

# ❌ Vulnerable to SQL injection
async def get_places_unsafe(category: str):
    query = f"SELECT * FROM places WHERE category = '{category}'"
    return await database.fetch_all(query)

# ✅ Safe parameterized query
async def get_places_safe(category: str):
    query = text("SELECT * FROM places WHERE category = :category")
    return await database.fetch_all(query, values={"category": category})
```

### **Rate Limiting**

#### **Rate Limiting Configuration**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Different limits for different endpoints
@router.post("/auth/login")
@limiter.limit("5/minute")  # Strict limit for auth
async def login(request: Request, credentials: UserLogin):
    pass

@router.get("/places/search")
@limiter.limit("100/minute")  # Generous limit for search
async def search_places(request: Request, q: str):
    pass

@router.post("/reviews/")
@limiter.limit("10/hour")  # Prevent review spam
async def create_review(request: Request, review: ReviewCreate):
    pass
```

### **API Security Headers**

#### **Security Headers Configuration**
```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://navigate-la28.com", "https://www.navigate-la28.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'"
    return response
```

---

## 🏗️ **Infrastructure Security**

### **Network Security**

#### **Firewall Rules**
```bash
# Production firewall configuration
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (restricted to admin IPs)
ufw allow from 203.0.113.0/24 to any port 22

# Deny direct database access
ufw deny 5432/tcp
ufw deny 6379/tcp

# Allow internal container communication
ufw allow from 172.18.0.0/16

# Enable firewall
ufw enable
```

#### **Container Security**
```dockerfile
# Secure Dockerfile practices
FROM python:3.10-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY --chown=appuser:appuser . /app
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Switch to non-root user
USER appuser

# Set secure file permissions
RUN chmod -R 750 /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Secret Management**

#### **Environment Variables**
```bash
# Production secrets (never commit to repository)
# Database
DATABASE_URL=postgresql+asyncpg://user:$(cat /run/secrets/db_password)@db:5432/navigate_la28
TEST_DATABASE_URL=postgresql+asyncpg://test:$(cat /run/secrets/test_db_password)@testdb:5432/test_db

# JWT Configuration
SECRET_KEY=$(cat /run/secrets/jwt_secret)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# External API Keys
GOOGLE_MAPS_API_KEY=$(cat /run/secrets/google_maps_key)
SENTRY_DSN=$(cat /run/secrets/sentry_dsn)

# Redis
REDIS_URL=redis://:$(cat /run/secrets/redis_password)@redis:6379/0
```

#### **Docker Secrets**
```yaml
# docker-compose.prod.yml
version: '3.8'

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
  redis_password:
    external: true

services:
  server:
    image: navigate-la28/server:latest
    secrets:
      - db_password
      - jwt_secret
      - redis_password
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:$(cat /run/secrets/db_password)@db:5432/navigate_la28
```

---

## 🛡️ **Security Best Practices**

### **Development Security**

#### **Secure Coding Checklist**
- [ ] **Input validation** on all user inputs
- [ ] **Output encoding** for all dynamic content
- [ ] **Parameterized queries** for database access
- [ ] **Proper error handling** without information disclosure
- [ ] **Secure session management**
- [ ] **Access control verification**
- [ ] **Cryptographic best practices**
- [ ] **Security testing** integration

#### **Code Review Security Focus**
```python
# Security code review checklist
SECURITY_CHECKLIST = {
    "authentication": [
        "Password complexity requirements",
        "Account lockout mechanisms",
        "Session timeout implementation",
        "Multi-factor authentication support"
    ],
    "authorization": [
        "Role-based access control",
        "Privilege escalation prevention",
        "Resource-level permissions",
        "Default deny policies"
    ],
    "data_protection": [
        "Sensitive data encryption",
        "PII handling compliance",
        "Secure data transmission",
        "Data retention policies"
    ],
    "input_validation": [
        "SQL injection prevention",
        "XSS prevention",
        "File upload security",
        "JSON/XML parsing safety"
    ]
}
```

### **Deployment Security**

#### **Production Deployment Checklist**
- [ ] **SSL/TLS certificates** properly configured
- [ ] **Security headers** implemented
- [ ] **Database credentials** rotated
- [ ] **Default passwords** changed
- [ ] **Unnecessary services** disabled
- [ ] **File permissions** properly set
- [ ] **Logging** configured for security events
- [ ] **Monitoring** alerts configured

### **Incident Response**

#### **Security Incident Response Plan**
```
Incident Response Process:
1. Detection and Analysis
   ├── Security monitoring alerts
   ├── User reports
   ├── Automated scanning
   └── Third-party notifications

2. Containment
   ├── Isolate affected systems
   ├── Preserve evidence
   ├── Implement temporary fixes
   └── Document actions taken

3. Investigation
   ├── Root cause analysis
   ├── Impact assessment
   ├── Timeline reconstruction
   └── Evidence collection

4. Recovery
   ├── System restoration
   ├── Security improvements
   ├── Monitoring enhancement
   └── User communication

5. Post-Incident
   ├── Lessons learned review
   ├── Process improvements
   ├── Training updates
   └── Documentation updates
```

---

## 📋 **Compliance**

### **Regulatory Compliance**

#### **GDPR Compliance**
- **Lawful basis** for data processing
- **Consent management** system
- **Data subject rights** implementation
- **Privacy by design** principles
- **Data protection impact** assessments
- **Breach notification** procedures

#### **CCPA Compliance**
- **Consumer rights** implementation
- **Data disclosure** transparency
- **Opt-out mechanisms**
- **Non-discrimination** policies

### **Security Standards**

#### **OWASP Top 10 Compliance**
| Risk | Mitigation |
|------|------------|
| **Injection** | Parameterized queries, input validation |
| **Broken Authentication** | Strong password policies, MFA |
| **Sensitive Data Exposure** | Encryption, secure transmission |
| **XML External Entities** | Disable XML entity processing |
| **Broken Access Control** | RBAC implementation |
| **Security Misconfiguration** | Secure defaults, regular audits |
| **Cross-Site Scripting** | Output encoding, CSP headers |
| **Insecure Deserialization** | Input validation, safe parsing |
| **Known Vulnerabilities** | Regular updates, dependency scanning |
| **Insufficient Logging** | Comprehensive audit logging |

---

## 📞 **Security Contacts**

### **Reporting Security Issues**
- **Email**: security@navigate-la28.com
- **PGP Key**: Available on our website
- **Response Time**: 24 hours for acknowledgment

### **Security Team**
- **Security Lead**: security-lead@navigate-la28.com
- **Infrastructure Security**: infra-security@navigate-la28.com
- **Application Security**: app-security@navigate-la28.com

---

*This security guide is updated regularly to reflect current threats and best practices. For the latest version, visit our documentation portal.* 