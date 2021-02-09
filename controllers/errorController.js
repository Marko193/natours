/* eslint-disable no-console */
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

//take care about production mode
const handleDuplicateFieldsDB = err => {

    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/*
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpired = () =>
    new AppError('Your token has expired! Please log in again.', 401);
*/

const sendErrorDev = (err, req, res) => {
    // A) API
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

        //programing or other unknown error: don`t leak error details
    } else {
        // Programming or other unknown error
        // 1) Log error
        console.error('ERROR 💥: ', err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};
// B) RENDERED WEBSITE
// Operational, trusted error: send message to client

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err };
        error.message = err.message;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        //error of duplicate DB fields 
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidatorError') error = handleValidationErrorDB(error);

        // if (error.name === 'JsonWebTokenError') error = handleJWTError();
        //if (error.name === 'TokenExpiredError') error = handleJWTExpired();

        sendErrorProd(error, req, res);
    }
};