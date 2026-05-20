#!/bin/bash

# --- CONFIGURATION KEYCLOAK ---
KC_PATH="kcadm.sh"
KC_SERVER="http://localhost:8080"
KC_REALM="ask_extranet_mobile"
KC_USER="admin"
KC_PASS="admin"
DEFAULT_PASSWORD="ABC@1234"

# Check if kcadm.sh exists or is in PATH, if not fallback to common directory
if ! command -v "$KC_PATH" &> /dev/null; then
    if [ -f "/opt/keycloak/bin/kcadm.sh" ]; then
        KC_PATH="/opt/keycloak/bin/kcadm.sh"
    elif [ -f "./kcadm.sh" ]; then
        KC_PATH="./kcadm.sh"
    fi
fi

echo "[1/3] Connexion au serveur Keycloak..."
"$KC_PATH" config credentials --server "$KC_SERVER" --realm master --user "$KC_USER" --password "$KC_PASS"
if [ $? -ne 0 ]; then
    echo "ERREUR: Impossible de se connecter. Verifiez vos identifiants admin Keycloak."
    read -p "Appuyez sur Entree pour quitter..."
    exit 1
fi

create_user() {
    local EMAIL="$1"
    local NAME="$2"
    local ROLE="$3"

    echo ""
    echo "Verification de l'existence de $NAME ($EMAIL)..."

    # Recuperer l'ID si l'utilisateur existe deja
    USER_ID=$("$KC_PATH" get users -r "$KC_REALM" -q email="$EMAIL" --fields id --format csv --noquotes 2>/dev/null | tail -n +2)
    USER_ID=$(echo "$USER_ID" | tr -d '"\r\n')

    if [ -n "$USER_ID" ]; then
        echo "L'utilisateur $EMAIL existe deja."
        echo "[SUCCESS] ID_AUTH pour $EMAIL : $USER_ID"
        return 0
    fi

    echo "Creation de $NAME ($EMAIL) avec le role [$ROLE]..."

    # Creation de l'utilisateur
    "$KC_PATH" create users -r "$KC_REALM" -s email="$EMAIL" -s username="$EMAIL" -s firstName="$NAME" -s enabled=true

    # Definir le mot de passe
    "$KC_PATH" set-password -r "$KC_REALM" --username "$EMAIL" --new-password "$DEFAULT_PASSWORD"

    # Attribution du role
    if [ -n "$ROLE" ]; then
        "$KC_PATH" add-roles -r "$KC_REALM" --uusername "$EMAIL" --rolename "$ROLE"
        if [ $? -eq 0 ]; then
            echo "[OK] Role $ROLE attribue."
        else
            echo "[ERREUR] Impossible d'attribuer le role $ROLE."
        fi
    fi

    # Recuperer l'ID (sub) de l'utilisateur nouvellement cree
    USER_ID=$("$KC_PATH" get users -r "$KC_REALM" -q email="$EMAIL" --fields id --format csv --noquotes | tail -n +2)
    USER_ID=$(echo "$USER_ID" | tr -d '"\r\n')
    if [ -n "$USER_ID" ]; then
        echo "[SUCCESS] ID_AUTH pour $EMAIL : $USER_ID"
    fi
}

echo "[2/3] Creation des utilisateurs avec attribution des roles..."
create_user "admin_cabinet@ibs.ma" "Admin Cabinet" "admin_cabinet"

echo ""
echo "[3/3] Termine. Copiez les ID_AUTH ci-dessus dans votre fichier donnee_test.sql."
read -p "Appuyez sur Entree pour quitter..."
