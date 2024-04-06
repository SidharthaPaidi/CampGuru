// Import the Campground model
const Campground = require('../models/campground');

// Import the Review model
const Review = require('../models/review');

/**
 * Create a new review and save it to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground to add a review to.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.review - The data for the new review.
 * @param {Object} req.user - The current user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the review has been saved and the user has been redirected.
 */
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

/**
 * Delete a review from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground the review belongs to.
 * @param {string} req.params.reviewId - The ID of the review to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the review has been deleted and the user has been redirected.
 */

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect('/campgrounds/' + id)
}