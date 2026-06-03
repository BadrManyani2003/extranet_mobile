const axios = require('axios');
const qs = require('qs');

const authServerUrl = process.env.KEYCLOAK_AUTH_SERVER_URL;
const realm         = process.env.KEYCLOAK_REALM;
const clientId      = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret  = process.env.KEYCLOAK_CLIENT_SECRET;

if (!authServerUrl || !realm || !clientId || !clientSecret) {
    throw new Error("La configuration d'authentification Keycloak (KEYCLOAK_AUTH_SERVER_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET) est incomplète dans .env.");
}

let cachedToken = null;
let tokenExpiry  = 0;

axios.interceptors.response.use(
    response => response,
    error => {
        console.error('❌ Erreur de l\'API Keycloak:', error.response?.data || error.message);
        throw new Error(error.response?.data?.errorMessage || error.response?.data?.error_description || 'Erreur du serveur d\'authentification Keycloak.');
    }
);

const getAdminToken = async () => {
    const now = Math.floor(Date.now() / 1000);

    if (cachedToken && tokenExpiry > (now + 10)) return cachedToken;

    const url  = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
    const data = qs.stringify({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret
    });

    const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    cachedToken = response.data.access_token;
    tokenExpiry = now + (response.data.expires_in || 60);

    return cachedToken;
};

const authHeader = async () => ({
    Authorization: `Bearer ${await getAdminToken()}`
});

const jsonHeader = async () => ({
    Authorization: `Bearer ${await getAdminToken()}`,
    'Content-Type': 'application/json'
});

const getAvailableRoles = async () => {
    const url      = `${authServerUrl}/admin/realms/${realm}/roles`;
    const response = await axios.get(url, { headers: await authHeader() });
    const excluded = ['offline_access', 'uma_authorization', `default-roles-${realm}`];
    return response.data.filter(role => !excluded.includes(role.name));
};

const getUserRoles = async (userIdAuth) => {
    const url      = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    const response = await axios.get(url, { headers: await authHeader() });
    return response.data;
};

const assignUserRoles = async (userIdAuth, roles) => {
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    await axios.post(url, roles, { headers: await jsonHeader() });
};

const removeUserRoles = async (userIdAuth, roles) => {
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    await axios.delete(url, { headers: await jsonHeader(), data: roles });
};

const findUserByEmail = async (email) => {
    const url      = `${authServerUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}`;
    const response = await axios.get(url, { headers: await authHeader() });
    return response.data;
};

const getUserById = async (userIdAuth) => {
    const url      = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}`;
    const response = await axios.get(url, { headers: await authHeader() });
    return response.data;
};

const createUser = async (userData) => {
    const url      = `${authServerUrl}/admin/realms/${realm}/users`;
    const response = await axios.post(url, {
        username:      userData.username || userData.email,
        email:         userData.email,
        firstName:     userData.firstName || '',
        lastName:      userData.lastName  || '',
        enabled:       true,
        emailVerified: true
    }, { headers: await jsonHeader() });

    if (response.headers.location) {
        return response.headers.location.split('/').pop();
    }

    const users = await findUserByEmail(userData.email);
    if (users?.length > 0) return users[0].id;
    throw new Error("Impossible de recuperer l'ID de l'utilisateur Keycloak cree.");
};

const sendResetPasswordEmail = async (userIdAuth) => {
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/execute-actions-email`;
    await axios.put(url, ['UPDATE_PASSWORD'], { headers: await jsonHeader() });
};

const deleteUser = async (userIdAuth) => {
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}`;
    await axios.delete(url, { headers: await authHeader() });
};

module.exports = {
    getAvailableRoles,
    getUserRoles,
    assignUserRoles,
    removeUserRoles,
    findUserByEmail,
    getUserById,
    createUser,
    sendResetPasswordEmail,
    deleteUser
};
