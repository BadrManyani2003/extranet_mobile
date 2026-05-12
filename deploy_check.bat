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

echo ------------------------------------------------------------
echo Verification terminee.
echo Pour deployer :
echo 1. API    : cd api ^&^& npm install ^&^& npm start
echo 2. Fronts : cd client (ou admin) ^&^& npm install ^&^& npm run build
echo 3. Mobile : cd mobile ^&^& eas build --platform android
echo ------------------------------------------------------------
pause
