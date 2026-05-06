const common = require('../utils/common');
const response = require('../utils/response');
const keycloakService = require('../services/keycloak.service');
const db = require('../utils/db');

const getConfig = (req) => ({
    Source: (req.body.Source || req.headers['x-source'] || 'C').charAt(0).toUpperCase(),
    Token: req.body.Token || req.headers.authorization?.split(' ')[1] || ''
});

const getUsers = async (req, res) => {
    try {
        const data = req.body;
        const users = await common.executeps('ps_GetUsers', data, getConfig(req));
        response.success(res, users);
    } catch (error) { response.error(res, error); }
};

const saveUser = async (req, res) => {
    try {
        const data = { 
            ...req.body, 
            FK_Target_Id: req.body.Id || 0 
        };
        await common.executeps('ps_SaveUser', data, getConfig(req));
        response.success(res, null, 'Utilisateur enregistré.');
    } catch (error) { response.error(res, error); }
};

const deleteUser = async (req, res) => {
    try {
        const data = { FK_Delete_Id: req.body.Id || req.body.id };
        await common.executeps('ps_DeleteUser', data, getConfig(req));
        response.success(res, null, 'Utilisateur supprimé.');
    } catch (error) { response.error(res, error); }
};

const syncKeycloak = async (req, res) => {
    try {
        const targetId = req.body.Id || req.body.id;
        const users = await db.query('SELECT * FROM sysUser WHERE Id = @0', [targetId]);
        if (!users.length) return response.error(res, 'Utilisateur non trouvé', 404);
        
        const user = users[0];
        if (user.Id_Auth) return response.success(res, { keycloakId: user.Id_Auth });

        const token = await keycloakService.getAdminToken();
        const keycloakId = await keycloakService.createUser(token, user);

        if (keycloakId) {
            await db.query('UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0', [targetId, keycloakId]);
            response.success(res, { keycloakId });
        } else {
            throw new Error('Sync failed');
        }
    } catch (error) { response.error(res, error); }
};

const getClients = async (req, res) => {
    try {
        const data = req.body;
        const clients = await common.executeps('ps_GetClients', data, getConfig(req));
        response.success(res, clients);
    } catch (error) { response.error(res, error); }
};

const createUserFromClient = async (req, res) => {
    try {
        const data = { FK_Client_Id: req.body.clientId || req.body.Id };
        const result = await common.executeps('ps_CreateUserFromClient', data, getConfig(req));
        response.success(res, result[0]);
    } catch (error) { response.error(res, error); }
};

const getAdherents = async (req, res) => {
    try {
        const data = { FK_Police_Id: 0, ...req.body };
        const adherents = await common.executeps('sp_GetAdherents', data, getConfig(req));
        response.success(res, adherents);
    } catch (error) { response.error(res, error); }
};

const createUserFromAdherent = async (req, res) => {
    try {
        const data = { FK_Adherent_Id: req.body.adherentId || req.body.Id };
        const result = await common.executeps('ps_CreateUserFromAdherent', data, getConfig(req));
        response.success(res, result[0]);
    } catch (error) { response.error(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const data = req.body;
        const reclamations = await common.executeps('sp_GetReclamations', data, getConfig(req));
        response.success(res, reclamations.map(r => ({
            id: r.Id,
            sujet: r.Sujet,
            client: r.Client,
            date: r.DateReclamation,
            statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
            nature: r.Nature
        })));
    } catch (error) { response.error(res, error); }
};

const sendReply = async (req, res) => {
    try {
        const { id, Id, message } = req.body;
        const targetId = id || Id;
        const config = getConfig(req);
        await common.executeps('sp_AddMessageReclamation', { FK_Reclamation_Id: targetId, Nature: 'A', Message: message }, config);
        await common.executeps('sp_UpdateReclamationStatus', { FK_Reclamation_Id: targetId, Statut: 'T' }, config);
        response.success(res, null, 'Réponse envoyée.');
    } catch (error) { response.error(res, error); }
};

module.exports = {
    getUsers, saveUser, deleteUser, syncKeycloak,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent,
    getReclamations, sendReply
};
