@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION KEYCLOAK ---
set KC_PATH=C:\keycloak\bin\kcadm.bat
set KC_SERVER=http://localhost:8080
set KC_REALM=ask_extranet_mobile
set KC_USER=admin
set KC_PASS=admin
set DEFAULT_PASSWORD=ABC@1234

echo [1/3] Connexion au serveur Keycloak...
call %KC_PATH% config credentials --server %KC_SERVER% --realm master --user %KC_USER% --password %KC_PASS%
if %ERRORLEVEL% neq 0 (
    echo ERREUR: Impossible de se connecter. Verifiez vos identifiants admin Keycloak.
    pause
    exit /b
)

echo [2/3] Creation des utilisateurs avec attribution des roles...

call :create_user "admin_cabinet@ibs.ma" "Admin Cabinet" "admin_cabinet"

echo.
echo [3/3] Termine.
pause
goto :eof

:create_user
set "EMAIL=%~1"
set "NAME=%~2"
set "ROLE=%~3"

echo.
echo Creation de %NAME% (%EMAIL%) avec le role [%ROLE%]...

REM Creation de l'utilisateur
call %KC_PATH% create users -r %KC_REALM% -s email=%EMAIL% -s username=%EMAIL% -s firstName="%NAME%" -s enabled=true

REM Definir le mot de passe
call %KC_PATH% set-password -r %KC_REALM% --username %EMAIL% --new-password %DEFAULT_PASSWORD%

REM Attribution du role
if not "%ROLE%"=="" (
    call %KC_PATH% add-roles -r %KC_REALM% --uusername %EMAIL% --rolename %ROLE%
    if %ERRORLEVEL% equ 0 (
        echo [OK] Role %ROLE% attribue.
    ) else (
        echo [ERREUR] Impossible d'attribuer le role %ROLE%.
    )
)

REM Recuperer l'ID (sub)
for /f "usebackq tokens=*" %%I in (`call %KC_PATH% get users -r %KC_REALM% -q email=%EMAIL% --fields id --format csv --no-header`) do (
    set "USER_ID=%%I"
    set "USER_ID=!USER_ID:"=!"
    echo [SUCCESS] ID_AUTH pour %EMAIL% : !USER_ID!
)
goto :eof
