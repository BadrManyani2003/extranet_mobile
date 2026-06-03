import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
const REALM        = process.env.EXPO_PUBLIC_KEYCLOAK_REALM;
const CLIENT_ID    = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID;

if (!KEYCLOAK_URL || !REALM || !CLIENT_ID) {
  throw new Error("La configuration Keycloak (EXPO_PUBLIC_KEYCLOAK_URL, EXPO_PUBLIC_KEYCLOAK_REALM, EXPO_PUBLIC_KEYCLOAK_CLIENT_ID) est manquante dans l'environnement mobile.");
}

export const keycloakDiscovery = {
  authorizationEndpoint: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  tokenEndpoint:         `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  revocationEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/revoke`,
  userInfoEndpoint:      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`,
  endSessionEndpoint:    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`,
};

const redirectUri = makeRedirectUri({
  scheme:          'assurplus',
  preferLocalhost: true,
});

export const keycloakConfig = {
  clientId:    CLIENT_ID,
  scopes:      ['openid', 'profile', 'email'],
  redirectUri,
  extraParams: { prompt: 'login' },
};
