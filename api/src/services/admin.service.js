const db             = require('./db.service');
const qry            = require('../sql/qryExtranet');
const keycloakService = require('./keycloak.service');

const getUsers  = (userId, token, source) => db.execute(qry.getUsers, [userId, token, source]);
const saveUser  = (userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile) =>
    db.execute(qry.saveUser, [userId, token, source, targetId, authId, nom, tel, email, nature, extranet, mobile]);

const deleteUser = async (userId, token, source, deleteId) => {
    const userResult = await db.execute("SELECT Id_Auth FROM dbo.sysUser WHERE Id = @0", [deleteId]);
    const user = userResult[0]?.[0];

    await db.execute(qry.deleteUser, [userId, token, source, deleteId]);

    if (user?.Id_Auth?.trim()) {
        try {
            await keycloakService.deleteUser(user.Id_Auth);
        } catch (err) {
            console.error(`[Keycloak] Erreur suppression utilisateur ${user.Id_Auth}:`, err.message);
        }
    }
};

const getClients           = (userId, token, source) => db.execute(qry.getClients, [userId, token, source]);
const createUserFromClient = (userId, token, source, clientId) => db.execute(qry.createUserFromClient, [userId, token, source, clientId]);
const getAdherents         = (userId, source, token, policeId) => db.execute(qry.getAdherentsAdmin, [userId, source, token, policeId]);
const createUserFromAdherent = (userId, token, source, adherentId) => db.execute(qry.createUserFromAdherent, [userId, token, source, adherentId]);

const resolveOrCreateKeycloakUser = async (Nom, Email) => {
    const existing = await keycloakService.findUserByEmail(Email);
    if (existing?.length > 0) return existing[0].id;

    const nameParts = Nom.trim().split(/\s+/);
    const id = await keycloakService.createUser({
        email:     Email,
        username:  Email,
        firstName: nameParts[0] || '',
        lastName:  nameParts.slice(1).join(' ') || ''
    });
    try {
        await keycloakService.sendResetPasswordEmail(id);
    } catch (err) {
        console.error("[Keycloak] Impossible d'envoyer l'email d'activation:", err.message);
    }
    return id;
};

const syncKeycloak = async (userId, token, source, id) => {
    const userResult = await db.execute("SELECT Nom, Email, Id_Auth FROM dbo.sysUser WHERE Id = @0", [id]);
    const userToSync = userResult[0]?.[0];

    if (!userToSync) throw new Error("Utilisateur local introuvable.");

    const { Nom, Email, Id_Auth } = userToSync;
    if (!Email) throw new Error("L'utilisateur n'a pas d'adresse e-mail configurée.");

    let keycloakUserId = Id_Auth;

    if (!keycloakUserId?.trim()) {
        keycloakUserId = await resolveOrCreateKeycloakUser(Nom, Email);
    } else {
        try {
            const kcUser = await keycloakService.getUserById(keycloakUserId);
            if (!kcUser) {
                keycloakUserId = await resolveOrCreateKeycloakUser(Nom, Email);
            }
        } catch {
            const found = await keycloakService.findUserByEmail(Email);
            if (found?.length > 0) keycloakUserId = found[0].id;
        }
    }

    await db.execute(qry.syncKeycloak, [userId, token, source, id, keycloakUserId]);
    return { success: true, keycloakUserId };
};

const linkUserToClient       = (userId, token, source, targetUserId, clientId)  => db.execute(qry.linkUserToClient, [userId, token, source, targetUserId, clientId]);
const unlinkUserFromClient   = (userId, token, source, targetUserId, clientId)  => db.execute(qry.unlinkUserFromClient, [userId, token, source, targetUserId, clientId]);
const linkUserToAdherent     = (userId, token, source, targetUserId, adherentId) => db.execute(qry.linkUserToAdherent, [userId, token, source, targetUserId, adherentId]);
const updateClientOptions    = (userId, token, source, clientId, recClt, recAdh) => db.execute(qry.updateClientOptions, [userId, token, source, clientId, recClt, recAdh]);
const getAvailableRoles      = () => keycloakService.getAvailableRoles();

const updateUserRoles = async (userId, token, source, targetUserId, authId, roles) => {
    const currentRoles = await keycloakService.getUserRoles(authId);
    if (currentRoles.length > 0) await keycloakService.removeUserRoles(authId, currentRoles);
    if (roles.length > 0)        await keycloakService.assignUserRoles(authId, roles);

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
