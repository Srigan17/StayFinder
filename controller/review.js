const Listing = require("../models/listing");
const Review = require("../models/review")
const { generateReviewSummary } = require("../services/AI/reviewSummarizer.js");

console.log(generateReviewSummary);

module.exports.postReview = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.owner = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    try {
        console.log("abt to call AI");
        await generateReviewSummary(id);
    } catch (err) {
        console.error("AI summary generation failed:", err);
    }

    req.flash("success", "New Review Created");
    res.redirect(`/listings/${id}`);

}

module.exports.deleteReview = async(req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);

    try {
        await generateReviewSummary(id);
    } catch (err) {
        console.error("AI summary generation failed:", err);
    }

    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);

}