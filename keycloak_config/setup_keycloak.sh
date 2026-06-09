#!/bin/bash

# ================= CONFIG =================
KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"

read -s -p "Mot de passe : " ADMIN_PASS
echo ""

REALM_NAME="ask_extranet_mobile"
CLIENT_ADMIN="client_admin"
CLIENT_EXTRANET="client_extranet"
CLIENT_MOBILE="client_mobile"
CLIENT_API="client_api"

REDIRECT_ADMIN="\"http://localhost:5173/*\",\"http://192.168.20.110:8003/*\""
REDIRECT_EXTRANET="\"http://localhost:5174/*\",\"http://192.168.20.110:8004/*\""
REDIRECT_MOBILE="\"assurplus://*\""

# Modifier ce chemin selon votre installation de Keycloak sur Linux/macOS
KCADM_PATH="/opt/keycloak/bin/kcadm.sh"

# ================= SMTP CONFIG =================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_FROM="badr@example.com"
SMTP_USER="badr@example.com"
SMTP_PASS="your_password"

clear
echo "------------------------------------------------------------"
echo "KEYCLOAK AUTO CONFIG : $REALM_NAME"
echo "------------------------------------------------------------"

echo "[1/6] Authentification..."
"$KCADM_PATH" config credentials --server "$KEYCLOAK_URL" --realm master --user "$ADMIN_USER" --password "$ADMIN_PASS" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[ERREUR] Connexion echouee."
    exit 1
fi
echo "OK"

echo "[2/6] Configuration du Realm..."
"$KCADM_PATH" get realms/"$REALM_NAME" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Realm $REALM_NAME existe deja (IGNORER)."
else
    "$KCADM_PATH" create realms -s realm="$REALM_NAME" -s enabled=true -s resetPasswordAllowed=true -s editUsernameAllowed=false -s verifyEmail=true >/dev/null
    echo "Realm $REALM_NAME cree."
fi

echo "[3/6] Configuration des Roles..."
CREATE_ROLE() {
    local ROLE_NAME="$1"
    "$KCADM_PATH" get roles/"$ROLE_NAME" -r "$REALM_NAME" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Le role $ROLE_NAME existe deja (IGNORER)."
    else
        "$KCADM_PATH" create roles -r "$REALM_NAME" -s name="$ROLE_NAME" >/dev/null
        echo "Role $ROLE_NAME cree avec succes."
    fi
}

CREATE_ROLE "admin_cabinet"
CREATE_ROLE "commercial_cabinet"
CREATE_ROLE "client"
CREATE_ROLE "adherent"
echo "Roles OK."

echo "[4/6] Configuration des Clients..."
CREATE_CLIENT() {
    local NAME="$1"
    local REDIRECT="$2"
    local PUBLIC="$3"
    
    local EXISTS=$("$KCADM_PATH" get clients -r "$REALM_NAME" 2>/dev/null | grep -c "\"clientId\" : \"$NAME\"")
    if [ "$EXISTS" -gt 0 ]; then
        echo "Le client $NAME existe deja (IGNORER)."
    else
        "$KCADM_PATH" create clients -r "$REALM_NAME" -s clientId="$NAME" -s enabled=true -s publicClient="$PUBLIC" -s "redirectUris=[$REDIRECT]" -s "webOrigins=[\"*\"]" -s standardFlowEnabled=true >/dev/null 2>&1
        echo "Le client $NAME a ete cree avec succes."
    fi
}

CREATE_CLIENT "$CLIENT_ADMIN" "$REDIRECT_ADMIN" "true"
CREATE_CLIENT "$CLIENT_EXTRANET" "$REDIRECT_EXTRANET" "true"
CREATE_CLIENT "$CLIENT_MOBILE" "$REDIRECT_MOBILE" "true"

# API Client
API_EXISTS=$("$KCADM_PATH" get clients -r "$REALM_NAME" 2>/dev/null | grep -c "\"clientId\" : \"$CLIENT_API\"")
if [ "$API_EXISTS" -gt 0 ]; then
    echo "Client API OK (existe deja)."
else
    echo "Creation du client API..."
    "$KCADM_PATH" create clients -r "$REALM_NAME" -s clientId="$CLIENT_API" -s enabled=true -s publicClient=false -s serviceAccountsEnabled=true -s clientAuthenticatorType=client-secret -s secret="mL1QMYDIhfgbrIJGCvwYW872GUa2PNV0" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Client API OK."
    fi
fi

echo "[5/6] Configuration SMTP et Securite..."
"$KCADM_PATH" update realms/"$REALM_NAME" -s smtpServer.host="$SMTP_HOST" -s smtpServer.port="$SMTP_PORT" -s smtpServer.from="$SMTP_FROM" -s smtpServer.auth=true -s smtpServer.user="$SMTP_USER" -s smtpServer.password="$SMTP_PASS" -s verifyEmail=true -s resetPasswordAllowed=true -s editUsernameAllowed=false

echo "Activation de l'action requise : UPDATE_PASSWORD (par defaut)..."
"$KCADM_PATH" update authentication/required-actions/UPDATE_PASSWORD -r "$REALM_NAME" -s defaultAction=true -s enabled=true
"$KCADM_PATH" update authentication/required-actions/VERIFY_EMAIL -r "$REALM_NAME" -s defaultAction=true -s enabled=true
"$KCADM_PATH" update authentication/required-actions/UPDATE_PROFILE -r "$REALM_NAME" -s defaultAction=false -s enabled=false
echo "Actions requises OK."

echo "[6/6] Permissions du Compte de Service ($CLIENT_API)..."
echo "Assignation du role realm-admin au compte service-account-$CLIENT_API..."
"$KCADM_PATH" add-roles -r "$REALM_NAME" --uusername service-account-"$CLIENT_API" --cclientid realm-management --rolename realm-admin
if [ $? -eq 0 ]; then
    echo "Role realm-admin assigne avec succes."
else
    echo "[ERREUR] Impossible d'assigner le role realm-admin."
fi

echo "------------------------------------------------------------"
echo "CONFIGURATION TERMINEE AVEC SUCCES"
echo "------------------------------------------------------------"
echo "Note: Tous les nouveaux utilisateurs devront changer leur mot de passe"
echo "      et verifier leur email lors de leur premiere connexion."
echo "------------------------------------------------------------"
