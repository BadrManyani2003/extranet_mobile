const db = require('../utils/db');
const response = require('../utils/response');
const { formatPolices, formatAdherents, formatRisques } = require('../utils/formatters');

const getCommonParams = (req) => ({
    FK_User_Id: req.user?.id || req.body.userId || 1,
    Token: req.headers.authorization?.split(' ')[1] || '',
    Source: req.headers['x-source'] || 'Mobile'
});

// Helper formatting logic moved to ../utils/formatters.js for clarity

const getPolices = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const polices = await db.execute('ps_GetPolices', { ...common });
        const enriched = await formatPolices(common, polices);
        response.success(res, enriched);
    } catch (error) { response.error(res, error); }
};

const getGlobalStats = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const stats = await db.execute('ps_GetStats', { ...common });
        const s = stats[0] || {};
        response.success(res, [
            { id: 1, title: 'total_policies', value: s.TotalPolices?.toString() || '0', change: '+2%', icon: 'ShieldCheck', color: 'text-slate-900', bg: 'bg-slate-100' },
            { id: 2, title: 'pending_claims', value: s.SinistresEnCours?.toString() || '0', change: '0%', icon: 'Activity', color: 'text-slate-600', bg: 'bg-slate-50' },
            { id: 3, title: 'total_unpaid', value: `${(s.TotalImpayes || 0).toLocaleString()} MAD`, change: '-5%', icon: 'AlertCircle', color: 'text-slate-900', bg: 'bg-slate-200' }
        ]);
    } catch (error) { response.error(res, error); }
};

const getUnpaid = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetQuittances', { ...common });
        const unpaid = data.filter(q => q.Solde > 0).map((q, idx) => ({
            id: idx + 1,
            police: q.NumeroPolice,
            branche: q.Branche,
            numero: q.NumQuittance,
            montantImpaye: q.Solde
        }));
        response.success(res, unpaid);
    } catch (error) { response.error(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetReclamations', { ...common });
        response.success(res, data.map(r => ({
            id: r.IdReclamation,
            sujet: r.Sujet,
            date: r.DateReclamation,
            statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
            nature: r.Nature,
            count: r.NombreMessages
        })));
    } catch (error) { response.error(res, error); }
};

const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetReclamationDetails', { ...common, FK_Reclamation_Id: id });
        response.success(res, data.map(m => ({
            id: m.IdMessage,
            text: m.Message,
            sender: m.NatureMessage === 'C' ? 'user' : 'admin',
            time: m.DateMessage ? new Date(m.DateMessage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
        })));
    } catch (error) { response.error(res, error); }
};

const createReclamation = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { sujet, nature, message } = req.body;
        const result = await db.execute('ps_CreateReclamation', { ...common, Sujet: sujet, Nature: nature });
        const newId = result[0].NewId;
        
        if (message) {
            await db.execute('ps_AddMessageReclamation', { ...common, FK_Reclamation_Id: newId, NatureMessage: 'C', Message: message });
        }
        response.success(res, { id: newId }, 'Réclamation créée avec succès.');
    } catch (error) { response.error(res, error); }
};

const sendMessage = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { id } = req.params;
        const { message } = req.body;
        await db.execute('ps_AddMessageReclamation', { ...common, FK_Reclamation_Id: id, NatureMessage: 'C', Message: message });
        response.success(res, null, 'Message envoyé.');
    } catch (error) { response.error(res, error); }
};

module.exports = { getPolices, getGlobalStats, getUnpaid, getReclamations, getMessages, createReclamation, sendMessage };
