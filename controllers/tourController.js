const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//Implement the alias middleware f()
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

//Ф-ЦИИ ЗАМЫКАНИЯ
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.094035,-118.541418/unit/mi

//Get tours within
exports.getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide lattitr and longitude in the format lat,lng.', 400));
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

//Calculatin Distances
exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide lattitr and longitude in the format lat,lng.', 401));
    }

    const distances = Tour.aggregate([{
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});