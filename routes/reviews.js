const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/reviews.js')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { reviews, reviewSchema } = require('../schemas.js')

//middleware for review schema validation

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }

}
//review route

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete route 

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect('/campgrounds/' + id)
}))

module.exports = router;