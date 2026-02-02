# Host Club Management System

## Overview
Host club management system with FastAPI backend, React frontend, and MySQL.

## Run with Docker
```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api
- MySQL: localhost:3306 (user: app / password: app, db: host_management)

## Login
Initial admin account (set in backend/app/core/config.py):
- Username: admin
- Password: admin123

## Local Development (Optional)
### Backend
```bash
cd backend
/Users/wonjunseo/AI_Private/.venv/bin/python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Configuration
MySQL connection is configured via environment variables:
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DB
