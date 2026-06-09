const documentService = require('../services/document.service');
const { success }     = require('../common/response');
const asyncHandler    = require('../middleware/asyncHandler');

const getContext = (req) => ({
    userId: req.user.id,
    token:  req.user.token,
    source: req.headers['x-source'] || 'E'
});

/**
 * POST /api/documents/upload
 * Corps : { nature, identifiant, type, fileBase64, fileName }
 * Accessible à tous les rôles authentifiés (client, adherent, expert, admin).
 */
const uploadDocument = asyncHandler(async (req, res) => {
    const { userId, token } = getContext(req);
    const { nature, identifiant, type, fileBase64 } = req.body;

    if (!nature || !identifiant || !type || !fileBase64) {
        throw new Error('Paramètres manquants : nature, identifiant, type et fileBase64 sont requis.');
    }

    // Décoder le base64 en Buffer binaire
    const documentBuffer = Buffer.from(fileBase64, 'base64');

    // Limiter la taille à 20 Mo
    if (documentBuffer.length > 20 * 1024 * 1024) {
        throw new Error('Le fichier dépasse la taille maximale autorisée (20 Mo).');
    }

    const result = await documentService.upload(userId, token, nature, parseInt(identifiant), type, documentBuffer);
    success(res, result[0]?.[0] || {}, 'Document chargé avec succès');
});

/**
 * POST /api/documents/list
 * Corps : { nature?, identifiant?, dateFrom?, dateTo? }
 * Accessible aux rôles admin_cabinet et commercial_cabinet uniquement.
 */
const getDocuments = asyncHandler(async (req, res) => {
    const { userId, token, source } = getContext(req);
    const { nature, identifiant, dateFrom, dateTo } = req.body;

    const result = await documentService.getDocuments(userId, token, source, nature, identifiant, dateFrom, dateTo);
    success(res, result[0] || []);
});

/**
 * POST /api/documents/view
 * Corps : { documentId }
 * Retourne le contenu binaire encodé en base64 pour l'affichage frontend.
 */
const getDocumentById = asyncHandler(async (req, res) => {
    const { userId, token, source } = getContext(req);
    const { documentId } = req.body;

    if (!documentId) throw new Error('documentId manquant.');

    const result = await documentService.getDocumentById(userId, token, source, documentId);
    const doc = result[0]?.[0];

    if (!doc) throw new Error('Document introuvable.');

    // Convertir le Buffer VARBINARY en base64 pour le frontend
    const docWithBase64 = {
        ...doc,
        document: doc.document ? doc.document.toString('base64') : null
    };

    success(res, docWithBase64);
});

/**
 * POST /api/documents/delete
 * Corps : { documentId }
 * Accessible aux rôles admin_cabinet et commercial_cabinet uniquement.
 */
const deleteDocument = asyncHandler(async (req, res) => {
    const { userId, token, source } = getContext(req);
    const { documentId } = req.body;

    if (!documentId) throw new Error('documentId manquant.');

    await documentService.deleteDocument(userId, token, source, documentId);
    success(res, null, 'Document supprimé avec succès');
});

module.exports = { uploadDocument, getDocuments, getDocumentById, deleteDocument };
