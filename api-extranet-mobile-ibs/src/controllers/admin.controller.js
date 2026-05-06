const db = require('../utils/db');
const response = require('../utils/response');
const keycloakService = require('../services/keycloak.service');

const getCommonParams = (req) => ({
    FK_User_Id: req.user?.id || 1,
    Token: req.headers.authorization?.split(' ')[1] || '',
    Source: req.headers['x-source'] || 'Cabinet'
});

const getUsers = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetUsers', { ...common });
        response.success(res, data);
    } catch (error) { response.error(res, error); }
};

const saveUser = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile } = req.body;
        await db.execute('ps_SaveUser', { 
            ...common, 
            FK_Target_Id: Id || 0, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile 
        });
        response.success(res, null, 'Utilisateur enregistré.');
    } catch (error) { response.error(res, error); }
};

const deleteUser = async (req, res) => {
    try {
        const common = getCommonParams(req);
        await db.execute('ps_DeleteUser', { ...common, FK_Delete_Id: req.body.id });
        response.success(res, null, 'Utilisateur supprimé.');
    } catch (error) { response.error(res, error); }
};

const syncKeycloak = async (req, res) => {
    try {
        const { id } = req.body;
        const users = await db.query('SELECT * FROM sysUser WHERE Id = @0', [id]);
        
        if (!users.length) return res.status(404).json({ message: 'Non trouvé.' });
        
        const user = users[0];
        if (user.Id_Auth) return response.success(res, { keycloakId: user.Id_Auth });

        const token = await keycloakService.getAdminToken();
        const keycloakId = await keycloakService.createUser(token, user);

        if (keycloakId) {
            await db.query('UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0', [id, keycloakId]);
            response.success(res, { keycloakId });
        } else {
            throw new Error('Sync failed');
        }
    } catch (error) { response.error(res, error); }
};

const getClients = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetClients', { ...common });
        response.success(res, data);
    } catch (error) { response.error(res, error); }
};

const createUserFromClient = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_CreateUserFromClient', { 
            ...common, FK_Client_Id: req.body.clientId 
        });
        response.success(res, data[0]);
    } catch (error) { response.error(res, error); }
};

const getAdherents = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetAdherents', { ...common });
        response.success(res, data);
    } catch (error) { response.error(res, error); }
};

const createUserFromAdherent = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_CreateUserFromAdherent', { 
            ...common, FK_Adherent_Id: req.body.adherentId 
        });
        response.success(res, data[0]);
    } catch (error) { response.error(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const common = getCommonParams(req);
        // Using stored procedure for consistency
        const data = await db.execute('ps_GetReclamations', { ...common });
        response.success(res, data.map(r => ({
            id: r.IdReclamation,
            sujet: r.Sujet,
            date: r.DateReclamation,
            statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
            nature: r.Nature,
            count: r.NombreMessages
        })));
    } catch (error) { response.error(res, error); }
};

const sendReply = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { id, message } = req.body;
        await db.execute('ps_AddMessageReclamation', { 
            ...common,
            FK_Reclamation_Id: id, 
            NatureMessage: 'A', 
            Message: message 
        });
        await db.execute('ps_UpdateStatutReclamation', { 
            ...common,
            FK_Reclamation_Id: id, 
            NouveauStatut: 'T' 
        });
        response.success(res, null, 'Réponse envoyée.');
    } catch (error) { response.error(res, error); }
};

module.exports = {
    getUsers, saveUser, deleteUser, syncKeycloak,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent,
    getReclamations, sendReply
};

