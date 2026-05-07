/**
 * controllers/admin.controller.js
 * Administration : utilisateurs, clients, adhérents.
 */

const { execSP, getConfig, ok, fail } = require('../common');
const proc = require('../procedures');
const kc   = require('../services/keycloak.service');
const { poolPromise } = require('../config/db');

// POST /api/admin/users
const getUsers = async (req, res) => {
    try { 
        const data = await execSP(proc.admin.getUsers, getConfig(req));
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/users/save
const saveUser = async (req, res) => {
    try {
        const { Id = 0, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile } = req.body;
        const data = await execSP(proc.admin.saveUser, { 
            ...getConfig(req), 
            Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/users/delete
const deleteUser = async (req, res) => {
    try {
        const { Id = 0 } = req.body;
        const data = await execSP(proc.admin.deleteUser, { 
            ...getConfig(req), 
            FK_User_Id_To_Delete: Id 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/users/sync-keycloak
const syncKeycloak = async (req, res) => {
    try {
        const { Id = 0 } = req.body;
        const pool = await poolPromise;
        
        // Use parameterized query instead of raw string
        const result = await pool.request()
            .input('Id', Id)
            .query('SELECT * FROM sysUser WHERE Id = @Id');
            
        const users = result.recordset;
        if (!users.length) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

        const user = users[0];
        if (user.Id_Auth) return ok(res, { keycloakId: user.Id_Auth });

        const token      = await kc.getAdminToken();
        const keycloakId = await kc.createUser(token, user);

        if (keycloakId) {
            await pool.request()
                .input('keycloakId', keycloakId)
                .input('Id', Id)
                .query('UPDATE sysUser SET Id_Auth=@keycloakId WHERE Id=@Id');
        }

        ok(res, { keycloakId });
    } catch (err) { fail(res, err); }
};

// POST /api/admin/clients
const getClients = async (req, res) => {
    try { 
        const data = await execSP(proc.admin.getClients, getConfig(req));
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/clients/create-user
const createUserFromClient = async (req, res) => {
    try {
        const { FK_Client_Id = 0 } = req.body;
        const data = await execSP(proc.admin.createUserFromClient, { 
            ...getConfig(req), 
            FK_Client_Id 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/adherents
const getAdherents = async (req, res) => {
    try {
        const data = await execSP(proc.admin.getAdherents, { 
            ...getConfig(req), 
            FK_Police_Id: 0 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

// POST /api/admin/adherents/create-user
const createUserFromAdherent = async (req, res) => {
    try {
        const { FK_Adherent_Id = 0 } = req.body;
        const data = await execSP(proc.admin.createUserFromAdherent, { 
            ...getConfig(req), 
            FK_Adherent_Id 
        });
        ok(res, data);
    } catch (err) { fail(res, err); }
};

module.exports = {
    getUsers, saveUser, deleteUser, syncKeycloak,
    getClients, createUserFromClient,
    getAdherents, createUserFromAdherent
};
