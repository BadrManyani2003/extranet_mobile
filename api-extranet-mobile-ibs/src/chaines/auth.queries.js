const authQueries = {
    getUserByEmail: 'SELECT * FROM sysUser WHERE Email = $1',
    getUserById: 'SELECT * FROM sysUser WHERE Id = $1'
};

module.exports = authQueries;
