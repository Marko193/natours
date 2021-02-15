const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Implement the alias middleware f()
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

exports.getAllTours = catchAsync(async(req, res, next) => {
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
});

//get the tour with the specific ID
exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    //404 Not Found Errors
    if (!tour) {
        return next(new AppError('No tour found with such ID!', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

//update tour
exports.updateTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //send back to the client the updated doc
        runValidators: true
    });

    //404 Not Found Errors
    if (!tour) {
        return next(new AppError('No tour found with such ID!', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
    });
});

//delete tour 
exports.deleteTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id, req.body);

    //404 Not Found Errors
    if (!tour) {
        return next(new AppError('No tour found with such ID!', 404))
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

//get the statistics about the different tours
//Using Aggregation Pipeline Operators 
exports.getTourStats = catchAsync(async(req, res, next) => {
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
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

//agregation pipeline 
//count how many tours there're for each of the months in a given year
exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
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
});