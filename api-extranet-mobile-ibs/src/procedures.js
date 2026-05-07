
module.exports = {
    auth: {
        getMe:        'ps_GetUsers'
    },
    data: {
        polices:      'sp_GetPolices',
        stats:        'sp_GetStats',
        quittances:   'sp_GetQuittances',
        sinistres:    'sp_GetSinistres',
        risques:      'sp_GetRisques',
        adherents:    'sp_GetAdherents',
        garanties:    'sp_GetGarantiesByRisque'
    },
    reclamations: {
        getAll:       'sp_GetReclamations',
        getDetail:    'sp_GetReclamationDetails',
        create:       'sp_CreateReclamation',
        addMessage:   'sp_AddMessageReclamation',
        updateStatut: 'sp_UpdateReclamationStatus',
        delete:       'sp_DeleteReclamation'
    },
    admin: {
        getUsers:               'ps_GetUsers',
        saveUser:               'ps_SaveUser',
        deleteUser:             'ps_DeleteUser',
        getClients:             'ps_GetClients',
        createUserFromClient:   'ps_CreateUserFromClient',
        getAdherents:           'sp_GetAdherents',
        createUserFromAdherent: 'ps_CreateUserFromAdherent'
    }
};
