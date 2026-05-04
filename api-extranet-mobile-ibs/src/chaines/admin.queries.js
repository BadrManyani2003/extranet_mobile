const adminQueries = {
    // Users
    getUsers: "EXEC ps_GetUsers @0, @1",
    saveUser: "EXEC ps_SaveUser @0, @1, @2, @3, @4, @5, @6, @7",
    deleteUser: "EXEC ps_DeleteUser @0",
    updateIdAuth: "UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0",
    getUserById: "SELECT * FROM sysUser WHERE Id = @0",

    // Clients
    getClients: "EXEC ps_GetClients @0, @1",
    createUserFromClient: "EXEC ps_CreateUserFromClient @0",

    // Adherents
    getAdherents: "EXEC ps_GetAdherents @0, @1",
    createUserFromAdherent: "EXEC ps_CreateUserFromAdherent @0"
};

module.exports = adminQueries;
