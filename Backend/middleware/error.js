const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong';

    // wrong mongoose id
    if (err.name === 'CastError') {
        const message = `Source not found with id ${err.value}`;
        err = new ErrorHandler(message, 400);
    }
    if (err.code===11000) {
        const message = `Duplicate field value: ${err.keyValue.name}`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === 'JsonWebTokenError') {
        const message = `Invalid token`;
        err = new ErrorHandler(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = `Token expired`;
        err = new ErrorHandler(message, 401);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}