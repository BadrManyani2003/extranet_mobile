/**
 * Standardizes API responses
 */
const success = (res, data = [], message = 'Success') => {
    res.status(200).json(data); // Front-end expects the array directly or object based on current code
};

const error = (res, message = 'Internal Server Error', status = 500) => {
    console.error(`❌ API Error: ${message}`);
    res.status(status).json({
        success: false,
        message
    });
};

module.exports = {
    success,
    error
};
