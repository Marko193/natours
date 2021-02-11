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
    role: {
        type: String,
        emun: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please, create a password!'],
        minlength: 5,
        select: false
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
    },
    passwordChangedAt: {
        type: Date

    }
});

//Password encryptor
userSchema.pre('save', async function(next) {
    //Only run this f() if password was modified
    if (!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

//Checking password - compare encrypted password with non-encrypted
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

//Check if user changed password 
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        //console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp; //100 < 200
    }

    //False - not changed
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;