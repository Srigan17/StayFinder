const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        default: 1
    },
    nights: {
        type: Number,
        default: 1
    },
    basePrice: {
        type: Number,
        required: true
    },
    cleaningFee: {
        type: Number,
        default: 600
    },
    taxes: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Confirmed", "Pending", "Cancelled"],
        default: "Confirmed"
    },
    bookingCode: {
        type: String,
        required: true,
        unique: true
    },
    guestName: String,
    guestEmail: String,
    specialRequests: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
