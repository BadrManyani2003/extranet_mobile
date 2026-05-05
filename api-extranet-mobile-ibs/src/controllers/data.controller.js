const db = require('../utils/db');
const response = require('../utils/response');

const getCommonParams = (req) => ({
    FK_User_Id: req.user?.id || req.body.userId || 1,
    Token: req.headers.authorization?.split(' ')[1] || '',
    Source: req.headers['x-source'] || 'Mobile'
});

const formatPolices = async (req, polices) => {
    const common = getCommonParams(req);
    return Promise.all(polices.map(async (p) => {
        const [risques, sinistres, quittances] = await Promise.all([
            p.Branche === 'Santé' 
                ? db.execute('ps_GetAdherents', { ...common })
                : db.execute('ps_GetRisques', { ...common, FK_Police_Id: p.IdPolice }),
            db.execute('ps_GetSinistres', { ...common, FK_Police_Id: p.IdPolice }),
            db.execute('ps_GetQuittances', { ...common, FK_Police_Id: p.IdPolice })
        ]);

        return {
            id: p.IdPolice,
            numero: p.NumeroPolice,
            branche: p.Branche,
            client: p.Client,
            statut: p.Statut === 'A' ? 'Actif' : 'Inactif',
            dateEcheance: p.DateEcheance ? new Date(p.DateEcheance).toLocaleDateString('fr-FR') : '',
            primeAnnuelle: p.PrimeAnnuelle,
            impayes: p.TotalImpayes,
            risques: p.Branche === 'Santé' ? formatAdherents(risques) : formatRisques(risques, p.Branche),
            sinistres: sinistres.map(s => ({
                numero: s.NumeroSin,
                date: s.DateSin ? new Date(s.DateSin).toLocaleDateString('fr-FR') : '',
                nature: s.Branche,
                statut: s.Statut === 'E' ? 'En cours' : 'Clôturé',
                objet: s.Risque,
                mtDommage: s.MT_Dommages,
                mtFrais: s.MT_Franchise,
                mtRembourse: s.MT_Indemnite
            })),
            quittances: quittances.map(q => ({
                numero: q.NumQuittance,
                dateDebut: q.DateDu ? new Date(q.DateDu).toLocaleDateString('fr-FR') : '',
                dateFin: q.DateAu ? new Date(q.DateAu).toLocaleDateString('fr-FR') : '',
                montantTotal: q.Montant,
                montantImpaye: q.Solde,
                statut: q.Solde === 0 ? 'Payée' : 'Impayée'
            }))
        };
    }));
};

const formatAdherents = (data) => data.map(a => ({
    id: a.IdAdherent,
    type: 'Adhérent',
    nom: a.NomAdherent,
    numAdhesion: a.NumAdhesion,
    matricule: a.Matricule
}));

const formatRisques = (data, branche) => {
    const risksMap = new Map();
    data.forEach(r => {
        if (!risksMap.has(r.IdRisque)) {
            risksMap.set(r.IdRisque, {
                id: r.IdRisque,
                type: branche === 'Automobile' ? 'Véhicule' : 'Risque',
                marque: r.LibelleRisque,
                immatriculation: r.Identifiant,
                garanties: []
            });
        }
        if (r.IdGarantie) {
            risksMap.get(r.IdRisque).garanties.push({
                nom: r.LibelleGarantie,
                capital: r.Capital,
                franchise: r.Franchise
            });
        }
    });
    return Array.from(risksMap.values());
};

const getPolices = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const polices = await db.execute('ps_GetPolices', { ...common });
        const enriched = await formatPolices(req, polices);
        res.json(enriched);
    } catch (error) { response.error(res, error); }
};

const getGlobalStats = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const stats = await db.execute('ps_GetStats', { ...common });
        const s = stats[0];
        res.json([
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
        res.json(unpaid);
    } catch (error) { response.error(res, error); }
};

const getReclamations = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const data = await db.execute('ps_GetReclamations', { ...common });
        res.json(data.map(r => ({
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
        if (!id) return res.status(400).json({ message: 'ID requis' });
        
        const common = getCommonParams(req);
        const messages = await db.execute('ps_GetReclamations', { ...common, IdReclamation: id });
        res.json(messages.map(m => ({
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
        
        const result = await db.execute('ps_ManageReclamation', { 
            ...common, Action: 'CREATE', Sujet: sujet, Nature: nature 
        });
        const newId = result[0].NewId;
        
        if (message) {
            await db.execute('ps_ManageReclamation', { 
                ...common, Action: 'ADD_MESSAGE', IdReclamation: newId, NatureMessage: 'C', Message: message 
            });
        }
        
        res.json({ success: true, id: newId });
    } catch (error) { response.error(res, error); }
};

const sendMessage = async (req, res) => {
    try {
        const common = getCommonParams(req);
        const { id } = req.params;
        const { message } = req.body;
        
        await db.execute('ps_ManageReclamation', { 
            ...common,
            Action: 'ADD_MESSAGE',
            IdReclamation: id, 
            NatureMessage: 'C', 
            Message: message 
        });
        
        res.json({ success: true });
    } catch (error) { response.error(res, error); }
};

module.exports = { getPolices, getGlobalStats, getUnpaid, getReclamations, getMessages, createReclamation, sendMessage };
