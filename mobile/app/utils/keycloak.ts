import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://192.168.1.100:8080';
const REALM        = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'keyclock-app';
const CLIENT_ID    = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'keyclock-app-frontend';

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
