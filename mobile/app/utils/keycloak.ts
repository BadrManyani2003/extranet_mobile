import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Required for web redirection to work properly
WebBrowser.maybeCompleteAuthSession();

// ============================================================
// Keycloak Configuration for Expo (React Native)
// ⚠️  Use your machine's LAN IP (not 'localhost') so the device can reach the server
// ============================================================
const KEYCLOAK_URL =
  process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://192.168.1.100:8080';
const REALM =
  process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'keyclock-app';
const CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'keyclock-app-frontend';

// OAuth 2.0 / OIDC endpoints for Keycloak
export const keycloakDiscovery = {
  authorizationEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  tokenEndpoint:         `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  revocationEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/revoke`,
  userInfoEndpoint:      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`,
  endSessionEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`,
};

// Auth request config — scheme MUST match app.json "scheme" field
const redirectUri = makeRedirectUri({
  scheme: 'assurplus', // For native apps
  preferLocalhost: true, // For web/development
});

console.log('🔗 Generated Redirect URI:', redirectUri);

export const keycloakConfig = {
  clientId: CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  redirectUri,
};


