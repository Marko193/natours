const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
//const validator = require('validator');


//A Tour Schema - desc our data
//we have dif datatypes
//specify the data fields which will be added and doing the validation
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //a built-in data-validator
        trim: true,
        unique: true,
        minlength: [10, 'A tour name must have more or equal than 10 symbols'],
        maxlength: [50, 'A tour name must have less or equal than 50 symbols']
            //validator lib method - check if the string contains only letters (a-zA-Z).
            // validate: [validator.isAlpha, 'Tour name must only contain characters!']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, ' A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, ' A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, ' A tour must have a difficulty'],
        emun: {
            values: ['easy', 'medium', 'hard'],
            message: 'Invalid value!'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be more or equal to 1.0'],
        max: [5, 'Rating must be more or equal to 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price!'] //a validator
    },
    //price discount = 100 < price 200
    //function of validation
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(value) {
                //this only points to current doc on NEW document creation
                return value < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'
        }
    },
    summary: {
        type: String,
        trim: true, //only for str - remove all spaces in the beg and end
        required: [true, 'A tour must have a description!']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image!']
    },
    images: [String],
    createdAt: { //the time, when the tour was created
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date], //not auto add it to arr, but parse str to date-time
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GEOJSON - Geospatial Data - for location
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    //implemented CHILD REFERENCING of Adding a Tour
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    //for define the virtual propeties
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//virtual populate - add properties to object
//without adding it to the MongoDB
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//Virtual populate: tours and reviews
//connect tours & reviews models together
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//document middleware: runs before the .save() and .create()

//slug property, the same as name of the tour
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
    //how tour looks like before it saved into the db
    //console.log(this);
});

// //EMBEDDING
// //create a new doc - TOUR with users-guides by their ID`s
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

//QUERY MIDDLEWARE
//Secret tour field - secretTour: true - don`t appear in the PostMan
//Hide ALL STRINGS, WHICH STARTS WITH FIND
tourSchema.pre(/^find/, function(next) {
    //tourSchema.pre('find', function(next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

//post req with all info about not-secret tours
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
        //console.log(docs);
    next();
});

// tourSchema.pre(/^find/, function(docs, next) {
//     this.populate({
//         path: 'guides',
//         select: '-__v -passwordChangedAt'
//     });
//     next();
// });

//Hide the SecretTour while searching by ID
//without regular expressions
// tourSchema.pre('findOne', function(next) {
//     this.find({ secretTour: { $ne: true } });
//     next();
// });

//AGREGATION MIDDLEWARE
//hide secretTour from tour-stat query
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    });
    console.log(this.pipeline());
    next();
})

//Create a Model by this Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;