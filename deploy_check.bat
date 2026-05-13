@echo off
echo ============================================================
echo IBS EXTRANET MOBILE - DEPLOYMENT READINESS CHECK
echo ============================================================

echo [1] Checking API...
if not exist "api\.env" (echo [WARNING] api/.env missing. Create it from .env.example) else (echo OK)

echo [2] Checking Client...
if not exist "client\.env" (echo [WARNING] client/.env missing. Create it from .env.example) else (echo OK)

echo [3] Checking Admin...
if not exist "admin\.env" (echo [WARNING] admin/.env missing. Create it from .env.example) else (echo OK)

echo [4] Checking Mobile...
if not exist "mobile\.env" (echo [WARNING] mobile/.env missing. Create it from .env.example) else (echo OK)

pause
