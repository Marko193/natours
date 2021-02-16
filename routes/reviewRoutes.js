const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//all routes will be redirected to this routes just because this
const router = express.Router({ mergeParams: true });

//no one can access to the routes below without auth
router.use(authController.protect);

//USERS
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;