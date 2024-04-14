// Import the Campground model
const Campground = require('../models/campground')

// Import the geocoding service from Mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// Get the Mapbox token from environment variables
const mapBoxToken = process.env.MAPBOX_TOKEN;

// Initialize the geocoder with the Mapbox token
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Import the cloudinary configuration
const { cloudinary } = require("../cloudinary");
const { query } = require('express');

// Define the index route handler
module.exports.index = async (req, res) => {
    // Find all campgrounds in the database
    const campgrounds = await Campground.find({})
    // Render the index view with the list of campgrounds
    res.render('campgrounds/index', { campgrounds })
}

// Define the new campground form route handler
module.exports.renderNewForm = (req, res) => {
    // Render the new campground form view
    res.render('campgrounds/new')
}

/**
 * Create a new campground and save it to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.campground - The data for the new campground.
 * @param {Object} req.files - The files uploaded with the request.
 * @param {Object} req.user - The current user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the campground has been saved and the user has been redirected.
 */

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()

    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    // console.log(campground)
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

/**
 * Retrieve a campground by its ID and render its page.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the campground has been retrieved and the page has been rendered.
 */

module.exports.showCampground = async (req, res) => {
    /**
     * Get a campground by its ID and populate its reviews and author.
     *
     * @param {Object} req - The request object.
     * @param {Object} req.params - The parameters extracted from the request URL.
     * @param {string} req.params.id - The ID of the campground to retrieve.
     * @returns {Promise<Object>} - A promise that resolves to the populated campground object.
     */
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

/**
 * Retrieve a campground by its ID and render the form to edit it.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the campground has been retrieved and the form has been rendered.
 */

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })

}

/**
 * Update a campground and save the changes to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground to update.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.campground - The new data for the campground.
 * @param {Object} req.files - The files uploaded with the request.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the campground has been updated and the user has been redirected.
 */

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

/**
 * Delete a campground from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the request URL.
 * @param {string} req.params.id - The ID of the campground to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the campground has been deleted and the user has been redirected.
 */

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}