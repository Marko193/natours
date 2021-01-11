const fs = require('fs');
const express = require('express');
const app = express();

//The route - specify the root url & HTTP Get method
//The SEND method
/*
app.get('/', (req, res) => {
    //get a quick answer from the server
    res.status(200)
    //send a json object as an answer
    .json({message: 'Hello from the server side!', app: 'Natours'});
});

//the POST method
app.post('/', (req, res) => {
    res.send('Your can post to this endpoint...');
})
*/
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`));

//get a data from JSON file with GET request
app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
});

//Init the port for running our app
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});