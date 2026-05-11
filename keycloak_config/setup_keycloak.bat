@echo off
setlocal enabledelayedexpansion

:: ================= CONFIG =================
set KEYCLOAK_URL=http://localhost:8180
set ADMIN_USER=admin
set /p ADMIN_PASS=Password:

set REALM_NAME=ask_extranet_mobile

set CLIENT_ADMIN=client_admin
set CLIENT_EXTRANET=client_extranet
set CLIENT_MOBILE=client_mobile
set CLIENT_API=client_api

set REDIRECT_ADMIN=http://localhost:5173/*
set REDIRECT_EXTRANET=http://localhost:5174/*
set REDIRECT_MOBILE=assurplus://*

set KCADM_PATH=C:\keycloak\bin\kcadm.bat

cls
echo ------------------------------------------------------------
echo KEYCLOAK AUTO CONFIG : %REALM_NAME%
echo ------------------------------------------------------------

:: ================= LOGIN =================
echo [1/6] Login...
call %KCADM_PATH% config credentials --server %KEYCLOAK_URL% --realm master --user %ADMIN_USER% --password %ADMIN_PASS% >nul 2>&1
if errorlevel 1 (
    echo ERROR LOGIN
    exit /b 1
)
echo OK

:: ================= REALM =================
echo [2/6] Realm...
call %KCADM_PATH% get realms/%REALM_NAME% >nul 2>&1
if errorlevel 1 (
    call %KCADM_PATH% create realms -s realm=%REALM_NAME% -s enabled=true >nul
    echo CREATED
) else echo SKIP

:: ================= ROLES =================
echo [3/6] Roles...
for %%r in (admincab comercialcab client adherent) do (
    call %KCADM_PATH% get roles/%%r -r %REALM_NAME% >nul 2>&1
    if errorlevel 1 (
        call %KCADM_PATH% create roles -r %REALM_NAME% -s name=%%r >nul
        echo OK %%r
    ) else echo SKIP %%r
)

:: ================= CLIENTS =================
echo [4/6] Clients...

call :CREATE_CLIENT "%CLIENT_ADMIN%"    "%REDIRECT_ADMIN%"    true
call :CREATE_CLIENT "%CLIENT_EXTRANET%" "%REDIRECT_EXTRANET%" true
call :CREATE_CLIENT "%CLIENT_MOBILE%"   "%REDIRECT_MOBILE%"   true

:: API CLIENT (confidential, service account)
call %KCADM_PATH% get clients -r %REALM_NAME% > tmp_clients.json 2>nul
findstr /C:"\"clientId\" : \"%CLIENT_API%\"" tmp_clients.json >nul
if errorlevel 1 (
    echo CREATE %CLIENT_API%
    call %KCADM_PATH% create clients -r %REALM_NAME% ^
     -s clientId=%CLIENT_API% ^
     -s enabled=true ^
     -s publicClient=false ^
     -s serviceAccountsEnabled=true ^
     -s clientAuthenticatorType=client-secret >nul 2>&1
) else echo SKIP %CLIENT_API%
del tmp_clients.json >nul 2>&1

:: ================= UUID =================
echo [5/6] UUID...

set CLIENT_UUID=

:: Dump all clients to a temp file
call %KCADM_PATH% get clients -r %REALM_NAME% --fields id,clientId > tmp_uuid.json 2>nul

:: Parse : on cherche l'id juste avant "clientId" : "client_admin"
:: Strategy : read line by line, keep last "id" line seen before matching clientId
set _LAST_ID=
set _FOUND=0
for /f "usebackq delims=" %%L in ("tmp_uuid.json") do (
    set _LINE=%%L
    echo !_LINE! | findstr /C:"\"id\"" >nul && (
        set _RAW_ID=!_LINE!
        set _RAW_ID=!_RAW_ID:* : =!
        set _RAW_ID=!_RAW_ID:"=!
        set _RAW_ID=!_RAW_ID:,=!
        set _LAST_ID=!_RAW_ID!
    )
    echo !_LINE! | findstr /C:"\"clientId\" : \"%CLIENT_ADMIN%\"" >nul && (
        set CLIENT_UUID=!_LAST_ID!
        set _FOUND=1
    )
)

del tmp_uuid.json >nul 2>&1

if "!CLIENT_UUID!"=="" (
    echo ERROR : UUID not found for %CLIENT_ADMIN%
    exit /b 1
)
echo UUID = !CLIENT_UUID!

:: ================= CLIENT ROLES =================
echo [6/6] Client Roles...

call %KCADM_PATH% get clients/!CLIENT_UUID!/roles/mobile-user -r %REALM_NAME% >nul 2>&1
if errorlevel 1 (
    call %KCADM_PATH% create clients/!CLIENT_UUID!/roles -r %REALM_NAME% -s name=mobile-user >nul
    echo OK mobile-user
) else echo SKIP mobile-user

call %KCADM_PATH% get clients/!CLIENT_UUID!/roles/mobile-admin -r %REALM_NAME% >nul 2>&1
if errorlevel 1 (
    call %KCADM_PATH% create clients/!CLIENT_UUID!/roles -r %REALM_NAME% -s name=mobile-admin >nul
    echo OK mobile-admin
) else echo SKIP mobile-admin

echo ------------------------------------------------------------
echo DONE SUCCESSFULLY
echo ------------------------------------------------------------
pause
exit /b 0


:: ================================================================
:: SUBROUTINE : CREATE_CLIENT
::   %1 = clientId
::   %2 = redirectUri
::   %3 = publicClient (true/false)
:: ================================================================
:CREATE_CLIENT
setlocal enabledelayedexpansion

set _NAME=%~1
set _REDIRECT=%~2
set _PUBLIC=%~3

call %KCADM_PATH% get clients -r %REALM_NAME% > tmp_check.json 2>nul
findstr /C:"\"clientId\" : \"!_NAME!\"" tmp_check.json >nul

if errorlevel 1 (
    echo CREATE !_NAME!
    call %KCADM_PATH% create clients -r %REALM_NAME% ^
     -s clientId=!_NAME! ^
     -s enabled=true ^
     -s publicClient=!_PUBLIC! ^
     -s "redirectUris=[\"!_REDIRECT!\"]" ^
     -s "webOrigins=[\"*\"]" ^
     -s standardFlowEnabled=true >nul 2>&1
) else (
    echo SKIP !_NAME!
)

del tmp_check.json >nul 2>&1
endlocal
exit /b