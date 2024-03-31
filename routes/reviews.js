const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review.js')
const reviews = require('../controllers/reviews.js')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js');

//review route
router.route('/')
    .post(isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete route 
router.route('/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;