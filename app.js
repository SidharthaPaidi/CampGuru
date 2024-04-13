// If the application is not in production mode, load environment variables from a .env file
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

// Log the value of the SECRET environment variable to the console
console.log(process.env.SECRET)

// Import the express module to create an Express application
const express = require('express')

// Import the path module for working with file and directory paths
const path = require('path')

// Import the mongoose module for MongoDB object modeling
const mongoose = require('mongoose')

// Import the ejs-mate module for enhanced EJS layouts
const ejsMate = require('ejs-mate')

// Import the express-session module for managing session data
const session = require('express-session')

// Import the ExpressError utility for creating Express error objects
const ExpressError = require('./utils/ExpressError')

// Import the method-override module for using HTTP verbs such as PUT and DELETE in places where the client doesn't support it
const methodOverride = require('method-override')

// Import the connect-flash module for storing messages in session data and displaying them after redirects
const flash = require('connect-flash')

// Import the passport module for authentication
const passport = require('passport')

// Import the passport-local module for local (username and password) authentication
const LocalStrategy = require('passport-local')

// Import the User model
const User = require('./models/user')

// Import the express-mongo-sanitize module for sanitizing user input to prevent MongoDB Operator Injection
const mongoSanitize = require('express-mongo-sanitize');

// Import the campground routes
const campgroundRoutes = require('./routes/campgrounds')

// Import the review routes
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

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

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);


/**
 * Configuration object for session management.
 * @typedef {Object} SessionConfig
 * @property {string} secret - The secret used to sign the session ID cookie.
 * @property {boolean} resave - Determines whether the session should be saved back to the session store, even if it wasn't modified.
 * @property {boolean} saveUninitialized - Determines whether a new but not modified session should be saved to the session store.
 * @property {Object} cookie - Configuration options for the session cookie.
 * @property {boolean} cookie.httpOnly - Determines whether the cookie is accessible only through the HTTP protocol.
 * @property {number} cookie.expires - The expiration date of the cookie in milliseconds since the Unix Epoch.
 * @property {number} cookie.maxAge - The maximum age of the cookie in milliseconds.
 */

/**
 * Configuration object for session management.
 * @type {SessionConfig}
 */
const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


//home route

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/contacts', (req, res) => {
    res.render('contacts');
});

//error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('campgrounds/error', { err })
})

app.listen(2000, () => {
    console.log("Listening on Port 2000!!")
})
