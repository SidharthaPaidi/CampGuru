const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const flash = require('connect-flash')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

//home route

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

//error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
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
