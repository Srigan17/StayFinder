const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const getCoordinates = require("../utils/geocode");

module.exports.index = async (req, res) => {
    const { q, category, destination, minPrice, maxPrice, sort } = req.query;

    const filter = {};

    // 1. Text search across title, location, country, description, category
    if (q && q.trim() !== "") {
        const trimmed = q.trim();
        const regex = new RegExp(trimmed, "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex },
            { category: regex }
        ];
    }

    // 2. Category filter
    if (category && category !== "All" && category.trim() !== "") {
        filter.category = category.trim();
    }

    // 3. Quick destination pill filter
    if (destination && destination !== "All" && destination.trim() !== "") {
        const destRegex = new RegExp(destination.trim(), "i");
        filter.$or = [
            ...(filter.$or || []),
            { location: destRegex },
            { country: destRegex }
        ];
    }

    // 4. Price filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(minPrice)) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice && !isNaN(maxPrice)) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // 5. Sorting options
    let sortObj = { _id: -1 };
    if (sort === "price-asc") {
        sortObj = { price: 1 };
    } else if (sort === "price-desc") {
        sortObj = { price: -1 };
    } else if (sort === "rating-desc") {
        sortObj = { rating: -1 };
    } else if (sort === "newest") {
        sortObj = { _id: -1 };
    }

    const allListings = await Listing.find(filter).sort(sortObj);

    // Provide list of popular destinations for filter pills
    const popularDestinations = [
        "Goa", "Manali", "Jaipur", "Udaipur", "Kerala", "Paris", 
        "Santorini", "Swiss Alps", "Bali", "Kyoto", "Dubai", "New York"
    ];

    res.render("listings/index.ejs", {
        allListings,
        category: category || "",
        searchQuery: q || "",
        selectedDestination: destination || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        sort: sort || "",
        popularDestinations
    });
};

module.exports.getNew = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.myListings = async (req, res) => {
    const { category } = req.query;
    const userId = req.user._id;

    const allListings = await Listing.find({ owner: userId }).sort({ _id: -1 });

    res.render("listings/index.ejs", {
        allListings,
        category: category || "",
        searchQuery: "",
        selectedDestination: "",
        minPrice: "",
        maxPrice: "",
        sort: "",
        popularDestinations: [],
        isMyListings: true
    });
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const doc = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "owner" } })
        .populate("owner");

    if (!doc) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { doc });
};

module.exports.getEdit = async (req, res) => {
    let { id } = req.params;
    const doc = await Listing.findById(id);
    if (!doc) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = doc.image.url;
    res.render("listings/edit.ejs", { doc, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;

    if (!req.body.listing) {
        return next(new ExpressError(400, "Send valid data"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);

    if (typeof req.file !== "undefined") {
        updatedListing.image.url = req.file.path;
        updatedListing.image.filename = req.file.filename;
        await updatedListing.save();
    }

    try {
        const geometry = await getCoordinates(req.body.listing.location);
        if (geometry) {
            updatedListing.geometry = geometry;
            await updatedListing.save();
        }
    } catch (e) {
        console.warn("Geocoding failed for location:", req.body.listing.location);
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.putNew = async (req, res, next) => {
    let url = req.file ? req.file.path : "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";
    let filename = req.file ? req.file.filename : "defaultimage";

    const newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    try {
        const geometry = await getCoordinates(req.body.listing.location);
        if (geometry) {
            newListing.geometry = geometry;
        } else {
            newListing.geometry = { lat: 28.6139, lng: 77.2090 };
        }
    } catch (e) {
        newListing.geometry = { lat: 28.6139, lng: 77.2090 };
    }

    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};