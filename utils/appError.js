class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //to call the parent constructor

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        //ALL ERR THAT WE`RE CREATED BY OURSELVES - OPERATIONAL ERR
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;