const fs = require('fs');
const express = require('express');

//middleware - a f() that can modify the incoming request data
//it stands in the middle (between) of the req and response
//.use method - for middleware
const app = express();
app.use(express.json());

//our own middleware f()
//next arg - Express knows that we define middleware f()
//MUST Call next() - without it we`ll stuck
//won`t be able to move & to send res to the client
app.use((req, res, next) => {
    console.log('Hello from the middleware!');
    next();
});

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//GET ALL TOURS from JSON file with GET request 
const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
};

//get the tour with the specific ID
const getTour = (req, res) => {
    //method in JS which find elem in arr

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
};

//init a POST method - CREATE A NEW TOUR
//use migddleware - init it higher
const createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    //create a new obj by merg 2 exist objects
    const newTour = Object.assign({ id: newId }, req.body);

    //add to array new tour with new id
    tours.push(newTour);

    //push in file, before already converted into the JSON obj
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        //created recording in JSON file
        res.status(201).json({
            //status: 'success',
            data: {
                tour: newTour
            }
        });
    });
};

//A tested Version of update file (didn`t work)
const updateTour = (req, res) => {
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
};

//A tested Version of delete file (didn`t work)
const deleteTour = (req, res) => {
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    //204 - no content
    res.status(204).json({
        status: 'success',
        data: null
    });
};

//1 app.get('/api/v1/tours', getAllTours);
//2 app.get('/api/v1/tours/:id', getTour);
//3 app.post('/api/v1/tours', createTour);
//4 app.patch('/api/v1/tours/:id', updateTour);
//5 app.delete('/api/v1/tours/:id', deleteTour);

//Equal to 1 & 3
app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

//Equal to 2, 4 & 5
app
    .route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

//Init the port for running our app
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});