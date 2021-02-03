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

// //we want to add into db such object
// const testTour = new Tour({
//     name: 'The Camper',
//     rating: 4.3,
//     price: 860
// });

// //save to the tour collect & DB
// //auto create collection & write data into it
// testTour
//     .save()
//     .then(doc => {
//         console.log('Successfully added to DB: ', doc);
//     })
//     .catch(err => {
//         console.log('Error: ', err);
//     });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});