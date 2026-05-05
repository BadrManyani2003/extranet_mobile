const dataQueries = {
    getPolices: 'EXEC ps_GetPolices @FK_User_Id=$1, @Token=$2, @Source=$3',
    getQuittances: 'EXEC ps_GetQuittances @FK_User_Id=$1, @Token=$2, @Source=$3',
    getSinistres: 'EXEC ps_GetSinistres @FK_User_Id=$1, @Token=$2, @Source=$3',
    getAdherents: 'EXEC ps_GetAdherents @FK_User_Id=$1, @Token=$2, @Source=$3',
    getRisques: 'EXEC ps_GetRisques @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Police_Id=$4',
    getStats: 'EXEC ps_GetStats @FK_User_Id=$1, @Token=$2, @Source=$3',
    getStatsByPolice: 'EXEC ps_GetStatsByPolice @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Police_Id=$4',
    getAdherentDetails: 'EXEC ps_GetAdherentDetails @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Adherent_Id=$4',
    getPolicesParent: 'EXEC ps_GetPolicesParent @FK_User_Id=$1, @Token=$2, @Source=$3',
    getQuittancesByPolice: 'EXEC ps_GetQuittancesByPolice @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Police_Id=$4',
    getSinistresByPolice: 'EXEC ps_GetSinistresByPolice @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Police_Id=$4',
    getReclamationsByUser: 'EXEC ps_GetReclamations @FK_User_Id=$1, @Token=$2, @Source=$3'
};

module.exports = dataQueries;
