const axios = require('axios');
const qs = require('qs');

const getAdminToken = async () => {
    const data = qs.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_SECRET
    });

    const response = await axios.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        data,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.access_token;
};

const getToken = async (username, password) => {
    const data = qs.stringify({
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_SECRET,
        username,
        password,
        scope: 'openid'
    });

    const response = await axios.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        data,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
};

const refreshToken = async (refresh_token) => {
    const data = qs.stringify({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_SECRET,
        refresh_token
    });

    const response = await axios.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        data,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
};

const createUser = async (token, user) => {
    const keycloakUser = {
        username: user.Email || user.Nom.replace(/\s+/g, '.').toLowerCase(),
        email: user.Email,
        enabled: true,
        firstName: user.Nom.split(' ')[0],
        lastName: user.Nom.split(' ').slice(1).join(' '),
        attributes: {
            mobile: user.Telephone,
            nature: user.Nature
        },
        credentials: [{
            type: 'password',
            value: 'Ibs@2026',
            temporary: false
        }]
    };

    const response = await axios.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}admin/realms/${process.env.KEYCLOAK_REALM}/users`,
        keycloakUser,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const location = response.headers.location;
    return location ? location.split('/').pop() : null;
};

module.exports = {
    getAdminToken,
    getToken,
    refreshToken,
    createUser
};
