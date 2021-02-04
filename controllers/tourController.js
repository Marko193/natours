const Tour = require('./../models/tourModel');

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