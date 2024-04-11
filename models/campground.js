// Import the mongoose library for MongoDB interactions
const mongoose = require('mongoose');

// Import the Review model
const Review = require('./review')

// Create a mongoose Schema object
const Schema = mongoose.Schema;

// Define an ImageSchema with url and filename fields
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Define a virtual property 'thumbnail' on the ImageSchema
// This property takes the url of the image and modifies it to get the thumbnail version
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});


// This option will ensure that when a campground is converted to JSON, the virtual properties are included
const opts = { toJSON: { virtuals: true } };

// Define a CampgroundSchema with a title field
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Define a virtual property 'properties.popUpMarkup' on the CampgroundSchema
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

// Define a post middleware for the 'findOneAndDelete' method on the CampgroundSchema
// This middleware will run after a document is found and deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // Check if a document was found and deleted
    if (doc) {
        // If a document was found and deleted, delete all reviews associated with it
        // The reviews to delete are identified by their _id field, which should be in the 'reviews' array of the deleted document
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})



/**
 * Export the Campground model.
 *
 * @type {mongoose.Model} - The Campground model, which is a mongoose model constructed with the CampgroundSchema.
 */

module.exports = mongoose.model('Campground', CampgroundSchema); 