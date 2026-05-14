@echo off
setlocal enabledelayedexpansion

:: ================= CONFIG =================
set "KEYCLOAK_URL=http://localhost:8080"
set "ADMIN_USER=admin"
set /p ADMIN_PASS=Mot de passe : 

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
echo [1/6] Authentification...
call "%KCADM_PATH%" config credentials --server %KEYCLOAK_URL% --realm master --user %ADMIN_USER% --password %ADMIN_PASS% >nul 2>&1
if %ERRORLEVEL% NEQ 0 echo [ERREUR] Connexion echouee. & pause & exit /b 1
echo OK

:STEP2
echo [2/6] Configuration du Realm...
call "%KCADM_PATH%" get realms/%REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :REALM_EXISTS
call "%KCADM_PATH%" create realms -s realm=%REALM_NAME% -s enabled=true -s resetPasswordAllowed=true -s editUsernameAllowed=false -s verifyEmail=true >nul
echo Realm %REALM_NAME% cree.
goto :STEP3
:REALM_EXISTS
echo Realm %REALM_NAME% existe deja (IGNORER).

:STEP3
echo [3/6] Configuration des Roles...
call :CREATE_ROLE admin_cabinet
call :CREATE_ROLE commercial_cabinet
call :CREATE_ROLE client
call :CREATE_ROLE adherent
echo Roles OK.

:STEP4
echo [4/6] Configuration des Clients...
call :CREATE_CLIENT "%CLIENT_ADMIN%" "%REDIRECT_ADMIN%" true
call :CREATE_CLIENT "%CLIENT_EXTRANET%" "%REDIRECT_EXTRANET%" true
call :CREATE_CLIENT "%CLIENT_MOBILE%" "%REDIRECT_MOBILE%" true

call "%KCADM_PATH%" get clients -r %REALM_NAME% > tmp_clients.json 2>nul
findstr /C:"\"clientId\" : \"%CLIENT_API%\"" tmp_clients.json >nul
if %ERRORLEVEL% EQU 0 goto :SKIP_CLIENT_API
echo Creation du client API...
call "%KCADM_PATH%" create clients -r %REALM_NAME% -s clientId=%CLIENT_API% -s enabled=true -s publicClient=false -s serviceAccountsEnabled=true -s clientAuthenticatorType=client-secret >nul 2>&1
:SKIP_CLIENT_API
if %ERRORLEVEL% EQU 0 echo Client API OK.

:STEP5
echo [5/6] Configuration SMTP et Securite...
:: Configuration du serveur SMTP
call "%KCADM_PATH%" update realms/%REALM_NAME% -s smtpServer.host=%SMTP_HOST% -s smtpServer.port=%SMTP_PORT% -s smtpServer.from=%SMTP_FROM% -s smtpServer.auth=true -s smtpServer.user=%SMTP_USER% -s smtpServer.password=%SMTP_PASS% -s verifyEmail=true -s resetPasswordAllowed=true -s editUsernameAllowed=false

:: Force l'action "Update Password" au premier login pour TOUS les nouveaux utilisateurs
echo Activation de l'action requise : UPDATE_PASSWORD (par defaut)...
call "%KCADM_PATH%" update authentication/required-actions/UPDATE_PASSWORD -r %REALM_NAME% -s defaultAction=true -s enabled=true
call "%KCADM_PATH%" update authentication/required-actions/VERIFY_EMAIL -r %REALM_NAME% -s defaultAction=true -s enabled=true
call "%KCADM_PATH%" update authentication/required-actions/UPDATE_PROFILE -r %REALM_NAME% -s defaultAction=false -s enabled=false
echo Actions requises OK.

:STEP6
echo [6/6] Permissions du Compte de Service (%CLIENT_API%)...
:: On recupere d'abord le username du service account (format standard: service-account-clientid)
:: On lui assigne le role 'realm-admin' du client 'realm-management' pour qu'il puisse gerer le realm via l'API
echo Assignation du role realm-admin au compte service-account-%CLIENT_API%...
call "%KCADM_PATH%" add-roles -r %REALM_NAME% --uusername service-account-%CLIENT_API% --cclientid realm-management --rolename realm-admin
if %ERRORLEVEL% EQU 0 (
    echo Role realm-admin assigne avec succes.
) else (
    echo [ERREUR] Impossible d'assigner le role realm-admin.
)

echo ------------------------------------------------------------
echo CONFIGURATION TERMINEE AVEC SUCCES
echo ------------------------------------------------------------
echo Note: Tous les nouveaux utilisateurs devront changer leur mot de passe
echo       et verifier leur email lors de leur premiere connexion.
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
echo Le role %ROLE_NAME% existe deja (IGNORER).
exit /b

:CREATE_CLIENT
set "_NAME=%~1"
set "_REDIRECT=%~2"
set "_PUBLIC=%~3"
call "%KCADM_PATH%" get clients -r %REALM_NAME% > tmp_check.json 2>nul
findstr /C:"\"clientId\" : \"!_NAME!\"" tmp_check.json >nul
if %ERRORLEVEL% EQU 0 goto :CLIENT_EXISTS
call "%KCADM_PATH%" create clients -r %REALM_NAME% -s clientId=!_NAME! -s enabled=true -s publicClient=!_PUBLIC! -s "redirectUris=[\"!_REDIRECT!\"]" -s "webOrigins=[\"*\"]" -s standardFlowEnabled=true >nul 2>&1
echo Le client !_NAME! a ete cree avec succes.
del tmp_check.json
exit /b
:CLIENT_EXISTS
echo Le client !_NAME! existe deja (IGNORER).
del tmp_check.json
exit /b

:CREATE_CLIENT_ROLE
set "C_ROLE_NAME=%2"
call "%KCADM_PATH%" get clients/%1/roles/%C_ROLE_NAME% -r %REALM_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :C_ROLE_EXISTS
call "%KCADM_PATH%" create clients/%1/roles -r %REALM_NAME% -s name=%C_ROLE_NAME% >nul
echo Le role client %C_ROLE_NAME% a ete cree.
exit /b
:C_ROLE_EXISTS
echo Le role client %C_ROLE_NAME% existe deja (IGNORER).
exit /b