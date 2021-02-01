const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//param middleware - to check id
//it`s called inside of each tour controller
//middleware stack - pipeline
exports.checkID = (req, res, next, val) => {
    console.log(`Tour id is: ${val}`);
    //method in JS which find elem in arr
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    next();
}

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours
        }
    });
};

//get the tour with the specific ID
exports.getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1; //convert str to num 
    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        data: {
            tour //didn`t show the tour with id
        }
    });
};

//init a POST method - CREATE A NEW TOUR
//use migddleware - init it higher
exports.createTour = (req, res) => {
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
exports.updateTour = (req, res) => {

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here>'
        }
    });
};

//A tested Version of delete file (didn`t work)
exports.deleteTour = (req, res) => {
    //204 - no content
    res.status(204).json({
        status: 'success',
        data: null
    });
};