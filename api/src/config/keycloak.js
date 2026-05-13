/**
 * Configuration Expert de Keycloak
 */
module.exports = {
    realm:         process.env.KEYCLOAK_REALM,
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
    clientId:      process.env.KEYCLOAK_CLIENT_ID,
    // URL JWKS pour la vérification du token
    jwksUri:       `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
};

