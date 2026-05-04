const reclamationQueries = {
    getReclamations: 'EXEC ps_GetReclamationsByUser $1',
    getReclamationDetail: 'EXEC ps_GetReclamationDetail $1',
    createReclamation: 'DECLARE @NewId INT; EXEC ps_CreateReclamation $1, $2, $3, @NewId OUTPUT; SELECT @NewId AS NewId;',
    addMessage: 'EXEC ps_AddMessageReclamation $1, $2, $3, $4',
    updateStatut: 'EXEC ps_UpdateStatutReclamation $1, $2',
    deleteReclamation: 'EXEC ps_DeleteReclamation $1'
};

module.exports = reclamationQueries;

