// Import the User model
const User = require('../models/user');

/**
 * Render the registration form.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

/**
 * Register a new user and save it to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.body.email - The email of the new user.
 * @param {Object} req.body.username - The username of the new user.
 * @param {Object} req.body.password - The password of the new user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user has been registered and logged in.
 */

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to YelpCamp!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

/**
 * Render the login form.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

/**
 * Log in a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}

/**
 * Log out a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}