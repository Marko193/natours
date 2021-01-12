const fs = require('fs');
const express = require('express');

const app = express();

//middleware - a f() that can modify the incoming request data
//it stands in the middle (between) of the req and response
app.use(express.json());

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
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//GET ALL TOURS from JSON file with GET request 
app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
});

//get the tour with the specific ID
app.get('/api/v1/tours/:id', (req, res) => {
    //method in JS which find elem in arr
    // console.log(req.params.id);
    //tour.toString();
    //console.log(tour);

    console.log(req.params);
    const id = req.params.id * 1; //convert str to num 
    const tour = tours.find(el => el.id === id);

    //if(id > tours.length) {
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour //didn`t show the tour with id
        }
    });
});

//init a POST method - CREATE A NEW TOUR
//use migddleware - init it higher
app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    //create a new obj by merg 2 exist objects
    const newTour = Object.assign({ id: newId }, req.body);

    //add to array new tour with new id
    tours.push(newTour);

    //push in file, before already converted into the JSON obj
    fs.writeFile(`${__dirname}/dev-data/data/tours.json`, JSON.stringify(tours), err => {
        //created recording in JSON file
        res.status(201).json({
            //status: 'success',
            data: {
                tour: newTour
            }
        });
    });
});

app.patch('/api/v1/tours/:id', (req, res) => {
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here>'
        }
    });
});

//Init the port for running our app
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});