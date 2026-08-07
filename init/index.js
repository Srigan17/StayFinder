require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");

const defaultDbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLAS_DB_URL || defaultDbUrl;

async function main() {
    try {
        await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 3000 });
        console.log("Connected to MongoDB via:", dbUrl);
    } catch (err) {
        console.log("Failed to connect to primary DB, falling back to local MongoDB:", err.message);
        await mongoose.connect(defaultDbUrl);
        console.log("Connected to local MongoDB:", defaultDbUrl);
    }
}

const sampleReviewComments = [
    { rating: 5, comment: "Absolutely breathtaking! The views were even better than the photos. Spotless and well maintained." },
    { rating: 5, comment: "One of the most memorable stays of our lives. The hosts were incredibly welcoming and helpful." },
    { rating: 4, comment: "Fantastic location and great amenities. Super comfortable bed and very peaceful atmosphere." },
    { rating: 5, comment: "A hidden gem. Everything from check-in to check-out was seamless. Highly recommended!" },
    { rating: 5, comment: "Stunning architecture and immaculate cleanliness. We cannot wait to visit again next year!" }
];

const initDB = async() => {
    try {
        await Listing.deleteMany({});
        await Review.deleteMany({});

        // 1. Ensure a demo host user exists
        let hostUser = await User.findOne({ username: "stayfinder_host" });
        if (!hostUser) {
            hostUser = new User({ email: "host@stayfinder.com", username: "stayfinder_host" });
            hostUser = await User.register(hostUser, "Password123!");
            console.log("Created demo host user: stayfinder_host");
        }

        // 2. Ensure sample reviewer users exist
        const reviewerNames = ["alex_travels", "priya_sharma", "marcus_k", "sophie_wanderer", "arjun_mehta"];
        const reviewers = [];
        for (let name of reviewerNames) {
            let reviewer = await User.findOne({ username: name });
            if (!reviewer) {
                reviewer = new User({ email: `${name}@example.com`, username: name });
                reviewer = await User.register(reviewer, "Password123!");
            }
            reviewers.push(reviewer);
        }

        console.log(`Prepared ${reviewers.length} reviewer accounts.`);

        // 3. Prepare listings with valid owner and real coordinates
        const preparedListings = [];

        for (let obj of initData.data) {
            const listingData = { ...obj };
            listingData.owner = hostUser._id;

            // Preserve real coordinates if provided, else assign fallback
            if (!listingData.geometry || !listingData.geometry.lat) {
                listingData.geometry = {
                    lat: 28.6139,
                    lng: 77.2090
                };
            }

            // Create 3-5 real reviews for each listing
            const listingReviews = [];
            for (let i = 0; i < sampleReviewComments.length; i++) {
                const sampleRev = sampleReviewComments[i];
                const reviewer = reviewers[i % reviewers.length];

                const revDoc = new Review({
                    rating: sampleRev.rating,
                    comment: sampleRev.comment,
                    owner: reviewer._id,
                    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 3)
                });
                await revDoc.save();
                listingReviews.push(revDoc._id);
            }

            listingData.reviews = listingReviews;
            preparedListings.push(listingData);
        }

        await Listing.insertMany(preparedListings);
        console.log(`Successfully initialized DB with ${preparedListings.length} rich location listings and guest reviews!`);

    } catch (err) {
        console.error("Error during DB initialization:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Mongoose disconnected.");
    }
};

main().then(() => {
    initDB();
});