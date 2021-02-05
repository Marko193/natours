const { Query } = require('mongoose');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

//Implement the alias middleware f()
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

exports.getAllTours = async(req, res) => {
    try {

        //EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;

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

//get the statistics about the different tours
//Using Aggregation Pipeline Operators 
exports.getTourStats = async(req, res) => {
    try {
        const stats = await Tour.aggregate([{
                $match: {
                    ratingsAverage: { $gte: 4.5 }
                }
            },
            {
                //group docs together using accumulators
                $group: {
                    //match tours by difficulty on 3 groups
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 }, //the num of tours for an each of difficulties
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                //sort every cat by average price
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: {
            //         //not equal to ...
            //         _id: { $ne: 'EASY' }
            //     }
            // }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        });
    }
};

//agregation pipeline 
//count how many tours there're for each of the months in a given year
exports.getMonthlyPlan = async(req, res) => {
    try {
        const year = req.params.year * 1; //2021
        const monthPlan = await Tour.aggregate([{
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        //search for dates between 01.01.2021 - 31.12.2021
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    //how many tours
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                //ID doesn`t shown
                $project: { _id: 0 }
            },
            {
                //sort by descending
                $sort: { numTourStarts: -1 }
            },
            {
                //the limit of printing values
                $limit: 12
            }

        ]);

        res.status(200).json({
            status: 'success',
            data: {
                monthPlan
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'Fail!',
            message: err
        });
    }
}