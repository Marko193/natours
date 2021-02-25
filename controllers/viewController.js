const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async(req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTourOverview = catchAsync(async(req, res) => {
    //1. Get the data for the req tour (including reviews & guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    //2. Duild templates

    //3. Render template using data from 1

    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    });
});