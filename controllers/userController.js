//const fs = require('fs');
//const APIFeatures = require('./../utils/apiFeatures');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//USERS ROUTES

const filterObj = (obj, ...allowedFields) => {
    //loop throw in obj
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

//active property set to true
exports.getAllUsers = catchAsync(async(req, res, next) => {
    const users = await User.find();

    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users: users
        }
    });
});

//update the current user data
exports.updateMe = catchAsync(async(req, res, next) => {
    //1. Create err if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route isn`t for password updates! Please use /updateMyPassword', 400));
    }

    //2. Filtered out unwanted fields names that are not allowed to be updated
    //body.role: 'admin' - don`t let the user to change his status
    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route isn`t implem yet!'
    });
};

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route isn`t implem yet!'
    });
};

//ADMINS ONLY && NOT THE PASSWORD!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);