const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const { checkIn, checkOut, guests = 1, specialRequests = "" } = req.body;

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
        const errorMsg = "Please select valid check-in and check-out dates.";
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(400).json({ success: false, message: errorMsg });
        }
        req.flash("error", errorMsg);
        return res.redirect(`/listings/${id}`);
    }

    const diffTime = Math.abs(endDate - startDate);
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const basePrice = listing.price * nights;
    const cleaningFee = 600;
    const taxes = Math.round(basePrice * 0.18); // 18% GST
    const totalPrice = basePrice + cleaningFee + taxes;

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingCode = `HS-${randomSuffix}`;

    const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        guests: Number(guests) || 1,
        nights,
        basePrice,
        cleaningFee,
        taxes,
        totalPrice,
        status: "Confirmed",
        bookingCode,
        guestName: req.user.username,
        guestEmail: req.user.email,
        specialRequests
    });

    await newBooking.save();

    if (req.xhr || req.headers.accept?.includes("json") || req.body.isAsync) {
        return res.json({
            success: true,
            message: "Reservation confirmed successfully!",
            bookingCode,
            booking: newBooking,
            redirectUrl: "/bookings"
        });
    }

    req.flash("success", `Reservation confirmed! Booking Code: ${bookingCode}`);
    res.redirect("/bookings");
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("bookings/index.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You do not have permission to cancel this booking.");
        return res.redirect("/bookings");
    }

    booking.status = "Cancelled";
    await booking.save();

    req.flash("success", `Booking ${booking.bookingCode} cancelled successfully.`);
    res.redirect("/bookings");
};
