const requiredKeycloakEnv = ['KEYCLOAK_REALM', 'KEYCLOAK_AUTH_SERVER_URL', 'KEYCLOAK_CLIENT_ID'];
for (const envVar of requiredKeycloakEnv) {
    if (!process.env[envVar]) {
        throw new Error(`La variable d'environnement Keycloak '${envVar}' est manquante dans .env.`);
    }
}

module.exports = {
    realm:         process.env.KEYCLOAK_REALM,
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
    clientId:      process.env.KEYCLOAK_CLIENT_ID,
    jwksUri:       `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
};
