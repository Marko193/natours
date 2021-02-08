class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //to call the parent constructor
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        //all err with this property = true 
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;