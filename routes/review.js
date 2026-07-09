const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schemas.js");
const { isLoggedIn, validateReview, reviewAuthorization } = require("../middleware.js");
const reviewController = require("../controller/review.js");


// -------------------- Post Route (Add New Review) --------------------

router.post(
    "/",
    isLoggedIn,
    validateReview,
    reviewController.postReview
);

// -------------------- Delete Route (Delete Review) -------------------

router.delete("/:reviewId",
    isLoggedIn,
    reviewAuthorization,
    reviewController.deleteReview
)

module.exports = router;