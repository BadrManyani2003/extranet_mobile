const common = require('../utils/common');
const response = require('../utils/response');
const { formatPolices } = require('../utils/formatters');

const getConfig = (req) => ({
    Source: (req.body.Source || req.headers['x-source'] || 'M').charAt(0).toUpperCase(),
    Token: req.body.Token || req.headers.authorization?.split(' ')[1] || ''
});

const getPolices = async (req, res) => {
    try {
        const config = getConfig(req);
        const polices = await common.executeps('sp_GetPolices', req.body, config);
        const enriched = await formatPolices({ ...req.body, ...config }, polices);
        response.success(res, enriched);
    } catch (error) { response.error(res, error); }
};

const getGlobalStats = async (req, res) => {
    try {
        const stats = await common.executeps('sp_GetStats', req.body, getConfig(req));
        const s = stats[0] || {};
        response.success(res, [
            { id: 1, title: 'total_policies', value: (s.TotalPolices || 0).toString(), change: '+2%', icon: 'ShieldCheck', color: 'text-slate-900', bg: 'bg-slate-100' },
            { id: 2, title: 'pending_claims', value: (s.SinistresEnCours || 0).toString(), change: '0%', icon: 'Activity', color: 'text-slate-600', bg: 'bg-slate-50' },
            { id: 3, title: 'total_unpaid', value: `${(s.TotalImpayes || 0).toLocaleString()} MAD`, change: '-5%', icon: 'AlertCircle', color: 'text-slate-900', bg: 'bg-slate-200' }
        ]);
    } catch (error) { response.error(res, error); }
};

const getUnpaid = async (req, res) => {
    try {
        const data = await common.executeps('sp_GetQuittances', { FK_Police_Id: 0, ...req.body }, getConfig(req));
        const unpaid = data.filter(q => q.Solde > 0).map((q, idx) => ({
            id: idx + 1,
            police: q.Police,
            branche: q.Branche,
            numero: q.NumQuittance,
            montantImpaye: q.Solde
        }));
        response.success(res, unpaid);
    } catch (error) { response.error(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const data = await common.executeps('sp_GetReclamations', req.body, getConfig(req));
        response.success(res, data.map(r => ({
            id: r.Id,
            sujet: r.Sujet,
            client: r.Client,
            date: r.DateReclamation,
            statut: r.Statut === 'E' ? 'En cours' : r.Statut === 'T' ? 'Traité' : 'Clôturé',
            nature: r.Nature
        })));
    } catch (error) { response.error(res, error); }
};

const getMessages = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.params.id;
        const data = await common.executeps('sp_GetReclamationDetails', { FK_Reclamation_Id: targetId, ...req.body }, getConfig(req));
        response.success(res, data.map(m => ({
            id: m.Id,
            text: m.Message,
            sender: m.Nature === 'C' ? 'user' : 'admin',
            time: m.DateMessage ? new Date(m.DateMessage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
        })));
    } catch (error) { response.error(res, error); }
};

const createReclamation = async (req, res) => {
    try {
        const { sujet, nature, message } = req.body;
        const result = await common.executeps('sp_CreateReclamation', { Sujet: sujet, Nature: nature, Message: message, ...req.body }, getConfig(req));
        response.success(res, { id: result[0].Id }, 'Réclamation créée avec succès.');
    } catch (error) { response.error(res, error); }
};

const sendMessage = async (req, res) => {
    try {
        const targetId = req.body.id || req.body.Id || req.params.id;
        const { message, nature } = req.body;
        await common.executeps('sp_AddMessageReclamation', { FK_Reclamation_Id: targetId, Nature: nature || 'C', Message: message, ...req.body }, getConfig(req));
        response.success(res, null, 'Message envoyé.');
    } catch (error) { response.error(res, error); }
};

module.exports = { getPolices, getGlobalStats, getUnpaid, getReclamations, getMessages, createReclamation, sendMessage };
