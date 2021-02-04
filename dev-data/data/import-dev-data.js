const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        //console.log(con.connections);
        console.log('DB Connection successfully!');
    });

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//IMPORT DATA INTO COLLECTION
const importData = async() => {
    try {
        await Tour.create(tours);
        console.log('Data is successfully loaded!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

//DELETE ALL DATA FROM COLLECTION
const deleteData = async() => {
    try {
        await Tour.deleteMany(); //del all docs in the collection
        console.log('Data is successfully deleted!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData();
}

//arr of 2 arg running of this process
//console.log(process.argv);