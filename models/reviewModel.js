const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can`t be empty!'],
        unique: true,
        minlength: [5, 'A review must have more or equal than 5 symbols'],
        maxlength: [500, 'A review must have less or equal than 500 symbols']
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user!']
    }
}, {
    //for define the virtual propeties
    //not stored in DB, but calculated
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//populdating reviewModel
reviewSchema.pre(/^find/, function(next) {

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//GET /tourID/userID/reviews
//GET /tourID/userID/reviews/7845kjh
//POST /tourID/userID/reviews