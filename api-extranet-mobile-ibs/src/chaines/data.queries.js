const dataQueries = {
    getPolices: 'EXEC ps_GetPolicesByUser $1',
    getQuittances: 'EXEC ps_GetQuittancesByUser $1',
    getSinistres: 'EXEC ps_GetSinistresByUser $1',
    getAdherents: 'EXEC ps_GetAdherentsByUser $1',
    getRisques: 'EXEC ps_GetRisquesByPolice $1',
    getStats: 'EXEC ps_GetStatsByPolice $1',
    getPersACharge: 'EXEC ps_GetPersAChargeByAdherent $1',
    getPolicesParent: 'EXEC ps_GetPolicesByClientParent $1',
    getQuittancesByPolice: 'EXEC ps_GetQuittancesByPolice $1',
    getSinistresByPolice: 'EXEC ps_GetSinistresByPolice $1',
    getGlobalStats: 'EXEC ps_GetGlobalStatsByUser $1',
    getReclamationsByUser: 'EXEC ps_GetReclamationsByUser $1'
};

module.exports = dataQueries;

