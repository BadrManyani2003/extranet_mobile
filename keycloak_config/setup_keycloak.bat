@echo off
setlocal enabledelayedexpansion

:: ================= CONFIG =================
set "KEYCLOAK_URL=http://localhost:8180"
set "ADMIN_USER=admin"
set /p ADMIN_PASS=Password: 

set "REALM_NAME=ask_extranet_mobile"
set "CLIENT_ADMIN=client_admin"
set "CLIENT_EXTRANET=client_extranet"
set "CLIENT_MOBILE=client_mobile"
set "CLIENT_API=client_api"

set "REDIRECT_ADMIN=http://localhost:5173/*"
set "REDIRECT_EXTRANET=http://localhost:5174/*"
set "REDIRECT_MOBILE=assurplus://*"

set "KCADM_PATH=C:\keycloak\bin\kcadm.bat"

:: ================= SMTP CONFIG =================
set "SMTP_HOST=smtp.gmail.com"
set "SMTP_PORT=587"
set "SMTP_FROM=badr@example.com"
set "SMTP_USER=badr@example.com"
set "SMTP_PASS=your_password"

cls
echo ------------------------------------------------------------
echo KEYCLOAK AUTO CONFIG : %REALM_NAME%
echo ------------------------------------------------------------

:STEP1
echo [1/7] Authentification...
call "%KCADM_PATH%" config credentials --server %KEYCLOAK_URL% --realm master --user %ADMIN_USER% --password %ADMIN_PASS% >nul 2>&1
if %ERRORLEVEL% NEQ 0 echo [ERREUR] Login echoue. & pause & exit /b 1
echo OK

:STEP2
echo [2/7] Configuration du Realm...
call "%KCADM_PATH%" get realms/%REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :REALM_EXISTS
call "%KCADM_PATH%" create realms -s realm=%REALM_NAME% -s enabled=true >nul
echo Realm %REALM_NAME% cree.
goto :STEP3
:REALM_EXISTS
echo Realm %REALM_NAME% existe deja (SKIP).

:STEP3
echo [3/7] Configuration des Roles...
call :CREATE_ROLE admin_cabinet
call :CREATE_ROLE commercial_cabinet
call :CREATE_ROLE client
call :CREATE_ROLE adherent
echo Roles OK.

:STEP4
echo [4/7] Configuration des Clients...
call :CREATE_CLIENT "%CLIENT_ADMIN%"    "%REDIRECT_ADMIN%"    true
call :CREATE_CLIENT "%CLIENT_EXTRANET%" "%REDIRECT_EXTRANET%" true
call :CREATE_CLIENT "%CLIENT_MOBILE%"   "%REDIRECT_MOBILE%"   true

call "%KCADM_PATH%" get clients -r %REALM_NAME% > tmp_clients.json 2>nul
findstr /C:"\"clientId\" : \"%CLIENT_API%\"" tmp_clients.json >nul
if %ERRORLEVEL% EQU 0 goto :SKIP_CLIENT_API
echo Creation client API...
call "%KCADM_PATH%" create clients -r %REALM_NAME% -s clientId=%CLIENT_API% -s enabled=true -s publicClient=false -s serviceAccountsEnabled=true -s clientAuthenticatorType=client-secret >nul 2>&1
:SKIP_CLIENT_API
if %ERRORLEVEL% EQU 0 echo Client API OK.

:STEP5
if exist tmp_clients.json del tmp_clients.json >nul 2>&1
echo [5/7] Recuperation UUID...
set "CLIENT_UUID="
call "%KCADM_PATH%" get clients -r %REALM_NAME% --fields id,clientId > tmp_uuid.json 2>nul

