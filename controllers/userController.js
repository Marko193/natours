//const fs = require('fs');
//const APIFeatures = require('./../utils/apiFeatures');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

//USERS ROUTES

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

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route isn`t implem yet!'
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route isn`t implem yet!'
    });
};