const Listing = require("./models/listing.js")
const Review = require("./models/review.js")
const { listingSchema, reviewSchema } = require("./schemas.js")
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You Must be logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();

}

module.exports.listingAuthorization = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You Dont Have Permission To Edit");
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const result = listingSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error.message);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);

    if (result.error) {
        throw new ExpressError(400, result.error.message);
    } else {
        next();
    }
};

module.exports.reviewAuthorization = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You Dont Have Permission To Delete");
        return res.redirect(`/listings/${id}`)
    }
    next();
}