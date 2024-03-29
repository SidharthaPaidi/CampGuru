const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas.js')
const { isLoggedIn } = require('../middleware.js')

//middleware for schema validation
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        res.status(400).render('/views/campgrounds/error', {})
        
        throw new ExpressError(msg, 400)
    } else {
        next()
    } 
}

//index route
router.get('', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//adding campground route
router.get('/new',isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

//creating campground route
router.post('',isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
   const campground = new Campground(req.body.campground)
   campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//viewing campground show route
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author')
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

//editing campground route
router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })

}))

//updating campground route
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//deleting campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports = router;