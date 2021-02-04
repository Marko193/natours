//const fs = require('fs');
const Tour = require('./../models/tourModel');

// Import data from JSON file, not DB 
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//param middleware - to check id
//it`s called inside of each tour controller
//middleware stack - pipeline
// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     //method in JS which find elem in arr
//     if (req.params.id > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     next();
// }

//param middleware for checking createTour F()
// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'missing name or price'
//         });
//     }
//     next();
// };

exports.getAllTours = async(req, res) => {
    try {
        const tours = await Tour.find();

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        })
    }

};

//get the tour with the specific ID
exports.getTour = async(req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id: req.params.id})
        res.status(200).json({
            status: 'success',
            data: {
                tour //didn`t show the tour with id
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        })
    }
};

//init a POST method - CREATE A NEW TOUR
//async/await - returns promises
exports.createTour = async(req, res) => {
    try {
        //create a tour by the schema
        // const newTour = new Tour({
        //     newTour.save()
        // })

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'Fail!',
            message: "Invalid data sent!"
        })
    }
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