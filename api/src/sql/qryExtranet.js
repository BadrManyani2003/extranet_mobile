const qry = {

    getPolices:           "exec dbo.sp_GetPolices           @0, @1, @2",
    getSinistres:         "exec dbo.sp_GetSinistres         @0, @1, @2, @3",
    getSinistresEnCours:  "exec dbo.sp_GetSinistresEncour   @0, @1, @2, @3",
    getRisques:           "exec dbo.sp_GetRisques           @0, @1, @2, @3",
    getQuittances:        "exec dbo.sp_GetQuittances        @0, @1, @2, @3",
    getImpayes:           "exec dbo.sp_GetImpayes           @0, @1, @2, @3, @4",
    getAdherents:         "exec dbo.sp_GetAdherents         @0, @1, @2, @3",
    getPersACharge:       "exec dbo.sp_GetPersACharge       @0, @1, @2, @3",
    getGarantiesByRisque: "exec dbo.sp_GetGarantiesByRisque @0, @1, @2, @3",
    getStats:             "exec dbo.sp_GetStats             @0, @1, @2",
    getStatsByPolice:     "exec dbo.ps_GetStatsByPolice     @0, @1, @2, @3",
    getDocumentsByPolice: "exec dbo.sp_GetDocumentsByPolice @0, @1, @2, @3",

    getReclamations:       "exec dbo.sp_GetReclamations          @0, @1, @2",
    getReclamationDetails: "exec dbo.sp_GetReclamationDetails    @0, @1, @2, @3",
    createReclamation:     "exec dbo.sp_CreateReclamation        @0, @1, @2, @3, @4, @5",
    addMessageReclamation: "exec dbo.sp_AddMessageReclamation    @0, @1, @2, @3, @4, @5",
    updateReclamationStatut:"exec dbo.sp_UpdateReclamationStatus @0, @1, @2, @3, @4",
    deleteReclamation:     "exec dbo.sp_DeleteReclamation        @0, @1, @2, @3",
    deleteMessageReclamation: "exec dbo.sp_DeleteMessageReclamation @0, @1, @2",
    getReclamationStatut:  "exec dbo.sp_GetReclamationStatut @0",

    getUsers:              "exec dbo.ps_GetUsers              @0, @1, @2",
    saveUser:              "exec dbo.ps_SaveUser              @0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10",
    deleteUser:            "exec dbo.ps_DeleteUser            @0, @1, @2, @3",
    getClients:            "exec dbo.ps_GetClients            @0, @1, @2",
    createUserFromClient:  "exec dbo.ps_CreateUserFromClient  @0, @1, @2, @3",
    getAdherentsAdmin:     "exec dbo.sp_GetAdherents          @0, @1, @2, @3",
    createUserFromAdherent:"exec dbo.ps_CreateUserFromAdherent @0, @1, @2, @3",
    syncKeycloak:          "exec dbo.ps_SyncKeycloak           @0, @1, @2, @3, @4",
    linkUserToClient:      "exec dbo.ps_LinkUserToClient       @0, @1, @2, @3, @4",
    unlinkUserFromClient:    "exec dbo.ps_UnlinkUserFromClient     @0, @1, @2, @3, @4",
    linkUserToAdherent:    "exec dbo.ps_LinkUserToAdherent     @0, @1, @2, @3, @4",
    updateClientOptions:   "exec dbo.ps_UpdateClientOptions    @0, @1, @2, @3, @4, @5",

    updateToken:         "exec dbo.sp_UpdateToken @0, @1",
    getUserInfoByAuthId: "exec dbo.sp_GetUserInfoByAuthId @0",
    getUserByAuthId:     "exec dbo.sp_GetUserByAuthId @0",
    updateUserRoles:     "exec dbo.ps_UpdateUserRoles @0, @1, @2, @3, @4",
};

module.exports = qry;