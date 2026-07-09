const mongoose = require("mongoose");
const initData = require("./data.js");
const axios = require("axios");


const Listing = require("../models/listing.js")

const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

main().then(() => {
    console.log("Conneyted TO DB")
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data.forEach((obj) => {
        obj.owner = "6a242790878226e54ecab1f1";
    });

    initData.data.forEach((obj) => {
        obj.owner = "6a242790878226e54ecab1f1";

        obj.geometry = {
            lat: 16.3067,
            lng: 80.4365
        };
    });


    Listing.insertMany(initData.data);
    console.log("data was inititialized");
}

// async function addCategories() {

//     const listings = await Listing.find({});

//     for (let listing of listings) {
//         const title = listing.title.toLowerCase();

//         if (
//             title.includes("beach") ||
//             title.includes("sea") ||
//             title.includes("ocean")
//         ) {
//             listing.category = "Beach";
//         } else if (
//             title.includes("mountain") ||
//             title.includes("hill") ||
//             title.includes("peak")
//         ) {
//             listing.category = "Mountains";
//         } else if (
//             title.includes("camp") ||
//             title.includes("tent")
//         ) {
//             listing.category = "Camping";
//         } else if (
//             title.includes("lake")
//         ) {
//             listing.category = "Lake";
//         } else if (
//             title.includes("farm")
//         ) {
//             listing.category = "Farm";
//         } else if (
//             title.includes("castle")
//         ) {
//             listing.category = "Castle";
//         } else if (
//             title.includes("luxury")
//         ) {
//             listing.category = "Luxury";
//         } else {
//             listing.category = "City"; // default
//         }
//         await listing.save();
//     }

//     console.log("Categories added successfully!");
// }

// addCategories();

initDB();