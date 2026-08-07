const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controller/booking.js");

// Reserve a listing
router.post("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

// View user's bookings
router.get("/bookings", isLoggedIn, wrapAsync(bookingController.myBookings));

// Cancel a booking
router.post("/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
