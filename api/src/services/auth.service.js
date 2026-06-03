const db = require('./db.service');
const qry = require('../sql/qryExtranet');

const getUserByAuthId = (authId) => db.execute(qry.getUserByAuthId, [authId]);
const getUserById = (id) => db.execute("SELECT * FROM dbo.sysUser WHERE Id = @0", [id]);

const getUserInfoByAuthId = (authId) => db.execute(qry.getUserInfoByAuthId, [authId]);

const updateToken = (token, authId) => db.execute(qry.updateToken, [token, authId]);
const updateTokenById = (token, id) => db.execute("UPDATE dbo.sysUser SET token = @0, UpdatedAt = GETDATE() WHERE Id = @1", [token, id]);

const checkSimulationPermission = async (adminId, targetUserId) => {
    const result = await db.execute(`
        SELECT 1 WHERE EXISTS (
            SELECT 1 
            FROM dbo.sysUser targetUser
            LEFT JOIN dbo.UsersXClients uxc ON targetUser.Id = uxc.FK_User_Id AND uxc.Actif = 'O'
            LEFT JOIN dbo.Adherents a ON targetUser.Id = a.FK_User_Id AND a.Actif = 'O'
            LEFT JOIN dbo.Polices p ON a.FK_Police_Id = p.Id
            INNER JOIN dbo.UserSimulationClients usc ON usc.fk_client_id = COALESCE(uxc.FK_Client_Id, p.Fk_Client_Id)
            WHERE targetUser.Id = @0 AND usc.fk_user_id = @1
        )
    `, [targetUserId, adminId]);
    return result[0]?.length > 0;
};

module.exports = {
    getUserByAuthId,
    getUserById,
    getUserInfoByAuthId,
    updateToken,
    updateTokenById,
    checkSimulationPermission
};
