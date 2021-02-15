const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//all routes will be redirected to this routes just because this
const router = express.Router({ mergeParams: true });

//USERS
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    );

module.exports = router;