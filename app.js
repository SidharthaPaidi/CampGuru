const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/camp-guru');

const Campground = require('./models/campground')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express()

app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

//home route

app.get('/', (req, res) => {
    res.render('home')
})

//index route
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

//adding campground route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

//creating campground route
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

//viewing campground show route
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
})

//editing campground route
app.get('/campgrounds/:id/edit', async (req, res) => {
    console.log(`Editing campground with id: ${req.params.id}`);
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })

})

//updating campground route
app.put('/campgrounds/:id', async (req, res) => {
    console.log(`Updating campground with id: ${req.params.id}`);
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
})

//deleting campground
app.delete('/campgrounds/:id', async (req,res) => {
    console.log(`Deleting campground with id: ${req.params.id}`);
    const { id } = req.params
    const deletedCampground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})






app.listen(2000 ,() => {
    console.log("Listening on Port 2000!!")
})
