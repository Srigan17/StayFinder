const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js")

defaultImageUrl = "https://unsplash.com/photos/a-tall-red-building-with-lots-of-windows-q1hVW8rhzFk"

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: defaultImageUrl
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        lat: Number,
        lng: Number,
    },
    category: {
        type: String,
        enum: [
            "Beach",
            "Mountains",
            "Camping",
            "Arctic",
            "Desert",
            "Forest",
            "Lake",
            "City",
            "Countryside",
            "Historical",
            "Castle",
            "Farm",
            "Luxury",
            "Adventure"
        ],
        default: "City"

    },
    aiSummary: {
        positives: [String],
        negatives: [String],
        overall: String,
        sentiment: Number,
        updatedAt: Date
    }
})

listingSchema.post("findOneAndDelete", async(listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});



const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;