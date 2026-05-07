const response = {
    success: (res, data, message = 'Success') => {
        res.json({ success: true, message, data });
    },
    
    error: (res, error) => {
        console.error('❌ API Error:', error.message || error);
        res.status(error.status || 500).json({ 
            success: false, 
            message: error.message || 'Une erreur interne est survenue.',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

module.exports = response;
