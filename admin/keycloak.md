# Guide de Configuration Keycloak Client (A à Z)

Ce document décrit les étapes pour configurer un client Keycloak pour ce projet.

## 1. Création du Realm (Optionnel)
Si vous n'avez pas encore de Realm dédié :
1. Connectez-vous à la console d'administration Keycloak.
2. Survolez le nom du Realm actuel en haut à gauche et cliquez sur **Add Realm**.
3. Donnez-lui un nom (ex: `extranet-realm`) et cliquez sur **Create**.

## 2. Création du Client
1. Allez dans la section **Clients** dans le menu de gauche.
2. Cliquez sur **Create** (ou **Create client**).
3. Remplissez les champs :
   - **Client ID** : `extranet-app` (ou le nom spécifique au projet)
   - **Client Protocol** : `openid-connect`
4. Cliquez sur **Save**.

## 3. Configuration du Client (Settings)
Une fois le client créé, configurez les paramètres suivants dans l'onglet **Settings** :

### Pour les Applications Frontend (React / Vue / Mobile)
- **Access Type** : `public`
- **Standard Flow Enabled** : ON
- **Direct Access Grants Enabled** : ON (utile pour le debug/tests)
- **Valid Redirect URIs** :
  - Web : `http://localhost:3000/*` (à adapter selon le port)
  - Mobile : `exp://127.0.0.1:19000` (pour Expo) ou votre schéma personnalisé.
- **Web Origins** : `*` (pour éviter les erreurs CORS en développement)

### Pour les APIs Backend (Node.js / Python / Java)
- **Access Type** : `confidential`
- **Service Accounts Enabled** : ON (si l'API doit communiquer avec Keycloak sans utilisateur)
- **Authorization Enabled** : Facultatif selon les besoins.

## 4. Récupération des Identifiants
- **Client ID** : Disponible dans l'onglet Settings.
- **Client Secret** : Si le client est `confidential`, allez dans l'onglet **Credentials** pour copier le secret.
- **Discovery Endpoint** : `http://<KEYCLOAK_URL>/auth/realms/<REALM_NAME>/.well-known/openid-configuration`

## 5. Rôles et Mappers (Optionnel)
1. **Roles** : Créez des rôles spécifiques au client dans l'onglet **Roles**.
2. **Client Scopes** : Ajoutez des mappers pour inclure des informations personnalisées dans le token JWT (ex: `preferred_username`, `email`, `roles`).

---
*Note : Assurez-vous que l'URL de Keycloak est accessible depuis l'environnement où tourne l'application.*
