import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Requis pour que la redirection web fonctionne correctement
WebBrowser.maybeCompleteAuthSession();

// ============================================================
// Configuration Keycloak pour Expo (React Native)
// ⚠️ Utilisez l'adresse IP LAN de votre machine (pas 'localhost') pour que l'appareil puisse joindre le serveur
// ============================================================
const KEYCLOAK_URL =
  process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://192.168.1.100:8080';
const REALM =
  process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'keyclock-app';
const CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'keyclock-app-frontend';

// Points de terminaison OAuth 2.0 / OIDC pour Keycloak
export const keycloakDiscovery = {
  authorizationEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  tokenEndpoint:         `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  revocationEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/revoke`,
  userInfoEndpoint:      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`,
  endSessionEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`,
};

// Configuration de la requête d'authentification — le schéma DOIT correspondre au champ "scheme" dans app.json
const redirectUri = makeRedirectUri({
  scheme: 'assurplus', // Pour les applications natives
  preferLocalhost: true, // Pour le web/développement
});


export const keycloakConfig = {
  clientId: CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  redirectUri,
};


