const reclamationQueries = {
    getReclamations: 'EXEC ps_GetReclamations @FK_User_Id=$1, @Token=$2, @Source=$3',
    getReclamationDetail: 'EXEC ps_GetReclamations @FK_User_Id=$1, @Token=$2, @Source=$3, @IdReclamation=$4',
    createReclamation: 'EXEC ps_ManageReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @Action="CREATE", @Sujet=$4, @Nature=$5',
    addMessage: 'EXEC ps_ManageReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @Action="ADD_MESSAGE", @IdReclamation=$4, @Message=$5, @NatureMessage=$6',
    updateStatut: 'EXEC ps_ManageReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @Action="UPDATE_STATUT", @IdReclamation=$4, @NouveauStatut=$5',
    deleteReclamation: 'EXEC ps_ManageReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @Action="DELETE", @IdReclamation=$4'
};

module.exports = reclamationQueries;

