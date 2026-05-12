/**
 * Standardizes API responses
 */
const success = (res, data = [], message = 'Success') => {
    res.status(200).json(data);
};

const error = (res, message = 'Internal Server Error', status = 500) => {
    res.status(status).json({ success: false, message });
};

module.exports = {
    success,
    error
};
