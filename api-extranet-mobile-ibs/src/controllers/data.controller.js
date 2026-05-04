const db = require('../utils/db');
const response = require('../utils/response');

const formatPolices = async (polices) => {
    return Promise.all(polices.map(async (p) => {
        const [risques, sinistres, quittances] = await Promise.all([
            p.Branche === 'Santé' 
                ? db.execute('ps_GetAdherentsByUser', { FK_User_Id: p.IdUser || 1 })
                : db.execute('ps_GetRisquesByPolice', { FK_Police_Id: p.IdPolice }),
            db.execute('ps_GetSinistresByPolice', { FK_Police_Id: p.IdPolice }),
            db.execute('ps_GetQuittancesByPolice', { FK_Police_Id: p.IdPolice })
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
        const userId = req.user?.id || req.body.userId || 1;
        const polices = await db.execute('ps_GetPolicesByUser', { FK_User_Id: userId });
        const enriched = await formatPolices(polices);
        res.json(enriched);
    } catch (error) { response.error(res, error); }
};

const getGlobalStats = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 1;
        const stats = await db.execute('ps_GetGlobalStatsByUser', { FK_User_Id: userId });
        const s = stats[0];
        res.json([
            { id: 1, title: 'total_policies', value: s.TotalPolices.toString(), change: '+2%', icon: 'ShieldCheck', color: 'text-slate-900', bg: 'bg-slate-100' },
            { id: 2, title: 'pending_claims', value: s.SinistresEnCours.toString(), change: '0%', icon: 'Activity', color: 'text-slate-600', bg: 'bg-slate-50' },
            { id: 3, title: 'total_unpaid', value: `${s.TotalImpayes.toLocaleString()} MAD`, change: '-5%', icon: 'AlertCircle', color: 'text-slate-900', bg: 'bg-slate-200' }
        ]);
    } catch (error) { response.error(res, error); }
};

const getUnpaid = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 1;
        const data = await db.execute('ps_GetQuittancesByUser', { FK_User_Id: userId });
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
        const userId = req.user?.id || req.body.userId || 1;
        const data = await db.execute('ps_GetReclamationsByUser', { FK_User_Id: userId });
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
        
        const messages = await db.execute('ps_GetReclamationDetail', { IdReclamation: id });
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
        const userId = req.user?.id || req.body.userId || 1;
        const { sujet, nature, message } = req.body;
        
        const result = await db.execute('ps_CreateReclamation', { 
            FK_User_Client: userId, Sujet: sujet, Nature: nature 
        });
        const newId = result[0].NewId;
        
        await db.execute('ps_AddMessageReclamation', { 
            FK_Reclamation_Id: newId, FK_User_Id: userId, Nature: 'C', Message: message 
        });
        
        res.json({ success: true, id: newId });
    } catch (error) { response.error(res, error); }
};

const sendMessage = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 1;
        const { id } = req.params;
        const { message } = req.body;
        
        await db.execute('ps_AddMessageReclamation', { 
            FK_Reclamation_Id: id, 
            FK_User_Id: userId, 
            Nature: 'C', 
            Message: message 
        });
        
        res.json({ success: true });
    } catch (error) { response.error(res, error); }
};

module.exports = { getPolices, getGlobalStats, getUnpaid, getReclamations, getMessages, createReclamation, sendMessage };
