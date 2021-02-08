const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//middleware - a f() that can modify the incoming request data
//it stands in the middle (between) of the req and response
//.use method - for middleware
const app = express();

//1. Middlewares
//get the info about req
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//serve static files FROM FOLDER - get access to overview.html
//look in public folder by default
//http://localhost:3000/overview.html
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//our own middleware f()
//next arg - Express knows that we define middleware f()
//MUST Call next() - without it we`ll stuck
//won`t be able to move & to send res to the client
// app.use((req, res, next) => {
//     console.log('Hello from the middleware!');
//     next();
// });

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
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
    // res.status(404).json({
    //     status: 'Fail!',
    //     message: `Can't find ${ req.originalUrl } on this server!`
    // });

    //Init error
    const err = new Error(`Can't find ${ req.originalUrl } on this server!`);
    err.status = "fail";
    err.statusCode = 404;

    next(err);
});

//A GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

module.exports = app;