const db = require('../utils/db');
const keycloakService = require('../services/keycloak.service');

const handleError = (res, error) => {
    console.error('API Error:', error.message);
    res.status(500).json({ 
        success: false, 
        message: 'Une erreur technique est survenue.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
};

const getCommonParams = (req) => ({
    FK_User_Id: req.user?.id || 1,
    Token: req.headers.authorization?.split(' ')[1] || '',
    Source: req.headers['x-source'] || 'Cabinet'
});


const getUsers = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { nom = null, nature = null } = req.body;
        const data = await db.execute('ps_ManageUser', { 
            ...common, Action: 'GET', FilterNom: nom, FilterNature: nature 
        });
        res.json({ success: true, data });
    } catch (error) { handleError(res, error); }
};

const saveUser = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile } = req.body;
        await db.execute('ps_ManageUser', { 
            ...common, Action: 'SAVE',
            Id: Id || 0, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile 
        });
        res.json({ success: true, message: 'Utilisateur enregistré.' });
    } catch (error) { handleError(res, error); }
};

const deleteUser = async (req, res) => {
    try {
        const common = getCommonParams(req);
        await db.execute('ps_ManageUser', { ...common, Action: 'DELETE', Id: req.body.id });
        res.json({ success: true, message: 'Utilisateur supprimé.' });
    } catch (error) { handleError(res, error); }
};

const syncKeycloak = async (req, res) => {
    try {
        const { id } = req.body;
        const users = await db.query('SELECT * FROM sysUser WHERE Id = @0', [id]);
        
        if (!users.length) return res.status(404).json({ message: 'Non trouvé.' });
        
        const user = users[0];
        if (user.Id_Auth) return res.json({ success: true, keycloakId: user.Id_Auth });

        const token = await keycloakService.getAdminToken();
        const keycloakId = await keycloakService.createUser(token, user);

        if (keycloakId) {
            await db.query('UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0', [id, keycloakId]);
            res.json({ success: true, keycloakId });
        } else {
            throw new Error('Sync failed');
        }
    } catch (error) { handleError(res, error); }
};


const getClients = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetClients', { 
            ...common,
            RaisonSociale: req.body.nom, 
            Particulier: req.body.particulier 
        });
        res.json({ success: true, data });
    } catch (error) { handleError(res, error); }
};

const createUserFromClient = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_CreateUserFromEntity', { 
            ...common, EntityType: 'CLIENT', EntityId: req.body.clientId 
        });
        res.json({ success: true, data: data[0] });
    } catch (error) { handleError(res, error); }
};


const getAdherents = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetAdherents', { 
            ...common,
            Nom: req.body.nom, 
            Actif: req.body.actif 
        });
        res.json({ success: true, data });
    } catch (error) { handleError(res, error); }
};

const createUserFromAdherent = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_CreateUserFromEntity', { 
            ...common, EntityType: 'ADHERENT', EntityId: req.body.adherentId 
        });
        res.json({ success: true, data: data[0] });
    } catch (error) { handleError(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const data = await db.query(`
            SELECT r.*, u.Nom as ClientNom, 
            (SELECT COUNT(*) FROM ReclamationsDet WHERE FK_Reclamation_Id = r.Id) as NombreMessages
            FROM ReclamationsIdt r
            INNER JOIN sysUser u ON r.FK_User_Client = u.Id
            ORDER BY r.DateReclamation DESC
        `);
        res.json({ 
            success: true, 
            data: data.map(r => ({
                id: r.Id,
                sujet: r.Sujet,
                date: r.DateReclamation,
                statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
                nature: r.Nature,
                client: r.ClientNom,
                count: r.NombreMessages
            }))
        });
    } catch (error) { handleError(res, error); }
};

const sendReply = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { id, message } = req.body;
        await db.execute('ps_ManageReclamation', { 
            ...common,
            Action: 'ADD_MESSAGE',
            IdReclamation: id, 
            NatureMessage: 'A', 
            Message: message 
        });
        await db.execute('ps_ManageReclamation', { 
            ...common,
            Action: 'UPDATE_STATUT',
            IdReclamation: id, 
            NouveauStatut: 'T' 
        });
        res.json({ success: true, message: 'Réponse envoyée.' });
    } catch (error) { handleError(res, error); }
};

module.exports = {
    getUsers, saveUser, deleteUser, syncKeycloak,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent,
    getReclamations, sendReply
};
