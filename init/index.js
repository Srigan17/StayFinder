require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const fs = require("fs");
const path = require("path");

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

        // 2. Prepare listings and save reviews
        const preparedListings = [];

        for (let obj of initData.data) {
            const listingData = { ...obj };
            listingData.owner = hostUser._id;

            // Preserve real coordinates
            if (!listingData.geometry || !listingData.geometry.lat) {
                listingData.geometry = {
                    lat: 15.5997,
                    lng: 73.7431
                };
            }

            const listingReviewIds = [];

            if (obj.reviews && Array.isArray(obj.reviews)) {
                for (let r of obj.reviews) {
                    const cleanUsername = r.author.toLowerCase().replace(/\s+/g, "_");
                    let reviewer = await User.findOne({ username: cleanUsername });
                    if (!reviewer) {
                        reviewer = new User({ email: `${cleanUsername}@example.com`, username: cleanUsername });
                        reviewer = await User.register(reviewer, "Password123!");
                    }

                    const revDoc = new Review({
                        rating: r.rating,
                        comment: r.comment,
                        owner: reviewer._id,
                        createdAt: r.date ? new Date(r.date) : new Date()
                    });
                    await revDoc.save();
                    listingReviewIds.push(revDoc._id);
                }
            }

            listingData.reviews = listingReviewIds;
            preparedListings.push(listingData);
        }

        await Listing.insertMany(preparedListings);
        console.log(`Successfully initialized DB with ${preparedListings.length} famous Indian stays and real guest reviews!`);

        // Also export to data/listings.json for Streamlit
        const jsonPath = path.join(__dirname, "..", "data", "listings.json");
        fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
        fs.writeFileSync(jsonPath, JSON.stringify(initData.data, null, 2));
        console.log("Saved updated 6 Indian listings to data/listings.json");

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