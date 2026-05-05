const reclamationQueries = {
    getReclamations: 'EXEC ps_GetReclamations @FK_User_Id=$1, @Token=$2, @Source=$3',
    getReclamationDetails: 'EXEC ps_GetReclamationDetails @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Reclamation_Id=$4',
    createReclamation: 'EXEC ps_CreateReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @Sujet=$4, @Nature=$5',
    addMessage: 'EXEC ps_AddMessageReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Reclamation_Id=$4, @Message=$5, @NatureMessage=$6',
    updateStatut: 'EXEC ps_UpdateStatutReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Reclamation_Id=$4, @NouveauStatut=$5',
    deleteReclamation: 'EXEC ps_DeleteReclamation @FK_User_Id=$1, @Token=$2, @Source=$3, @FK_Reclamation_Id=$4'
};

module.exports = reclamationQueries;
