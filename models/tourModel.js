const mongoose = require('mongoose');

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
        default: Date.now()
    },
    startDates: [Date] //not auto add it to arr, but parse str to date-time
});

//Create a Model by this Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;