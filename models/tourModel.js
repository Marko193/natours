const mongoose = require('mongoose');
//A simple Tour Schema - desc our data
//we have a name & a datatype
//specify the schema and doing the validation
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //a validator
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price!'] //a validator
    }
});

//Create a Model by this Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;