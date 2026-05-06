const db = require('./db');

/**
 * Expert formatters for insurance data
 */
const formatters = {
    /**
     * Formats multiple policies with their risks, claims and receipts
     */
    formatPolices: async (common, polices) => {
        return Promise.all(polices.map(async (p) => {
            const [risques, sinistres, quittances] = await Promise.all([
                p.Branche === 'Santé' 
                    ? db.execute('ps_GetAdherents', { ...common, FK_Police_Id: p.IdPolice })
                    : db.execute('ps_GetRisques', { ...common, FK_Police_Id: p.IdPolice }),
                db.execute('ps_GetSinistresByPolice', { ...common, FK_Police_Id: p.IdPolice }),
                db.execute('ps_GetQuittancesByPolice', { ...common, FK_Police_Id: p.IdPolice })
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
                risques: p.Branche === 'Santé' ? formatters.formatAdherents(risques) : formatters.formatRisques(risques, p.Branche),
                sinistres: formatters.formatSinistres(sinistres),
                quittances: formatters.formatQuittances(quittances)
            };
        }));
    },

    formatAdherents: (data) => data.map(a => ({
        id: a.IdAdherent,
        type: 'Adhérent',
        nom: a.NomAdherent,
        numAdhesion: a.NumAdhesion,
        matricule: a.Matricule
    })),

    formatRisques: (data, branche) => {
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
    },

    formatSinistres: (data) => data.map(s => ({
        numero: s.NumeroSin,
        date: s.DateSin ? new Date(s.DateSin).toLocaleDateString('fr-FR') : '',
        nature: s.Branche,
        statut: s.Statut === 'E' ? 'En cours' : 'Clôturé',
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
