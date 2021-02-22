const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//populdating reviewModel
reviewSchema.pre(/^find/, function(next) {

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

//Create the statistics of the average & number of ratings the current tour
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([{
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

//pre - current review isn`t in a collection
//passing data from pre middleware
//to post middleware
reviewSchema.post('save', function() {
    // this points to a current model review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

//query middleware - to get data from another query middleware f()
reviewSchema.post(/^findOneAnd/, async function(next) {
    //await this.findOne(); does NOT work here, query already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;