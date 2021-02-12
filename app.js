const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const expressMongoSanitize = require('express-mongo-sanitize');

//middleware - a f() that can modify the incoming request data
//it stands in the middle (between) of the req and response
//.use method - for middleware
const app = express();

//1. GLOBAL MIDDLEWARES
//Security HTTP headers
app.use(helmet());

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit requests from the same API
//100 req from the same ip from the same req in 1 hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later!'
});
//for all of the roues, which starts with this URL
app.use('/api', limiter);

//BODY PARSER, reading data from the body into req.body
//http://localhost:3000/overview.html
app.use(express.json({
    limit: '10kb'
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution - start only with the last one
//whitelist of arg, which are allowed to be duplicated
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
});

//ROUTES
//Mounting a new route on a router
//Can`t use before declaring
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


//for all others URL`s, which didn`t handle before
//after all of the routes!!!
app.all('*', (req, res, next) => {
    //Init error
    // const err = new Error(`Can't find ${ req.originalUrl } on this server!`);
    // err.status = "fail";
    // err.statusCode = 404;
    next(new AppError(`Can't find ${ req.originalUrl } on this server!`, 404));
});

//A GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;