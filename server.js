const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//We should define in a config file _LOCAL and _GLOBAL var for connection
//    .connect(process.env.DATABASE_LOCAL, {  //connection to the local DB

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        //console.log(con.connections);
        console.log('DB Connection successfully!');
    })

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
        required: [true, 'A tour must have a price!']
    }
});

//Create a Model by this Schema
const Tour = mongoose.model('Tour', tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});