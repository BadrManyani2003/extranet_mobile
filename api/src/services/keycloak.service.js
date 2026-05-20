const axios = require('axios');
const qs = require('qs');

const authServerUrl = process.env.KEYCLOAK_AUTH_SERVER_URL;
const realm = process.env.KEYCLOAK_REALM;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

if (!authServerUrl || !realm || !clientId || !clientSecret) {
    console.error('❌ Keycloak configuration missing in .env');
}

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Obtient un token d'accès administrateur via le flux client_credentials.
 * Avec mise en cache pour éviter des appels réseaux inutiles.
 */
const getAdminToken = async () => {
    const now = Math.floor(Date.now() / 1000);
    
    // Si on a un token valide (avec une marge de 10s), on le retourne
    if (cachedToken && tokenExpiry > (now + 10)) {
        return cachedToken;
    }

    const url = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
    const data = qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });

    const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    cachedToken = response.data.access_token;
    // On calcule l'expiration (par défaut Keycloak donne expires_in en secondes)
    tokenExpiry = now + (response.data.expires_in || 60); 

    return cachedToken;
};

/**
 * Récupère tous les rôles de royaume disponibles (filtrés).
 */
const getAvailableRoles = async () => {
    try {
        const token = await getAdminToken();
        const url = `${authServerUrl}/admin/realms/${realm}/roles`;
        
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Filtrage des rôles techniques Keycloak
        const technicalRoles = ['offline_access', 'uma_authorization', `default-roles-${realm}`];
        const filteredRoles = response.data.filter(role => !technicalRoles.includes(role.name));
        
        return filteredRoles;
    } catch (err) {
        throw err;
    }
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

/**
 * Recherche un utilisateur par son adresse e-mail.
 */
const findUserByEmail = async (email) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

/**
 * Récupère un utilisateur par son identifiant Keycloak.
 */
const getUserById = async (userIdAuth) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

/**
 * Crée un utilisateur dans Keycloak.
 */
const createUser = async (userData) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users`;
    const response = await axios.post(url, {
        username: userData.username || userData.email,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        enabled: true,
        emailVerified: true
    }, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.headers.location) {
        return response.headers.location.split('/').pop();
    } else {
        const users = await findUserByEmail(userData.email);
        if (users && users.length > 0) {
            return users[0].id;
        }
        throw new Error("Impossible de récupérer l'ID de l'utilisateur Keycloak créé.");
    }
};

/**
 * Envoie un e-mail à l'utilisateur pour définir ou réinitialiser son mot de passe.
 */
const sendResetPasswordEmail = async (userIdAuth) => {
    const token = await getAdminToken();
    const url = `${authServerUrl}/admin/realms/${realm}/users/${userIdAuth}/execute-actions-email`;
    await axios.put(url, ['UPDATE_PASSWORD'], {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

module.exports = {
    getAvailableRoles,
    getUserRoles,
    assignUserRoles,
    removeUserRoles,
    findUserByEmail,
    getUserById,
    createUser,
    sendResetPasswordEmail
};
