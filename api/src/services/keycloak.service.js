const axios = require('axios');
const qs = require('qs');

const authServerUrl = process.env.KEYCLOAK_AUTH_SERVER_URL;
const realm = process.env.KEYCLOAK_REALM;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_SECRET;

/**
 * Obtient un token d'accès administrateur via le flux client_credentials.
 * Le client doit avoir les rôles "manage-users" et "view-realm" (dans client roles -> realm-management)
 */
const getAdminToken = async () => {
    const url = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
    const data = qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });

    const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.access_token;
};

/**
 * Récupère tous les rôles de royaume disponibles.
 */
const getAvailableRoles = async () => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/roles`;
    
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
};

/**
 * Récupère les rôles assignés à un utilisateur.
 */
const getUserRoles = async (userIdAuth) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
};

/**
 * Assigne des rôles à un utilisateur dans Keycloak.
 */
const assignUserRoles = async (userIdAuth, roles) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    
    // Keycloak attend une liste d'objets de rôle {id, name}
    await axios.post(url, roles, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Supprime des rôles d'un utilisateur dans Keycloak.
 */
const removeUserRoles = async (userIdAuth, roles) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/role-mappings/realm`;
    
    await axios.delete(url, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: roles
    });
};

module.exports = {
    getAvailableRoles,
    getUserRoles,
    assignUserRoles,
    removeUserRoles
};
