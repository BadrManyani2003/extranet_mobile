const adminQueries = {
    // Users
    getUsers: "EXEC ps_ManageUser @FK_User_Id=@0, @Token=@1, @Source=@2, @Action='GET', @FilterNom=@3, @FilterNature=@4",
    saveUser: "EXEC ps_ManageUser @FK_User_Id=@0, @Token=@1, @Source=@2, @Action='SAVE', @Id=@3, @Id_Auth=@4, @Nom=@5, @Telephone=@6, @Email=@7, @Nature=@8, @Extranet=@9, @Mobile=@10",
    deleteUser: "EXEC ps_ManageUser @FK_User_Id=@0, @Token=@1, @Source=@2, @Action='DELETE', @Id=@3",
    updateIdAuth: "UPDATE sysUser SET Id_Auth = @1 WHERE Id = @0",
    getUserById: "SELECT * FROM sysUser WHERE Id = @0",

    // Clients
    getClients: "EXEC ps_GetClients @FK_User_Id=@0, @Token=@1, @Source=@2, @RaisonSociale=@3, @Particulier=@4",
    createUserFromClient: "EXEC ps_CreateUserFromEntity @FK_User_Id=@0, @Token=@1, @Source=@2, @EntityType='CLIENT', @EntityId=@3",

    // Adherents
    getAdherents: "EXEC ps_GetAdherents @FK_User_Id=@0, @Token=@1, @Source=@2, @Nom=@3, @Actif=@4",
    createUserFromAdherent: "EXEC ps_CreateUserFromEntity @FK_User_Id=@0, @Token=@1, @Source=@2, @EntityType='ADHERENT', @EntityId=@3"
};

module.exports = adminQueries;
