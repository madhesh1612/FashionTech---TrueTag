const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            error: 'Duplicate key error',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = { errorHandler };