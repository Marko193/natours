const Tour = require('./../models/tourModel');

exports.getAllTours = async(req, res) => {
    try {
        console.log(req.query);

        //BUILD QUERY
        //1. Filtering
        const queryObj = {...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //2) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        //regular expression
        //filter for one of this val for several times
        //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));


        //filter object for the query
        //{ difficulty: 'easy', duration: {$gte: 5} }
        //{ difficulty: 'easy', duration: { gte: '5' } }
        // gte, gt, lte, lt

        const query = Tour.find(JSON.parse(queryStr));
        //Execute query
        const tours = await query;

        //the second way of filter - like SQL query
        // const query = Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where("difficulty")
        //     .equals('easy');

        //SEND RESPONSE
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
            message: err
        })
    }
};

//update tour
exports.updateTour = async(req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //send back to the client the updated doc
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        });
    }
};

//delete tour 
exports.deleteTour = async(req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        });
    }
};

/*
//A tested Version of delete file (didn`t work)
exports.deleteTour = async(req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id, req.body, {
            new: true, //send back to the client the updated doc
            runValidators: true
        });

        res.status(204).json({
            status: 'success',
            data: tour
        });
    } catch (err) {
        res.status(404).json({
            status: 'This document doesn`t exist!',
            message: err
        });
    }
};
*/