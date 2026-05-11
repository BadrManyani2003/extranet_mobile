@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  CONFIGURATION KEYCLOAK - EXTRANET MOBILE
:: ============================================================

:: --- 1. CONFIGURATION SECTION ---
set KEYCLOAK_URL=http://localhost:8080
set ADMIN_USER=admin
set ADMIN_PASS=admin
set REALM_NAME=ask_extranet_mobile

:: Client IDs
set CLIENT_ADMIN=client_admin
set CLIENT_EXTRANET=client_extranet
set CLIENT_MOBILE=client_mobile
set CLIENT_API=client_api

:: Redirect URIs
set REDIRECT_ADMIN=http://localhost:5173/*
set REDIRECT_EXTRANET=http://localhost:5174/*
set REDIRECT_MOBILE=assurplus://*

:: Path to kcadm.bat
set KCADM_PATH=C:\keycloak\bin\kcadm.bat

:: UI Styling
set SEP=------------------------------------------------------------
set CHECK=^[[92m[OK]^[[0m
set WARN=^[[93m[SKIP]^[[0m
set FAIL=^[[91m[ERROR]^[[0m

:: --- 2. INITIALIZATION ---
cls
echo %SEP%
echo   INITIALISATION KEYCLOAK : %REALM_NAME%
echo %SEP%

:: Verify kcadm path
if not exist "%KCADM_PATH%" (
    echo.
    echo ❌ ERROR: Keycloak CLI not found at: %KCADM_PATH%
    echo Please update KCADM_PATH in this script.
    pause
    exit /b 1
)

:: --- 3. AUTHENTICATION ---
echo.
echo [1/5] Authenticating to Master Realm...
call %KCADM_PATH% config credentials --server %KEYCLOAK_URL% --realm master --user %ADMIN_USER% --password %ADMIN_PASS% >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo    ❌ Failed to connect to %KEYCLOAK_URL%
    echo    Check if Keycloak is running and your admin credentials are correct.
    pause
    exit /b 1
)
echo    ✅ Authenticated successfully.

:: --- 4. REALM CREATION ---
echo.
echo [2/5] Setting up Realm: %REALM_NAME%...
call %KCADM_PATH% get realms/%REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ⚠️  Realm already exists. Skipping creation.
) else (
    call %KCADM_PATH% create realms -s realm=%REALM_NAME% -s enabled=true -s displayName="ASK Extranet Mobile" >nul
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Realm created successfully.
    ) else (
        echo    ❌ Failed to create realm.
        pause
        exit /b 1
    )
)

:: --- 5. ROLES CREATION ---
echo.
echo [3/5] Deploying Business Roles...
for %%r in (admincab comercialcab client adherent) do (
    call %KCADM_PATH% get roles -r %REALM_NAME% --fields name | findstr /i "%%r" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo    ⚠️  Role '%%r' already exists.
    ) else (
        call %KCADM_PATH% create roles -r %REALM_NAME% -s name=%%r >nul
        echo    ✅ Role '%%r' created.
    )
)

:: --- 6. CLIENTS DEPLOYMENT ---
echo.
echo [4/5] Configuring OIDC Clients...

:: --- Client: ADMIN ---
call %KCADM_PATH% get clients -r %REALM_NAME% --fields clientId | findstr /i "%CLIENT_ADMIN%" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo    📦 Deploying %CLIENT_ADMIN%...
    call %KCADM_PATH% create clients -r %REALM_NAME% -s clientId=%CLIENT_ADMIN% -s enabled=true -s publicClient=true -s redirectUris=["%REDIRECT_ADMIN%"] -s webOrigins=["*"] -s standardFlowEnabled=true >nul
    echo       ✅ Done.
) else ( echo    ⚠️  %CLIENT_ADMIN% already exists. )

:: --- Client: EXTRANET ---
call %KCADM_PATH% get clients -r %REALM_NAME% --fields clientId | findstr /i "%CLIENT_EXTRANET%" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo    📦 Deploying %CLIENT_EXTRANET%...
    call %KCADM_PATH% create clients -r %REALM_NAME% -s clientId=%CLIENT_EXTRANET% -s enabled=true -s publicClient=true -s redirectUris=["%REDIRECT_EXTRANET%"] -s webOrigins=["*"] -s standardFlowEnabled=true >nul
    echo       ✅ Done.
) else ( echo    ⚠️  %CLIENT_EXTRANET% already exists. )

:: --- Client: MOBILE ---
call %KCADM_PATH% get clients -r %REALM_NAME% --fields clientId | findstr /i "%CLIENT_MOBILE%" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo    📦 Deploying %CLIENT_MOBILE%...
    call %KCADM_PATH% create clients -r %REALM_NAME% -s clientId=%CLIENT_MOBILE% -s enabled=true -s publicClient=true -s redirectUris=["%REDIRECT_MOBILE%","http://localhost:19006/*"] -s webOrigins=["*"] -s standardFlowEnabled=true >nul
    echo       ✅ Done.
) else ( echo    ⚠️  %CLIENT_MOBILE% already exists. )

:: --- Client: API ---
call %KCADM_PATH% get clients -r %REALM_NAME% --fields clientId | findstr /i "%CLIENT_API%" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo    📦 Deploying %CLIENT_API%...
    call %KCADM_PATH% create clients -r %REALM_NAME% -s clientId=%CLIENT_API% -s enabled=true -s publicClient=false -s bearerOnly=true >nul
    echo       ✅ Done.
) else ( echo    ⚠️  %CLIENT_API% already exists. )

:: --- 7. SUMMARY ---
echo.
echo %SEP%
echo   🎉 DEPLOYMENT COMPLETE
echo %SEP%
echo   Realm   : %REALM_NAME%
echo   Roles   : admincab, comercialcab, client, adherent
echo   Clients : %CLIENT_ADMIN%, %CLIENT_EXTRANET%, %CLIENT_MOBILE%, %CLIENT_API%
echo %SEP%
echo.
echo Task finished. You can now use your .env files.
pause
exit /b 0
