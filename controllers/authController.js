const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { request } = require('http');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });;
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);
    // const newUser = await User.create({
    //     //allowed only neccessary data that we need
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm
    // });

    const token = signToken(newUser._id);


    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async(req, res, next) => {
    // const email = req.body.email;
    const { email, password } = req.body;

    //1) Check if email & pasword exist
    if (!email || !password) {
        //without return - will get error of sent headers
        return next(new AppError('Please provide email and password!', 400));
    }

    //2) Check if the user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password');
    console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password!', 401));
    }

    //3)If all is ok, send JWT to the client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});

//protecting tour routes
exports.protect = catchAsync(async(req, res, next) => {
    //1. Getting JWT and check of it`s there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get an access!', 401));
    }

    //2. Verification JWT (!!!)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    //3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user, belonged to this token, doesn`t exist!'), 401);
    }

    //4. Check if user changed password after the JWT was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again!', 401));
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

//Restriction of certain routes (deleting tours) for admins only
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles - arr ['admin', 'lead-guide'].role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not allowed to perform this action', 403));
        }
        next();
    };
};

//reset password
exports.forgotPassword = catchAsync(async(req, res, next) => {
    //1. Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with such an email address!', 404));
    }

    //2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3. Send it user`s email to mailtrap.io
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token has send to email!'
        });
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error, while sending the email! Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    //1. Get user based on the token
    //encrypt the sended token & compare with token from db
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //If token hasn`t expired...
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2. If there is exists such a user -> Set the new password 
    if (!user) {
        return next(new AppError('Token is invalid or it has been expired!', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save();

    //3. Update changedPasswordAt property for the user
    //4. Log the user in, send JWT
    //sometimes token created before the password was changed
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});