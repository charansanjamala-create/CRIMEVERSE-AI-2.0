"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.notFound = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    logger_1.logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            success: false,
            message,
            stack: err.stack,
            error: err,
        });
    }
    else {
        res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Internal server error' : message,
        });
    }
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map