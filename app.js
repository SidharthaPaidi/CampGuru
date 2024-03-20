const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const {campgroundSchema , reviews, reviewSchema} = require('./schemas.js')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/reviews.js')
const campground = require('./models/campground')

const campgrounds = require('./routes/campgrounds')

mongoose.set('strict', true);
mongoose.connect('mongodb://127.0.0.1:27017/camp-guru');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))


//middleware for review schema validation

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next()
    }

}

//home route

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/campgrounds', campgrounds)




//review route

app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete route 

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req, res) => {
    const {id , reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect('/campgrounds/'+id)
}))

app.all('*',(req, res, next) => {
    next(new ExpressError('Page not Found',404))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(2000, () => {
    console.log("Listening on Port 2000!!")
})
