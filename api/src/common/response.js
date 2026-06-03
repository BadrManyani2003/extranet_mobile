const success = (res, data = null, message = null) => {
    res.status(200).json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

const error = (res, err, status = 500) => {
    const isDev = process.env.NODE_ENV === 'development';
    const message = (typeof err === 'string') ? err : err.message;

    if (status >= 500) {
        console.error(`[ERREUR API] ${new Date().toISOString()}:`, err);
    }

    res.status(status).json({
        success: false,
        data: null,
        message: (status === 500 && !isDev) ? 'Une erreur interne est survenue.' : message,
        timestamp: new Date().toISOString()
    });
};

module.exports = { success, error };
