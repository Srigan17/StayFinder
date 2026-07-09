const Listing = require("../models/listing.js");
const axios = require("axios");
const getCoordinates = require("../utils/geocode");


module.exports.index = async(req, res) => {
    const { category } = req.query;
    let allListings;

    if (req.query.q) {
        allListings = await Listing.find({ category: req.query.q });

    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, category });
};



module.exports.getNew = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.myListings = async(req, res) => {
    const { category } = req.query;
    const listings = await Listing.find({});
    const userId = req.user._id;

    const allListings = listings.filter(listing =>
        listing.owner.equals(userId)
    );

    res.render("listings/index.ejs", { allListings, category });
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const doc = await Listing.findById(id).populate({ path: "reviews", populate: { path: "owner" } }).populate("owner");
    if (!doc) {
        req.flash("error", "Listing you Requested For does Not Exist");
        res.redirect("/listings")
    }
    res.render("listings/show.ejs", { doc });
}

module.exports.getEdit = async(req, res) => {
    let { id } = req.params;
    const doc = await Listing.findById(id);
    if (!doc) {
        req.flash("error", "Listing you Requested For does Not Exist");
        res.redirect("/listings")
    }
    let originalImageUrl = doc.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { doc, originalImageUrl });
}

module.exports.updateListing = async(req, res, next) => {
    let { id } = req.params;

    if (!req.body.listing) {
        next(new ExpressError(400, "Send valid data"));
    }
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);

    if (typeof req.file !== "undefined") {
        updatedListing.image.url = req.file.path;
        updatedListing.image.filename = req.file.filename;
        await updatedListing.save();
    }

    const geometry = await getCoordinates(req.body.listing.location);

    if (geometry) {
        updatedListing.geometry = geometry;
    }

    await updatedListing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.putNew = async(req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    // --------------------- Assigning Image Properties ------------------------
    newListing.image.url = url;
    newListing.image.filename = filename;


    // -------------------------- Assigning Owner ------------------------
    newListing.owner = req.user._id;

    // ----------------------- Assigning Location ---------------------------------

    const geometry = await getCoordinates(req.body.listing.location);

    if (geometry) {
        newListing.geometry = geometry;
    }

    await newListing.save();

    req.flash("success", "New Listing Created");
    res.render("listings/show.ejs", { doc: newListing });
}

module.exports.deleteListing = async(req, res) => {
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}