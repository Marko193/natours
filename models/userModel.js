const mongoose = require('mongoose');
//const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        minlength: 5
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm yout password!'],
        validate: {
            //This only works on CREATE && SAVE!!!
            validator: function(el) {
                return el === this.password; //abc === abc
            },
            message: 'Passwords are not the same!'
        }
    }
});

//Passwor encryptor
userSchema.pre('save', async function(next) {
    //Only run this f() if password was modified
    if (!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;