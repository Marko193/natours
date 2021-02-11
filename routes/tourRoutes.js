const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();

//param middleware - connect to tourController
//to check on the cor val of ID
// router.param('id', tourController.checkID);

//Alias route - a template req that can be popular
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//Create a checkBody middleware
//Check if body contains the name and price property
//If not, send back 400 (bad request)
//And it to be the post handler stack

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

//Equal to 2, 4 & 5
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        //protected delete route with restriction
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

module.exports = router;