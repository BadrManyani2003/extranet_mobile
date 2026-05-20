const db = require('./db.service');
const qry = require('../sql/qryExtranet');
const keycloakService = require('./keycloak.service');

const getUsers = (userId, token, source) => db.execute(qry.getUsers, [userId, token, source]);

const saveUser = (userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile) => 
    db.execute(qry.saveUser, [userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile]);

const deleteUser = (userId, token, source, deleteId) => db.execute(qry.deleteUser, [userId, token, source, deleteId]);

const getClients = (userId, token, source) => db.execute(qry.getClients, [userId, token, source]);

const createUserFromClient = (userId, token, source, clientId) => db.execute(qry.createUserFromClient, [userId, token, source, clientId]);

const getAdherents = (userId, source, token, policeId) => db.execute(qry.getAdherentsAdmin, [userId, source, token, policeId]);

const createUserFromAdherent = (userId, token, source, adherentId) => db.execute(qry.createUserFromAdherent, [userId, token, source, adherentId]);
const syncKeycloak = async (userId, token, source, id) => {
    // 1. Récupérer l'utilisateur depuis la base locale
    const userResult = await db.execute("SELECT Nom, Email, Id_Auth FROM dbo.sysUser WHERE Id = @0", [id]);
    const userToSync = userResult[0]?.[0];
    
    if (!userToSync) {
        throw new Error("Utilisateur local introuvable.");
    }

    const { Nom, Email, Id_Auth } = userToSync;
    if (!Email) {
        throw new Error("L'utilisateur n'a pas d'adresse e-mail configurée.");
    }

    let keycloakUserId = Id_Auth;

    // 2. Rechercher l'utilisateur sur Keycloak si non lié ou vide
    if (!keycloakUserId || keycloakUserId.trim() === '') {
        const keycloakUsers = await keycloakService.findUserByEmail(Email);
        if (keycloakUsers && keycloakUsers.length > 0) {
            keycloakUserId = keycloakUsers[0].id;
        } else {
            // 3. L'utilisateur n'existe pas sur Keycloak, le créer
            const nameParts = Nom.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            keycloakUserId = await keycloakService.createUser({
                email: Email,
                username: Email,
                firstName: firstName,
                lastName: lastName
            });

            // Envoyer l'email d'initialisation de mot de passe
            try {
                await keycloakService.sendResetPasswordEmail(keycloakUserId);
            } catch (err) {
                console.error("[Keycloak] Impossible d'envoyer l'email d'activation :", err.message);
            }
        }
    } else {
        // L'utilisateur est déjà lié dans notre base, vérifier s'il existe toujours dans Keycloak
        try {
            const kcUser = await keycloakService.getUserById(keycloakUserId);
            if (!kcUser) {
                // S'il a été supprimé sur Keycloak, refaire une recherche par email ou le recréer
                const keycloakUsers = await keycloakService.findUserByEmail(Email);
                if (keycloakUsers && keycloakUsers.length > 0) {
                    keycloakUserId = keycloakUsers[0].id;
                } else {
                    const nameParts = Nom.trim().split(/\s+/);
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(" ") || "";
                    keycloakUserId = await keycloakService.createUser({
                        email: Email,
                        username: Email,
                        firstName: firstName,
                        lastName: lastName
                    });
                    try {
                        await keycloakService.sendResetPasswordEmail(keycloakUserId);
                    } catch (err) {
                        console.error("[Keycloak] Impossible d'envoyer l'email d'activation :", err.message);
                    }
                }
            }
        } catch (err) {
            // En cas d'erreur de récupération par ID, essayer par e-mail
            const keycloakUsers = await keycloakService.findUserByEmail(Email);
            if (keycloakUsers && keycloakUsers.length > 0) {
                keycloakUserId = keycloakUsers[0].id;
            }
        }
    }

    // 4. Mettre à jour l'utilisateur local dans la base de données
    await db.execute(qry.syncKeycloak, [userId, token, source, id, keycloakUserId]);
    
    return { success: true, keycloakUserId };
};
const linkUserToClient = (userId, token, source, targetUserId, clientId) => db.execute(qry.linkUserToClient, [userId, token, source, targetUserId, clientId]);
const unlinkUserFromClient = (userId, token, source, targetUserId, clientId) => db.execute(qry.unlinkUserFromClient, [userId, token, source, targetUserId, clientId]);
const linkUserToAdherent = (userId, token, source, targetUserId, adherentId) => db.execute(qry.linkUserToAdherent, [userId, token, source, targetUserId, adherentId]);
const updateClientOptions = (userId, token, source, clientId, recClt, recAdh) => db.execute(qry.updateClientOptions, [userId, token, source, clientId, recClt, recAdh]);

const getAvailableRoles = () => keycloakService.getAvailableRoles();

const updateUserRoles = async (userId, token, source, targetUserId, authId, roles) => {
    // 1. Synchronisation Keycloak
    const currentRoles = await keycloakService.getUserRoles(authId);
    if (currentRoles.length > 0) await keycloakService.removeUserRoles(authId, currentRoles);
    if (roles.length > 0) await keycloakService.assignUserRoles(authId, roles);

    // 2. Synchronisation BDD
    const rolesCSV = roles.map(r => r.name).join(',');
    return db.execute(qry.updateUserRoles, [userId, token, source, targetUserId, rolesCSV]);
};

module.exports = {
    getUsers,
    saveUser,
    deleteUser,
    getClients,
    createUserFromClient,
    getAdherents,
    createUserFromAdherent,
    syncKeycloak,
    linkUserToClient,
    unlinkUserFromClient,
    linkUserToAdherent,
    getAvailableRoles,
    updateUserRoles,
    updateClientOptions
};
