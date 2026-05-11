const dataService = require('../services/data.service');
const wrap = require('../common/controllerWrapper');

module.exports = {
    getPolices:          wrap(dataService.getPolices),
    getSinistres:        wrap(dataService.getSinistres),
    getSinistresEnCours: wrap(dataService.getSinistresEnCours),
    getRisques:          wrap(dataService.getRisques),
    getGaranties:        wrap(dataService.getGaranties),
    getQuittances:       wrap(dataService.getQuittances),
    getImpayes:          wrap(dataService.getImpayes),
    getAdherents:        wrap(dataService.getAdherents),
    getPersACharge:      wrap(dataService.getPersACharge),
    getStats:            wrap(dataService.getStats),
    getStatsByPolice:    wrap(dataService.getStatsByPolice, true)
};