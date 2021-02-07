const mongoose = require('mongoose');
const slugify = require('slugify');

//A Tour Schema - desc our data
//we have dif datatypes
//specify the data fields which will be added and doing the validation
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //a validator
        trim: true,
        unique: true
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
        required: [true, ' A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price!'] //a validator
    },
    priceDiscount: Number,
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
    }
}, {
    //for define the virtual propeties
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//virtual properties -add properties to object
//without adding it to the MongoDB
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//document middleware: runs before the .save() and .create()

//slug property, the same as name of the tour
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
    //how tour looks like before it saved into the db
    //console.log(this);
});

//DOCUMENT MIDDLEWARE
// tourSchema.pre('save', function(next) {
//     console.log('Will save document...');
//     next();
// });

// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
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
    console.log(docs);
    next();
})

//Hide the SecretTour while searching by ID
//without regular expressions
// tourSchema.pre('findOne', function(next) {
//     this.find({ secretTour: { $ne: true } });
//     next();
// });


//Create a Model by this Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;