for /f "usebackq delims=" %%L in ("tmp_uuid.json") do (
    set "_LINE=%%L"
    echo !_LINE! | findstr /C:"\"id\"" >nul && set "_RAW_ID=!_LINE!"
    if defined _RAW_ID (
        set "_RAW_ID=!_RAW_ID:* : =!"
        set "_RAW_ID=!_RAW_ID:"=!"
        set "_RAW_ID=!_RAW_ID:,=!"
        set "_RAW_ID=!_RAW_ID: =!"
        set "_LAST_ID=!_RAW_ID!"
        set "_RAW_ID="
    )
    echo !_LINE! | findstr /C:"\"clientId\" : \"%CLIENT_ADMIN%\"" >nul && set "CLIENT_UUID=!_LAST_ID!"
)
if exist tmp_uuid.json del tmp_uuid.json >nul 2>&1

if "%CLIENT_UUID%"=="" echo [ERREUR] UUID non trouve. & pause & exit /b 1
echo UUID detecte : %CLIENT_UUID%

:STEP6
echo [6/7] Roles specifiques au client...
call :CREATE_CLIENT_ROLE %CLIENT_UUID% mobile-user
call :CREATE_CLIENT_ROLE %CLIENT_UUID% mobile-admin

:STEP7
echo [7/7] Configuration SMTP...
call "%KCADM_PATH%" get realms/%REALM_NAME% >nul 2>&1
if %ERRORLEVEL% NEQ 0 call "%KCADM_PATH%" config credentials --server %KEYCLOAK_URL% --realm master --user %ADMIN_USER% --password %ADMIN_PASS% >nul 2>&1
call "%KCADM_PATH%" update realms/%REALM_NAME% -s smtpServer.host=%SMTP_HOST% -s smtpServer.port=%SMTP_PORT% -s smtpServer.from=%SMTP_FROM% -s smtpServer.auth=true -s smtpServer.user=%SMTP_USER% -s smtpServer.password=%SMTP_PASS% >nul 2>&1

echo ------------------------------------------------------------
echo CONFIGURATION TERMINEE AVEC SUCCES
echo ------------------------------------------------------------
pause
exit /b 0

:: ================================================================
:: SOUS-ROUTINES
:: ================================================================

:CREATE_ROLE
set "ROLE_NAME=%1"
call "%KCADM_PATH%" get roles/%ROLE_NAME% -r %REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :ROLE_EXISTS
call "%KCADM_PATH%" create roles -r %REALM_NAME% -s name=%ROLE_NAME% >nul
echo Role %ROLE_NAME% cree avec succes.
exit /b
:ROLE_EXISTS
echo Role %ROLE_NAME% existe deja (SKIP).
exit /b

:CREATE_CLIENT
set "_NAME=%~1"
set "_REDIRECT=%~2"
set "_PUBLIC=%~3"
call "%KCADM_PATH%" get clients -r %REALM_NAME% > tmp_check.json 2>nul
findstr /C:"\"clientId\" : \"!_NAME!\"" tmp_check.json >nul
if %ERRORLEVEL% EQU 0 goto :CLIENT_EXISTS
call "%KCADM_PATH%" create clients -r %REALM_NAME% -s clientId=!_NAME! -s enabled=true -s publicClient=!_PUBLIC! -s "redirectUris=[\"!_REDIRECT!\"]" -s "webOrigins=[\"*\"]" -s standardFlowEnabled=true >nul 2>&1
echo Client !_NAME! cree avec succes.
del tmp_check.json
exit /b
:CLIENT_EXISTS
echo Client !_NAME! existe deja (SKIP).
del tmp_check.json
exit /b

:CREATE_CLIENT_ROLE
set "C_ROLE_NAME=%2"
call "%KCADM_PATH%" get clients/%1/roles/%C_ROLE_NAME% -r %REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :C_ROLE_EXISTS
call "%KCADM_PATH%" create clients/%1/roles -r %REALM_NAME% -s name=%C_ROLE_NAME% >nul
echo Role client %C_ROLE_NAME% cree.
exit /b
:C_ROLE_EXISTS
echo Role client %C_ROLE_NAME% existe deja (SKIP).
exit /b