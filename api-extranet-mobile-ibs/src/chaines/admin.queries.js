const adminQueries = {
    // Users
    getUsers: "EXEC ps_GetUsers @FK_User_Id=@0, @Token=@1, @Source=@2",
    saveUser: "EXEC ps_SaveUser @FK_User_Id=@0, @Token=@1, @Source=@2, @FK_Target_Id=@3, @Id_Auth=@4, @Nom=@5, @Telephone=@6, @Email=@7, @Nature=@8, @Extranet=@9, @Mobile=@10",
    deleteUser: "EXEC ps_DeleteUser @FK_User_Id=@0, @Token=@1, @Source=@2, @FK_Delete_Id=@3",
    updateIdAuth: "UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0",
    getUserById: "SELECT * FROM sysUser WHERE Id = @0",

    // Clients
    getClients: "EXEC ps_GetClients @FK_User_Id=@0, @Token=@1, @Source=@2",
    createUserFromClient: "EXEC ps_CreateUserFromClient @FK_User_Id=@0, @Token=@1, @Source=@2, @FK_Client_Id=@3",

    // Adherents
    getAdherents: "EXEC ps_GetAdherents @FK_User_Id=@0, @Token=@1, @Source=@2",
    createUserFromAdherent: "EXEC ps_CreateUserFromAdherent @FK_User_Id=@0, @Token=@1, @Source=@2, @FK_Adherent_Id=@3"
};

module.exports = adminQueries;
