const db = require('./db');

const formatters = {
    formatPolices: async (common, polices) => {
        return Promise.all(polices.map(async (p) => {
            const [risques, sinistres, quittances] = await Promise.all([
                p.Branche === 'Santé' 
                    ? db.execute('sp_GetAdherents', { ...common, FK_Police_Id: p.Id })
                    : db.execute('sp_GetRisques', { ...common, FK_Police_Id: p.Id }),
                db.execute('sp_GetSinistres', { ...common, FK_Police_Id: p.Id }),
                db.execute('sp_GetQuittances', { ...common, FK_Police_Id: p.Id })
            ]);

            return {
                id: p.Id,
                numero: p.Police,
                branche: p.Branche,
                client: p.Client,
                statut: p.Statut === 'A' ? 'Actif' : 'Inactif',
                dateEcheance: p.DateEcheance ? new Date(p.DateEcheance).toLocaleDateString('fr-FR') : '',
                primeAnnuelle: p.PrimeAnnuelle || 0,
                impayes: p.TotalImpayes || 0,
                risques: p.Branche === 'Santé' ? formatters.formatAdherents(risques) : formatters.formatRisques(risques, p.Branche),
                sinistres: formatters.formatSinistres(sinistres),
                quittances: formatters.formatQuittances(quittances)
            };
        }));
    },

    formatAdherents: (data) => data.map(a => ({
        id: a.Id,
        type: 'Adhérent',
        nom: a.Nom,
        numAdhesion: a.NumAdhesion,
        matricule: a.Matricule
    })),

    formatRisques: (data, branche) => {
        const risksMap = new Map();
        data.forEach(r => {
            if (!risksMap.has(r.Id)) {
                risksMap.set(r.Id, {
                    id: r.Id,
                    type: branche === 'Automobile' ? 'Véhicule' : 'Risque',
                    marque: r.Libelle,
                    immatriculation: r.Identifiant,
                    garanties: []
                });
            }
            // If the query returns a join with warranties, handle it here
            if (r.IdGarantie) { 
                risksMap.get(r.Id).garanties.push({
                    nom: r.LibelleGarantie,
                    capital: r.Capital,
                    franchise: r.Franchise
                });
            }
        });
        return Array.from(risksMap.values());
    },

    formatSinistres: (data) => data.map(s => ({
        numero: s.NumeroSin,
        date: s.DateSin ? new Date(s.DateSin).toLocaleDateString('fr-FR') : '',
        nature: s.Branche,
        statut: s.Statut === 'E' ? 'En cours' : s.Statut === 'T' ? 'Traité' : 'Clôturé',
        objet: s.Risque,
        mtDommage: s.MT_Dommages,
        mtFrais: s.MT_Franchise,
        mtRembourse: s.MT_Indemnite
    })),

    formatQuittances: (data) => data.map(q => ({
        numero: q.NumQuittance,
        dateDebut: q.DateDu ? new Date(q.DateDu).toLocaleDateString('fr-FR') : '',
        dateFin: q.DateAu ? new Date(q.DateAu).toLocaleDateString('fr-FR') : '',
        montantTotal: q.Montant,
        montantImpaye: q.Solde,
        statut: q.Solde === 0 ? 'Payée' : 'Impayée'
    }))
};

module.exports = formatters;
