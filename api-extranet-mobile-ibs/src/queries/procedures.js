const procedures = {
    users: {
        getAll: "exec ps_GetUsers $1, $2, $3",
        save: "exec ps_SaveUser $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11",
        delete: "exec ps_DeleteUser $1, $2, $3, $4"
    },
    clients: {
        getAll: "exec ps_GetClients $1, $2, $3",
        createUser: "exec ps_CreateUserFromClient $1, $2, $3, $4"
    },
    adherents: {
        getAll: "exec sp_GetAdherents $1, $2, $3, $4",
        createUser: "exec ps_CreateUserFromAdherent $1, $2, $3, $4"
    },
    reclamations: {
        getAll: "exec sp_GetReclamations $1, $2, $3",
        getDetails: "exec sp_GetReclamationDetails $1, $2, $3, $4",
        create: "exec sp_CreateReclamation $1, $2, $3, $4, $5, $6",
        addMessage: "exec sp_AddMessageReclamation $1, $2, $3, $4, $5, $6",
        updateStatut: "exec sp_UpdateReclamationStatus $1, $2, $3, $4, $5",
        delete: "exec sp_DeleteReclamation $1, $2, $3, $4"
    },
    data: {
        getPolices: "exec sp_GetPolices $1, $2, $3",
        getStats: "exec sp_GetStats $1, $2, $3",
        getQuittances: "exec sp_GetQuittances $1, $2, $3, $4"
    }
};

module.exports = procedures;
