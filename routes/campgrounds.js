const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');
const campground = require('../models/campground');
const multer  = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


//index route and creating campground route
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground,  catchAsync(campgrounds.createNewCampground))
    

//adding campground route
router.route('/new')
    .get(isLoggedIn, campgrounds.renderNewForm)

//viewing campground show route ,updating campground route, deleting campground
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    
//editing campground route
router.route('/:id/edit')
.get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;