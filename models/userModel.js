const mongoose = require('mongoose');
//const slugify = require('slugify');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name!'],
        trim: true,
        unique: true,
        minlength: [2, 'A user name must have more or equal than 2 symbols!'],
        maxlength: [30, 'A user name must have less or equal than 30 symbols!']
    },
    email: {
        type: String,
        required: [true, 'A user must have got an e-mail'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Your e-mail is invalid!']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please, create a password!'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm yout password!']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;